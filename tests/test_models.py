"""Regression test for the extra="allow" convention in app/models.py.

CLAUDE.md flags this convention explicitly ("don't tighten this without
checking why") since Ravelry's real payloads carry far more fields than we
model. This test protects that decision from being silently reverted.
"""

from app.models import YarnDetail


def test_yarn_detail_allows_unmodeled_fields():
    data = {
        "id": 1,
        "name": "Test Yarn",
        "permalink": "test-yarn",
        "yarn_weight": {"id": 1, "name": "Worsted"},
        "yarn_fibers": [
            {"id": 1, "percentage": 100, "fiber_type": {"id": 1, "name": "Wool"}}
        ],
        # Fields Ravelry sends that we haven't modeled — must not raise.
        "gauge_divisor": 4,
        "some_field_ravelry_added_later": "should not raise",
    }

    yarn = YarnDetail.model_validate(data)

    assert yarn.name == "Test Yarn"
    assert yarn.model_extra["some_field_ravelry_added_later"] == "should not raise"
