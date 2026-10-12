from lib.login_success import is_login_success


def test_url_marker():
    assert is_login_success("https://x/dashboard", "", 200, ["dashboard"])
