class Response:
    def __init__(self, status_code: int = 200):
        self.status_code = status_code


def post(*args, **kwargs) -> Response:  # type: ignore[unused-argument]
    return Response()
