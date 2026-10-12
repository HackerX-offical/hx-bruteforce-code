def delay_seconds(request_delay: float, retries: int) -> float:
    return request_delay * (2 ** max(0, retries - 1))
