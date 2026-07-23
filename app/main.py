import logging
import sys
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from httpx import HTTPStatusError

from app.config import get_settings
from app.matching import get_matcher
from app.models import YarnSearchResult
from app.ravelry_client import RavelryClient
from app.service import YarnPatternMatches, find_patterns_for_yarn

logging.basicConfig(
    level=logging.WARNING,
    format="%(levelname)s:%(name)s:%(message)s",
    stream=sys.stdout,
)

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.ravelry_client = RavelryClient(get_settings())
    yield
    await app.state.ravelry_client.aclose()


app = FastAPI(title="Knitting App", lifespan=lifespan)


def _client(app: FastAPI) -> RavelryClient:
    return app.state.ravelry_client


@app.get("/api/yarns/search", response_model=list[YarnSearchResult])
async def search_yarns(query: str):
    logger.info(f"Searching yarns: {query}")
    try:
        result = await _client(app).search_yarns(query)
        logger.info(f"Found {len(result.yarns)} yarn(s)")
    except HTTPStatusError as exc:
        logger.error(f"Yarn search failed: {exc}")
        raise HTTPException(status_code=exc.response.status_code, detail=str(exc)) from exc
    return result.yarns


@app.get("/api/yarns/{yarn_id}")
async def get_yarn(yarn_id: int):
    logger.info(f"Getting yarn details for ID {yarn_id}")
    try:
        yarn = await _client(app).get_yarn(yarn_id)
        logger.info(f"Got yarn: {yarn.name}")
        return yarn
    except HTTPStatusError as exc:
        logger.error(f"Failed to get yarn {yarn_id}: {exc}")
        raise HTTPException(status_code=exc.response.status_code, detail=str(exc)) from exc


@app.get("/api/yarns/{yarn_id}/patterns", response_model=YarnPatternMatches)
async def patterns_for_yarn(
    yarn_id: int, pattern_query: str = "", page: int = 1, category: str | None = None
):
    msg = f"Finding patterns for yarn {yarn_id}"
    if pattern_query:
        msg += f" with pattern query: {pattern_query}"
    if category:
        msg += f" in category: {category}"
    if page > 1:
        msg += f" (page {page})"
    logger.info(msg)
    try:
        result = await find_patterns_for_yarn(
            _client(app), get_matcher(), yarn_id, pattern_query, page, category
        )
        logger.info(
            f"Found {len(result.patterns)} pattern(s) for yarn {yarn_id} "
            f"(page {result.current_page}/{result.total_pages})"
        )
        return result
    except HTTPStatusError as exc:
        logger.error(f"Pattern search failed for yarn {yarn_id}: {exc}")
        raise HTTPException(status_code=exc.response.status_code, detail=str(exc)) from exc


app.mount("/static", StaticFiles(directory="app/static"), name="static")


@app.get("/")
async def index():
    return FileResponse("app/static/index.html")
