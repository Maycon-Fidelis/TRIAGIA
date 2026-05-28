"""
Serviço de armazenamento de imagens.
Usa armazenamento local como padrão; pode ser trocado por Supabase Storage.
"""

import os
import uuid
import logging
from pathlib import Path

from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


def _ensure_dirs():
    Path(settings.storage_path).joinpath("originals").mkdir(parents=True, exist_ok=True)
    Path(settings.storage_path).joinpath("processed").mkdir(parents=True, exist_ok=True)


def save_original(file_bytes: bytes, original_filename: str) -> tuple[str, str]:
    """
    Salva arquivo original (DICOM ou imagem).
    Retorna (caminho_absoluto, url_relativa).
    """
    _ensure_dirs()
    ext = Path(original_filename).suffix.lower() or ".bin"
    filename = f"{uuid.uuid4()}{ext}"
    abs_path = str(Path(settings.storage_path) / "originals" / filename)

    with open(abs_path, "wb") as f:
        f.write(file_bytes)

    url = f"/storage/originals/{filename}"
    return abs_path, url


def save_processed(file_bytes: bytes, filename: str = None) -> tuple[str, str]:
    """
    Salva imagem processada/convertida (PNG).
    Retorna (caminho_absoluto, url_relativa).
    """
    _ensure_dirs()
    if filename is None:
        filename = f"{uuid.uuid4()}.png"
    abs_path = str(Path(settings.storage_path) / "processed" / filename)

    with open(abs_path, "wb") as f:
        f.write(file_bytes)

    url = f"/storage/processed/{filename}"
    return abs_path, url


def get_absolute_path(relative_url: str) -> str:
    """Converte URL relativa de storage para caminho absoluto no disco."""
    # Remove o prefixo /storage/
    rel = relative_url.lstrip("/").removeprefix("storage/")
    return str(Path(settings.storage_path) / rel)
