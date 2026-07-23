"""Tests for app/matching.py.

These pin down the known, documented limitations of ExactAttributeMatcher
(see docs/spec.md) so a future change to the algorithm is a deliberate
decision, not an accident.
"""

from app.matching import ExactAttributeMatcher
from app.models import FiberType, YarnFiber


def test_build_attribute_query_uses_weight_fiber_and_needle_size(mulberry_silk):
    matcher = ExactAttributeMatcher()

    query = matcher.build_attribute_query(mulberry_silk)

    assert query["weight"] == "Lace"
    assert query["fiber-content"] == "silk"  # lowercased
    assert query["fiberc"] == "1"
    assert query["needles"] == "3.0mm"


def test_build_attribute_query_omits_needles_when_missing(mulberry_silk):
    mulberry_silk.min_needle_size = None
    matcher = ExactAttributeMatcher()

    query = matcher.build_attribute_query(mulberry_silk)

    assert "needles" not in query


def test_build_attribute_query_includes_all_fibers(mulberry_silk):
    """Multi-fiber yarns match on all fibers, joined with +."""
    mulberry_silk.yarn_fibers.append(
        YarnFiber(id=2, percentage=50, fiber_type=FiberType(id=1, name="Wool"))
    )
    matcher = ExactAttributeMatcher()

    query = matcher.build_attribute_query(mulberry_silk)

    assert query["fiber-content"] == "silk+wool"  # all fibers, lowercased, +joined
    assert query["fiberc"] == "2"
