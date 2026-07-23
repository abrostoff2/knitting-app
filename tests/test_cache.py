"""Tests for app/cache.py — the TTL cache that keeps RavelryClient from
hammering the real API (see docs/decisions.md)."""

import app.cache as cache_module
from app.cache import TTLCache, cached


def test_ttl_cache_returns_value_before_expiry(monkeypatch):
    cache = TTLCache()
    current_time = [1000.0]
    monkeypatch.setattr(cache_module.time, "monotonic", lambda: current_time[0])

    cache.set("key", "value", ttl_seconds=10)
    current_time[0] += 5

    assert cache.get("key") == "value"


def test_ttl_cache_expires_value(monkeypatch):
    cache = TTLCache()
    current_time = [1000.0]
    monkeypatch.setattr(cache_module.time, "monotonic", lambda: current_time[0])

    cache.set("key", "value", ttl_seconds=10)
    current_time[0] += 11

    assert cache.get("key") is None


async def test_cached_decorator_avoids_repeat_calls():
    call_count = 0

    class Thing:
        def __init__(self):
            self._cache = TTLCache()

        @cached(ttl_seconds=60)
        async def compute(self, x):
            nonlocal call_count
            call_count += 1
            return x * 2

    thing = Thing()

    assert await thing.compute(3) == 6
    assert await thing.compute(3) == 6
    assert call_count == 1  # second call was served from cache


async def test_cached_decorator_distinguishes_by_args():
    class Thing:
        def __init__(self):
            self._cache = TTLCache()

        @cached(ttl_seconds=60)
        async def compute(self, x):
            return x * 2

    thing = Thing()

    assert await thing.compute(3) == 6
    assert await thing.compute(4) == 8
