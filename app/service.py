import asyncio
import logging

from pydantic import BaseModel

from app.matching import YarnMatcher
from app.models import Pattern, YarnDetail, YarnSearchResult
from app.ravelry_client import RavelryClient

logger = logging.getLogger(__name__)

SIMILAR_YARN_LIMIT = 10
SIMILAR_YARNS_PER_PAGE = 10
MAX_CONCURRENT_PATTERN_REQUESTS = 2


class MatchedPattern(BaseModel):
    pattern: Pattern
    match_type: str  # "exact" or "similar"
    matched_yarn: YarnSearchResult | None = None  # None for exact matches


class YarnPatternMatches(BaseModel):
    source_yarn: YarnDetail
    similar_yarns: list[YarnSearchResult]
    patterns: list[MatchedPattern]
    current_page: int
    total_pages: int
    has_more: bool


async def find_patterns_for_yarn(
    client: RavelryClient,
    matcher: YarnMatcher,
    yarn_id: int,
    pattern_query: str = "",
    page: int = 1,
    category: str | None = None,
) -> YarnPatternMatches:
    logger.info(f"Finding patterns for yarn ID {yarn_id}, page {page}")
    source_yarn = await client.get_yarn(yarn_id)
    logger.info(f"Source yarn: {source_yarn.name}")

    attribute_query = matcher.build_attribute_query(source_yarn)
    logger.info(f"Matching query: {attribute_query}")
    similar = await client.search_yarns_by_attributes(attribute_query)
    logger.info(f"Found {len(similar.yarns)} similar yarn(s)")

    all_similar = sorted(
        similar.yarns, key=lambda y: y.rating_average or 0, reverse=True
    )
    all_similar = [y for y in all_similar if y.id != source_yarn.id]

    start_idx = (page - 1) * SIMILAR_YARNS_PER_PAGE
    end_idx = start_idx + SIMILAR_YARNS_PER_PAGE
    page_similar = all_similar[start_idx:end_idx]

    total_pages = (len(all_similar) + SIMILAR_YARNS_PER_PAGE - 1) // SIMILAR_YARNS_PER_PAGE
    has_more = page < total_pages

    if not page_similar:
        logger.info(f"No similar yarns for page {page}")
        return YarnPatternMatches(
            source_yarn=source_yarn,
            similar_yarns=[],
            patterns=[],
            current_page=page,
            total_pages=total_pages,
            has_more=has_more,
        )

    logger.info("Fetching patterns for exact source yarn")
    source_query = source_yarn.name
    if pattern_query:
        source_query = f"{source_query} {pattern_query}"
    exact_response = await client.search_patterns(source_query, category=category)
    exact_patterns = exact_response.patterns
    logger.info(f"Found {len(exact_patterns)} exact-match pattern(s)")

    logger.info(
        f"Page {page}: fetching patterns for {len(page_similar)} similar yarn(s) "
        f"(max {MAX_CONCURRENT_PATTERN_REQUESTS} concurrent)"
    )

    semaphore = asyncio.Semaphore(MAX_CONCURRENT_PATTERN_REQUESTS)

    async def search_with_limit(yarn):
        async with semaphore:
            query = yarn.name
            if pattern_query:
                query = f"{query} {pattern_query}"
            return await client.search_patterns(query, category=category)

    pattern_responses = await asyncio.gather(
        *(search_with_limit(y) for y in page_similar)
    )

    seen_ids: set[int] = set()
    matched_patterns: list[MatchedPattern] = []

    for pattern in exact_patterns:
        if pattern.id not in seen_ids:
            seen_ids.add(pattern.id)
            matched_patterns.append(MatchedPattern(pattern=pattern, match_type="exact"))

    for i, response in enumerate(pattern_responses):
        yarn = page_similar[i]
        for pattern in response.patterns:
            if pattern.id not in seen_ids:
                seen_ids.add(pattern.id)
                matched_patterns.append(
                    MatchedPattern(pattern=pattern, match_type="similar", matched_yarn=yarn)
                )

    exact_count = sum(1 for mp in matched_patterns if mp.match_type == "exact")
    similar_count = sum(1 for mp in matched_patterns if mp.match_type == "similar")
    logger.info(
        f"Page {page}: {exact_count} exact + {similar_count} similar = "
        f"{len(matched_patterns)} total unique pattern(s)"
    )

    exact_patterns_list = [mp for mp in matched_patterns if mp.match_type == "exact"]
    similar_patterns_list = [mp for mp in matched_patterns if mp.match_type == "similar"]

    exact_patterns_list.sort(key=lambda mp: mp.pattern.rating_average or 0, reverse=True)
    similar_patterns_list.sort(
        key=lambda mp: mp.pattern.rating_average or 0, reverse=True
    )

    final_patterns = exact_patterns_list + similar_patterns_list

    return YarnPatternMatches(
        source_yarn=source_yarn,
        similar_yarns=page_similar,
        patterns=final_patterns,
        current_page=page,
        total_pages=total_pages,
        has_more=has_more,
    )
