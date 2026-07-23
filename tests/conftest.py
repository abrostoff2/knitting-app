import pytest

from app.models import FiberType, NeedleSize, YarnDetail, YarnFiber, YarnWeight


@pytest.fixture
def mulberry_silk() -> YarnDetail:
    """A single-fiber lace-weight yarn, modeled on Isager Mulberry Silk (see docs/spec.md)."""
    return YarnDetail(
        id=255687,
        name="Mulberry Silk",
        permalink="isager-yarn-mulberry-silk",
        rating_average=5.0,
        yarn_weight=YarnWeight(id=7, name="Lace", ply="2", knit_gauge="32-34"),
        yarn_fibers=[
            YarnFiber(
                id=472161,
                percentage=100,
                fiber_type=FiberType(id=9, name="Silk", animal_fiber=True),
            )
        ],
        min_needle_size=NeedleSize(id=20, us="2½", metric=3.0, name="US 2½ - 3.0 mm"),
        max_needle_size=NeedleSize(id=20, us="2½", metric=3.0, name="US 2½ - 3.0 mm"),
    )
