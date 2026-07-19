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
    """Matches on weight + first fiber + ply, all as exact strings.

    Mirrors the original Postman collection's "Search Yarn By Attributes"
    request. Current limitations carried over from that spec:
    - only the first fiber is considered (single-fiber-content yarns only)
    - fiber/weight/ply must match exactly, no fuzzy or adjacent matches
    """

    def build_attribute_query(self, yarn: YarnDetail) -> dict[str, str]:
        first_fiber = yarn.yarn_fibers[0]
        query = {
            "weight": yarn.yarn_weight.name or "",
            "fiber-content": (first_fiber.fiber_type.name or "").lower(),
            "fiberc": str(len(yarn.yarn_fibers)),
            # "ya": f"{yarn.yarn_weight.ply}-ply",
        }
        if yarn.min_needle_size and yarn.min_needle_size.metric:
            query["needles"] = f"{yarn.min_needle_size.metric}mm"
        return query


def get_matcher() -> YarnMatcher:
    return ExactAttributeMatcher()
