import os

import pytest

from lib.config import load_config


def test_requires_base_url(monkeypatch):
    monkeypatch.delenv("HBF_BASE_URL", raising=False)
    with pytest.raises(ValueError):
        load_config()


def test_loads_env(monkeypatch):
    monkeypatch.setenv("HBF_BASE_URL", "https://lab.example")
    cfg = load_config()
    assert cfg.base_url == "https://lab.example"
