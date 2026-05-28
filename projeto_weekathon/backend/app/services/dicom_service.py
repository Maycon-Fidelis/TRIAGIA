"""
Serviço de leitura e conversão de arquivos DICOM.
Converte para PNG para exibição no browser e extrai metadados clínicos.
"""

import logging
from pathlib import Path
from typing import Optional

import numpy as np
from PIL import Image

logger = logging.getLogger(__name__)

# Mapeamento de modalidade DICOM → tipo de exame interno
MODALITY_MAP = {
    "CR": "RX_TORAX",   # Computed Radiography (mais comum para RX)
    "DX": "RX_TORAX",   # Digital Radiography
    "CT": "TC_CRANIO",  # Computed Tomography
    "MR": "RM_CRANIO",  # Magnetic Resonance
    "NM": "OUTRO",      # Nuclear Medicine
    "US": "OUTRO",      # Ultrasound
}


def is_dicom(file_path: str) -> bool:
    """Verifica se o arquivo é DICOM pela assinatura mágica."""
    try:
        with open(file_path, "rb") as f:
            f.seek(128)
            magic = f.read(4)
        return magic == b"DICM"
    except Exception:
        return False


def dicom_to_png(dicom_path: str, output_path: str) -> str:
    """
    Converte arquivo DICOM para PNG normalizado.
    Aplica windowing automático baseado nos percentis da imagem.
    """
    import pydicom

    ds = pydicom.dcmread(dicom_path)
    pixel_array = ds.pixel_array.astype(np.float32)

    # Handle multi-frame (usa primeiro frame)
    if pixel_array.ndim == 3:
        pixel_array = pixel_array[0]

    # Windowing: corta outliers para melhorar contraste
    p2, p98 = np.percentile(pixel_array, [2, 98])
    pixel_array = np.clip(pixel_array, p2, p98)

    # Normaliza para 0-255
    if p98 > p2:
        pixel_array = (pixel_array - p2) / (p98 - p2) * 255.0
    pixel_array = pixel_array.astype(np.uint8)

    # Inverte imagem se necessário (DICOM MONOCHROME1 = fundo branco)
    photometric = getattr(ds, "PhotometricInterpretation", "MONOCHROME2")
    if photometric == "MONOCHROME1":
        pixel_array = 255 - pixel_array

    image = Image.fromarray(pixel_array, mode="L").convert("RGB")
    image.save(output_path, format="PNG", optimize=True)
    return output_path


def extract_dicom_metadata(dicom_path: str) -> dict:
    """Extrai metadados clínicos relevantes do cabeçalho DICOM."""
    try:
        import pydicom

        ds = pydicom.dcmread(dicom_path, stop_before_pixels=True)

        def safe_get(tag, default=""):
            val = getattr(ds, tag, None)
            return str(val) if val is not None else default

        patient_name = safe_get("PatientName") or safe_get("PatientID")

        return {
            "patient_name": patient_name,
            "patient_id": safe_get("PatientID"),
            "patient_birth_date": safe_get("PatientBirthDate"),
            "patient_sex": safe_get("PatientSex"),
            "study_date": safe_get("StudyDate"),
            "modality": safe_get("Modality"),
            "study_description": safe_get("StudyDescription"),
            "series_description": safe_get("SeriesDescription"),
            "institution": safe_get("InstitutionName"),
            "referring_physician": safe_get("ReferringPhysicianName"),
            "rows": str(getattr(ds, "Rows", "")),
            "columns": str(getattr(ds, "Columns", "")),
            "kvp": safe_get("KVP"),
        }
    except Exception as e:
        logger.warning(f"Falha ao extrair metadados DICOM: {e}")
        return {}


def guess_exam_type_from_dicom(metadata: dict) -> Optional[str]:
    """Infere o tipo de exame a partir dos metadados DICOM."""
    modality = metadata.get("modality", "").upper()
    study_desc = (metadata.get("study_description", "") + " " + metadata.get("series_description", "")).lower()

    # Por modalidade
    if modality in MODALITY_MAP:
        base = MODALITY_MAP[modality]
    else:
        return None

    # Refina por descrição do estudo
    if modality in ("CR", "DX"):
        if any(k in study_desc for k in ("torax", "tórax", "chest", "pulm")):
            return "RX_TORAX"
        if any(k in study_desc for k in ("coluna", "lombar", "cervical", "dorsal", "spine")):
            return "RX_COLUNA"
        if any(k in study_desc for k in ("cranio", "crânio", "skull", "head")):
            return "RX_CRANIO"
        if any(k in study_desc for k in ("abdome", "pelve", "abdomen")):
            return "RX_ABDOME"
        return "RX_MEMBROS"

    if modality == "CT":
        if any(k in study_desc for k in ("cranio", "crânio", "head", "brain")):
            return "TC_CRANIO"
        if any(k in study_desc for k in ("torax", "tórax", "chest")):
            return "TC_TORAX"
        if any(k in study_desc for k in ("abdome", "pelve")):
            return "TC_ABDOME"
        if any(k in study_desc for k in ("coluna", "spine")):
            return "TC_COLUNA"
        return "TC_CRANIO"

    if modality == "MR":
        if any(k in study_desc for k in ("cranio", "head", "brain")):
            return "RM_CRANIO"
        if any(k in study_desc for k in ("coluna", "spine")):
            return "RM_COLUNA"
        return "RM_CRANIO"

    return base
