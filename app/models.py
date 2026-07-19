from pydantic import BaseModel, ConfigDict


class RavelryModel(BaseModel):
    """Base for models mirroring Ravelry API responses.

    Ravelry's payloads carry far more fields than we use; `extra="allow"`
    keeps parsing resilient to fields we haven't modeled instead of failing.
    """

    model_config = ConfigDict(extra="allow")


class Photo(RavelryModel):
    id: int | None = None
    sort_order: int | None = None
    square_url: str | None = None
    medium_url: str | None = None
    thumbnail_url: str | None = None
    small_url: str | None = None
    caption: str | None = None
    aspect_ratio: float | None = None


class YarnWeight(RavelryModel):
    id: int | None = None
    name: str | None = None
    ply: str | None = None
    knit_gauge: str | None = None
    crochet_gauge: str | None = None


class NeedleSize(RavelryModel):
    id: int | None = None
    us: str | None = None
    metric: float | None = None
    name: str | None = None


class FiberType(RavelryModel):
    id: int | None = None
    name: str | None = None
    animal_fiber: bool | None = None
    synthetic: bool | None = None
    vegetable_fiber: bool | None = None


class FiberCategory(RavelryModel):
    id: int | None = None
    name: str | None = None
    permalink: str | None = None


class YarnFiber(RavelryModel):
    id: int | None = None
    percentage: float | None = None
    fiber_type: FiberType
    fiber_category: FiberCategory | None = None


class YarnCompany(RavelryModel):
    id: int | None = None
    name: str | None = None
    permalink: str | None = None


class YarnSearchResult(RavelryModel):
    """One entry from GET /yarns/search.json."""

    id: int
    name: str
    permalink: str
    yarn_company_name: str | None = None
    rating_average: float | None = None
    rating_count: int | None = None
    texture: str | None = None
    yardage: int | None = None
    first_photo: Photo | None = None
    yarn_weight: YarnWeight | None = None


class Paginator(RavelryModel):
    page_count: int | None = None
    page: int | None = None
    page_size: int | None = None
    results: int | None = None
    last_page: int | None = None


class YarnSearchResponse(RavelryModel):
    yarns: list[YarnSearchResult]
    paginator: Paginator | None = None


class YarnDetail(RavelryModel):
    """A single yarn from GET /yarns.json?ids=... (values of the `yarns` dict)."""

    id: int
    name: str
    permalink: str
    notes_html: str | None = None
    rating_average: float | None = None
    yarn_company: YarnCompany | None = None
    yarn_weight: YarnWeight
    yarn_fibers: list[YarnFiber]
    min_needle_size: NeedleSize | None = None
    max_needle_size: NeedleSize | None = None
    photos: list[Photo] = []


class YarnDetailResponse(RavelryModel):
    yarns: dict[str, YarnDetail]


class PatternAuthor(RavelryModel):
    id: int | None = None
    name: str | None = None
    permalink: str | None = None


class Pattern(RavelryModel):
    """One entry from GET /patterns/search.json."""

    id: int
    name: str
    permalink: str
    free: bool | None = None
    first_photo: Photo | None = None
    designer: PatternAuthor | None = None
    pattern_author: PatternAuthor | None = None
    rating_average: float | None = None
    favorites_count: int | None = None


class PatternSearchResponse(RavelryModel):
    patterns: list[Pattern]
    paginator: Paginator | None = None
