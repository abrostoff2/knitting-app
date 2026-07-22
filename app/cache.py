import functools
import logging
import time
from typing import Any, Callable, TypeVar

logger = logging.getLogger(__name__)

T = TypeVar("T")


class TTLCache:
    """Simple in-memory TTL cache using dict and monotonic time."""

    def __init__(self):
        self._store: dict[str, tuple[Any, float]] = {}

    def get(self, key: str) -> Any | None:
        """Get a cached value if it exists and hasn't expired."""
        if key not in self._store:
            return None
        value, expires_at = self._store[key]
        if time.monotonic() >= expires_at:
            del self._store[key]
            return None
        return value

    def set(self, key: str, value: Any, ttl_seconds: int) -> None:
        """Store a value with an expiration time."""
        self._store[key] = (value, time.monotonic() + ttl_seconds)


def cached(ttl_seconds: int) -> Callable:
    """Decorator for async methods to cache results by args/kwargs."""

    def decorator(func: Callable[..., T]) -> Callable[..., T]:
        @functools.wraps(func)
        async def wrapper(self, *args, **kwargs):
            cache: TTLCache = self._cache

            key_parts = [func.__name__]
            for arg in args:
                if isinstance(arg, dict):
                    key_parts.append(str(tuple(sorted(arg.items()))))
                else:
                    key_parts.append(str(arg))
            for k, v in sorted(kwargs.items()):
                key_parts.append(f"{k}={v}")

            cache_key = "|".join(key_parts)

            cached_result = cache.get(cache_key)
            if cached_result is not None:
                logger.debug(f"Cache hit for {func.__name__}: {cache_key[:50]}")
                return cached_result

            logger.debug(f"Cache miss for {func.__name__}: {cache_key[:50]}")
            result = await func(self, *args, **kwargs)
            cache.set(cache_key, result, ttl_seconds)
            return result

        return wrapper

    return decorator
