from __future__ import annotations

import json
import json as json_module
from dataclasses import dataclass
from typing import Any, Dict, Iterable, Iterator, Mapping, MutableMapping, Optional
from urllib.parse import urljoin, urlparse

from . import _client

__all__ = [
    "BaseTransport",
    "ByteStream",
    "Client",
    "Headers",
    "Request",
    "Response",
]


class Headers(MutableMapping[str, str]):
    def __init__(self, initial: Optional[Mapping[str, str]] = None):
        self._store: Dict[str, str] = {}
        if initial:
            for key, value in initial.items():
                self._store[key.lower()] = str(value)

    def __getitem__(self, key: str) -> str:
        return self._store[key.lower()]

    def __setitem__(self, key: str, value: str) -> None:
        self._store[key.lower()] = str(value)

    def __delitem__(self, key: str) -> None:
        del self._store[key.lower()]

    def __iter__(self) -> Iterator[str]:
        return iter(self._store)

    def __len__(self) -> int:
        return len(self._store)

    def get(self, key: str, default: Optional[str] = None) -> Optional[str]:  # type: ignore[override]
        return self._store.get(key.lower(), default)

    def multi_items(self) -> list[tuple[str, str]]:
        return list(self._store.items())


@dataclass
class URL:
    scheme: str
    netloc: bytes
    path: str
    raw_path: bytes
    query: bytes

    @classmethod
    def from_string(cls, url: str) -> "URL":
        parsed = urlparse(url)
        scheme = parsed.scheme or "http"
        netloc = parsed.netloc.encode() if parsed.netloc else b""
        path = parsed.path or "/"
        raw_path = path.encode()
        query = (parsed.query or "").encode()
        if query:
            raw_path = f"{path}?{parsed.query}".encode()
        return cls(scheme=scheme, netloc=netloc, path=path, raw_path=raw_path, query=query)


class Request:
    def __init__(
        self, method: str, url: str, headers: Optional[Mapping[str, str]] = None, content: bytes | str = b""
    ):
        self.method = method
        self.url = URL.from_string(url)
        self.headers = Headers(headers)
        if isinstance(content, str):
            content = content.encode()
        self._content = content or b""

    def read(self) -> bytes:
        return self._content


class ByteStream:
    def __init__(self, content: bytes | Any):
        if hasattr(content, "read"):
            content = content.read()
        self._content = content or b""

    def read(self) -> bytes:
        return self._content


class Response:
    def __init__(
        self,
        status_code: int,
        headers: Iterable[tuple[str, str]] | None = None,
        stream: ByteStream | bytes | None = None,
        request: Request | None = None,
    ):
        self.status_code = status_code
        self.headers = Headers(dict(headers)) if headers else Headers()
        if stream is None:
            stream = ByteStream(b"")
        elif isinstance(stream, bytes):
            stream = ByteStream(stream)
        self.stream = stream
        self.request = request
        self.content = self.stream.read()
        self.text = self.content.decode("utf-8", errors="replace")

    def json(self) -> Any:
        return json.loads(self.text)


class BaseTransport:
    def handle_request(self, request: Request) -> Response:  # pragma: no cover - interface
        raise NotImplementedError


class Client:
    def __init__(
        self,
        base_url: str = "http://localhost",
        headers: Optional[Dict[str, str]] = None,
        transport: Optional[BaseTransport] = None,
        follow_redirects: bool = True,
        cookies: Any = None,
    ):
        self.base_url = base_url
        self.headers = headers or {}
        self._transport = transport or BaseTransport()
        self.follow_redirects = follow_redirects
        self.cookies = cookies

    def _merge_url(self, url: str) -> str:
        url_str = str(url)
        if url_str.startswith(("http://", "https://", "ws://", "wss://")):
            return url_str
        return urljoin(self.base_url, url_str)

    def request(
        self,
        method: str,
        url: str,
        *,
        content: Any = None,
        data: Any = None,
        files: Any = None,
        json: Any = None,
        params: Any = None,
        headers: Optional[Mapping[str, str]] = None,
        cookies: Any = None,
        auth: Any = None,
        follow_redirects: Any = None,
        timeout: Any = None,
        extensions: Any = None,
    ):
        body = b""
        if json is not None:
            body = json_module.dumps(json).encode()
        elif data is not None:
            body = str(data).encode()
        elif content is not None:
            body = content if isinstance(content, bytes) else str(content).encode()

        merged_headers: Dict[str, str] = {**self.headers}
        if headers:
            merged_headers.update({str(k): str(v) for k, v in headers.items()})

        full_url = self._merge_url(url)
        request = Request(method=method.upper(), url=full_url, headers=merged_headers, content=body)
        return self._transport.handle_request(request)

    def get(self, url: str, **kwargs: Any) -> Response:
        return self.request("GET", url, **kwargs)

    def post(self, url: str, **kwargs: Any) -> Response:
        return self.request("POST", url, **kwargs)

    def put(self, url: str, **kwargs: Any) -> Response:
        return self.request("PUT", url, **kwargs)

    def patch(self, url: str, **kwargs: Any) -> Response:
        return self.request("PATCH", url, **kwargs)

    def delete(self, url: str, **kwargs: Any) -> Response:
        return self.request("DELETE", url, **kwargs)

    def __enter__(self) -> "Client":
        return self

    def __exit__(self, exc_type, exc, tb) -> None:
        self.close()

    def close(self) -> None:
        return None


# Provide compatibility attributes
_client.UseClientDefault = _client.UseClientDefault
_client.USE_CLIENT_DEFAULT = _client.USE_CLIENT_DEFAULT
