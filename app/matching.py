"""Yarn-similarity matching.

Everything else in the app (routes, the Ravelry client) only calls
`get_matcher().build_attribute_query(yarn)` and gets back query params for
the "search yarn by attributes" endpoint. None of it knows *how* similarity
is decided, so the algorithm below can be swapped for a smarter one later
(e.g. fuzzy fiber matching) without touching any calling code.
"""

from abc import ABC, abstractmethod

from app.models import YarnDetail


class YarnMatcher(ABC):
    @abstractmethod
    def build_attribute_query(self, yarn: YarnDetail) -> dict[str, str]:
        """Build the query params used to search for yarns similar to `yarn`."""


class ExactAttributeMatcher(YarnMatcher):
    """Matches on weight + all fibers + fiber count, all as exact strings.

    Mirrors the original Postman collection's "Search Yarn By Attributes"
    request. Current limitations:
    - fiber/weight/needle must match exactly, no fuzzy or adjacent matches
    - percentage composition is not queryable via Ravelry search API; checked
      client-side via is_similar_enough() after fetching full yarn details
    """

    def build_attribute_query(self, yarn: YarnDetail) -> dict[str, str]:
        fiber_names = "+".join(
            (f.fiber_type.name or "").lower() for f in yarn.yarn_fibers
        )
        query = {
            "weight": yarn.yarn_weight.name or "",
            "fiber-content": fiber_names,
            "fiberc": str(len(yarn.yarn_fibers)),
            # "ya": f"{yarn.yarn_weight.ply}-ply",
        }
        if yarn.min_needle_size and yarn.min_needle_size.metric:
            query["needles"] = f"{yarn.min_needle_size.metric}mm"
        return query


def get_matcher() -> YarnMatcher:
    return ExactAttributeMatcher()
