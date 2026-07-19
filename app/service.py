import asyncio
import logging

from pydantic import BaseModel

from app.matching import YarnMatcher
from app.models import Pattern, YarnDetail, YarnSearchResult
from app.ravelry_client import RavelryClient

logger = logging.getLogger(__name__)

SIMILAR_YARN_LIMIT = 10
MAX_CONCURRENT_PATTERN_REQUESTS = 2


class YarnPatternMatches(BaseModel):
    source_yarn: YarnDetail
    similar_yarns: list[YarnSearchResult]
    patterns: list[Pattern]


async def find_patterns_for_yarn(
    client: RavelryClient, matcher: YarnMatcher, yarn_id: int
) -> YarnPatternMatches:
    logger.info(f"Finding patterns for yarn ID {yarn_id}")
    source_yarn = await client.get_yarn(yarn_id)
    logger.info(f"Source yarn: {source_yarn.name}")

    attribute_query = matcher.build_attribute_query(source_yarn)
    logger.info(f"Matching query: {attribute_query}")
    similar = await client.search_yarns_by_attributes(attribute_query)
    logger.info(f"Found {len(similar.yarns)} similar yarn(s), selecting top {SIMILAR_YARN_LIMIT} by rating")

    top_similar = sorted(
        similar.yarns, key=lambda y: y.rating_average or 0, reverse=True
    )
    top_similar = [y for y in top_similar if y.id != source_yarn.id][:SIMILAR_YARN_LIMIT]
    logger.info(f"Top similar yarns (excluding source): {[y.name for y in top_similar]}")

    logger.info(f"Searching patterns for {len(top_similar)} yarn(s) (max {MAX_CONCURRENT_PATTERN_REQUESTS} concurrent)...")

    semaphore = asyncio.Semaphore(MAX_CONCURRENT_PATTERN_REQUESTS)

    async def search_with_limit(yarn):
        async with semaphore:
            return await client.search_patterns(yarn.permalink)

    pattern_responses = await asyncio.gather(
        *(search_with_limit(y) for y in top_similar)
    )
    total_patterns = sum(len(r.patterns) for r in pattern_responses)
    logger.info(f"Found {total_patterns} pattern(s) across all yarn(s)")

    seen_ids: set[int] = set()
    patterns: list[Pattern] = []
    for response in pattern_responses:
        for pattern in response.patterns:
            if pattern.id in seen_ids:
                continue
            seen_ids.add(pattern.id)
            patterns.append(pattern)

    logger.info(f"After deduping: {len(patterns)} unique pattern(s)")
    patterns.sort(key=lambda p: p.rating_average or 0, reverse=True)
    logger.info(f"Final result: {len(patterns)} patterns sorted by rating")

    return YarnPatternMatches(
        source_yarn=source_yarn, similar_yarns=top_similar, patterns=patterns
    )
