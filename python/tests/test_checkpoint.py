from lib.checkpoint import CheckpointData, parse_checkpoint, serialize_checkpoint


def test_checkpoint_roundtrip():
    data = CheckpointData(1, 2, 3, [{"userId": "a", "password": "b"}], "t")
    back = parse_checkpoint(serialize_checkpoint(data))
    assert back.current_user_id == 1
    assert back.found_credentials[0]["userId"] == "a"
