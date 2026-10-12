def is_login_success(response_url: str, body: str, status: int, markers: list[str]) -> bool:
    markers = markers or ["dashboard"]
    url_lower = (response_url or "").lower()
    for m in markers:
        if m.lower() in url_lower:
            return True
    body_lower = (body or "").lower()
    for m in markers:
        if m.lower() in body_lower:
            return True
    if status == 200 and "login" not in body_lower and "sign in" not in body_lower:
        return True
    return False
