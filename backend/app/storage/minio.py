"""
Object storage abstraction layer (S3-compatible, e.g. MinIO).
Handles video, audio, image assets.
"""

from app.config import settings


class StorageService:
    def __init__(self):
        self.endpoint = settings.storage_endpoint
        self.bucket = settings.storage_bucket
        self._client = None

    async def ensure_bucket(self):
        pass

    async def upload(self, key: str, data: bytes, content_type: str) -> str:
        url = f"{self.endpoint}/{self.bucket}/{key}"
        return url

    async def download(self, key: str) -> bytes:
        return b""

    async def delete(self, key: str):
        pass

    async def list_files(self, prefix: str) -> list[str]:
        return []


storage = StorageService()
