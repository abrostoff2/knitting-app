import logging

import httpx

from app.cache import TTLCache, cached
from app.config import Settings
from app.models import (
    PatternSearchResponse,
    YarnDetail,
    YarnDetailResponse,
    YarnSearchResponse,
)

logger = logging.getLogger(__name__)


class RavelryClient:
    def __init__(self, settings: Settings):
        self._client = httpx.AsyncClient(
            base_url=settings.ravelry_base_url,
            auth=(settings.ravelry_username, settings.ravelry_password),
            timeout=60.0,
        )
        self._cache = TTLCache()

    async def aclose(self) -> None:
        await self._client.aclose()

    @cached(ttl_seconds=600)
    async def search_yarns(self, query: str) -> YarnSearchResponse:
        logger.debug(f"GET /yarns/search.json?query={query}")
        resp = await self._client.get("/yarns/search.json", params={"query": query})
        resp.raise_for_status()
        result = YarnSearchResponse.model_validate(resp.json())
        logger.debug(f"  → {len(result.yarns)} results")
        return result

    @cached(ttl_seconds=86400)
    async def get_yarn(self, yarn_id: int) -> YarnDetail:
        logger.debug(f"GET /yarns.json?ids={yarn_id}")
        resp = await self._client.get("/yarns.json", params={"ids": yarn_id})
        resp.raise_for_status()
        parsed = YarnDetailResponse.model_validate(resp.json())
        yarn = parsed.yarns[str(yarn_id)]
        logger.debug(f"  → {yarn.name} ({len(yarn.yarn_fibers)} fiber(s), {yarn.yarn_weight.name})")
        return yarn

    @cached(ttl_seconds=1800)
    async def search_yarns_by_attributes(self, params: dict[str, str]) -> YarnSearchResponse:
        logger.debug(f"GET /yarns/search.json?{params}")
        resp = await self._client.get("/yarns/search.json", params=params)
        resp.raise_for_status()
        result = YarnSearchResponse.model_validate(resp.json())
        logger.debug(f"  → {len(result.yarns)} results")
        top_10 = sorted(result.yarns, key=lambda y: y.rating_average or 0, reverse=True)[:10]
        logger.debug(f"     Top 10 by rating: {[f'{y.name} ({y.rating_average})' for y in top_10]}")
        return result

    @cached(ttl_seconds=1800)
    async def search_patterns(self, query: str) -> PatternSearchResponse:
        logger.info(f"GET /patterns/search.json?query={query}")
        resp = await self._client.get("/patterns/search.json", params={"query": query})
        resp.raise_for_status()
        result = PatternSearchResponse.model_validate(resp.json())
        logger.info(f"  → {len(result.patterns)} patterns found for query: {query}")
        return result
