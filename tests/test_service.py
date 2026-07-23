"""Tests for app/service.py's find_patterns_for_yarn — the aggregation step
that turns "one yarn" into "similar yarns -> deduped, rated patterns".

Uses a stub client instead of a real RavelryClient so these run with no
network access and no API credentials (see docs/spec.md for the real flow).
"""

from app.matching import YarnMatcher
from app.models import (
    Pattern,
    PatternAuthor,
    PatternSearchResponse,
    YarnSearchResponse,
    YarnSearchResult,
)
from app.service import find_patterns_for_yarn


def make_yarn_result(id: int, name: str, rating: float | None = None) -> YarnSearchResult:
    return YarnSearchResult(
        id=id, name=name, permalink=name.lower().replace(" ", "-"), rating_average=rating
    )


def make_pattern(id: int, name: str, rating: float | None = None) -> Pattern:
    return Pattern(
        id=id,
        name=name,
        permalink=name.lower().replace(" ", "-"),
        designer=PatternAuthor(id=1, name="Some Designer"),
        rating_average=rating,
    )


class StubMatcher(YarnMatcher):
    def build_attribute_query(self, yarn):
        return {"weight": yarn.yarn_weight.name or ""}


class StubClient:
    """Fakes just the RavelryClient methods find_patterns_for_yarn calls."""

    def __init__(self, source_yarn, similar_yarns, patterns_by_permalink):
        self._source_yarn = source_yarn
        self._similar_yarns = similar_yarns
        self._patterns_by_permalink = patterns_by_permalink

    async def get_yarn(self, yarn_id):
        return self._source_yarn

    async def search_yarns_by_attributes(self, params):
        return YarnSearchResponse(yarns=self._similar_yarns)

    async def search_patterns(self, query, category=None):
        permalink = query.split(" ")[0]
        return PatternSearchResponse(patterns=self._patterns_by_permalink.get(permalink, []))


async def test_excludes_source_yarn_and_caps_at_top_ten(mulberry_silk):
    # 12 other yarns with distinct ratings, plus the source yarn itself in the results
    similar = [make_yarn_result(id=mulberry_silk.id, name="Mulberry Silk", rating=5.0)]
    similar += [make_yarn_result(id=100 + i, name=f"Yarn {i}", rating=float(i)) for i in range(12)]
    client = StubClient(mulberry_silk, similar, patterns_by_permalink={})

    result = await find_patterns_for_yarn(client, StubMatcher(), mulberry_silk.id)

    assert mulberry_silk.id not in [y.id for y in result.similar_yarns]
    assert len(result.similar_yarns) == 10
    ratings = [y.rating_average for y in result.similar_yarns]
    assert ratings == sorted(ratings, reverse=True)


async def test_dedupes_patterns_across_yarns_and_sorts_by_rating(mulberry_silk):
    similar = [
        make_yarn_result(id=1, name="Yarn A", rating=4.0),
        make_yarn_result(id=2, name="Yarn B", rating=3.0),
    ]
    shared_pattern = make_pattern(id=999, name="Shared Hat", rating=4.5)
    patterns_by_permalink = {
        "yarn-a": [shared_pattern, make_pattern(id=1, name="Low Rated", rating=1.0)],
        "yarn-b": [shared_pattern, make_pattern(id=2, name="High Rated", rating=5.0)],
    }
    client = StubClient(mulberry_silk, similar, patterns_by_permalink)

    result = await find_patterns_for_yarn(client, StubMatcher(), mulberry_silk.id)

    pattern_ids = [p.id for p in result.patterns]
    assert pattern_ids.count(999) == 1  # deduped, not counted twice
    ratings = [p.rating_average for p in result.patterns]
    assert ratings == sorted(ratings, reverse=True)


async def test_appends_optional_filter_to_pattern_query(mulberry_silk):
    similar = [make_yarn_result(id=1, name="Yarn A", rating=4.0)]
    captured_queries = []

    class CapturingClient(StubClient):
        async def search_patterns(self, query, category=None):
            captured_queries.append(query)
            return PatternSearchResponse(patterns=[])

    client = CapturingClient(mulberry_silk, similar, {})

    await find_patterns_for_yarn(client, StubMatcher(), mulberry_silk.id, pattern_query="hat")

    assert captured_queries == ["yarn-a hat"]
