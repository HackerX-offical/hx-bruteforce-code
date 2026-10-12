import os
from dataclasses import dataclass


@dataclass
class BruteforceConfig:
    base_url: str
    login_url: str
    user_field: str
    pass_field: str
    submit_field: str
    submit_value: str
    success_markers: list[str]
    id_start: int
    id_end: int
    pass_start: int
    pass_end: int


def load_config() -> BruteforceConfig:
    base = (os.environ.get("HBF_BASE_URL") or "").rstrip("/")
    if not base:
        raise ValueError("HBF_BASE_URL is required for authorized lab targets only.")
    markers = [
        m.strip()
        for m in (os.environ.get("HBF_SUCCESS_MARKERS") or "dashboard").split(",")
        if m.strip()
    ]
    return BruteforceConfig(
        base_url=base,
        login_url=os.environ.get("HBF_LOGIN_URL") or f"{base}/",
        user_field=os.environ.get("HBF_USER_FIELD", "LoginId"),
        pass_field=os.environ.get("HBF_PASS_FIELD", "LoginPassword"),
        submit_field=os.environ.get("HBF_SUBMIT_FIELD", "command"),
        submit_value=os.environ.get("HBF_SUBMIT_VALUE", "SIGN IN"),
        success_markers=markers,
        id_start=int(os.environ.get("HBF_ID_START", "1000")),
        id_end=int(os.environ.get("HBF_ID_END", "1002")),
        pass_start=int(os.environ.get("HBF_PASS_START", "10000")),
        pass_end=int(os.environ.get("HBF_PASS_END", "10002")),
    )
