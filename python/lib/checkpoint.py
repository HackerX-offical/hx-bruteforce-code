import json
from dataclasses import dataclass, asdict
from typing import Any


@dataclass
class CheckpointData:
    current_user_id: int
    current_password: int
    total_tested: int
    found_credentials: list[dict[str, str]]
    last_updated: str


def parse_checkpoint(raw: str) -> CheckpointData:
    data = json.loads(raw)
    return CheckpointData(
        current_user_id=int(data.get("currentUserId", data.get("current_user_id", 0))),
        current_password=int(data.get("currentPassword", data.get("current_password", 0))),
        total_tested=int(data.get("totalTested", data.get("total_tested", 0))),
        found_credentials=list(data.get("foundCredentials", data.get("found_credentials", []))),
        last_updated=str(data.get("lastUpdated", data.get("last_updated", ""))),
    )


def serialize_checkpoint(data: CheckpointData) -> str:
    payload: dict[str, Any] = {
        "currentUserId": data.current_user_id,
        "currentPassword": data.current_password,
        "totalTested": data.total_tested,
        "foundCredentials": data.found_credentials,
        "lastUpdated": data.last_updated,
    }
    return json.dumps(payload, indent=4)
