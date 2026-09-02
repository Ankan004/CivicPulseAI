import json
import time

import torch
from sentence_transformers import SentenceTransformer, util


# ============================================================
# MODEL
# ============================================================

MODEL_NAME = "all-MiniLM-L6-v2"

# Similarity threshold for duplicate detection
DEFAULT_THRESHOLD = 0.75

# Lazy-loaded model
_model = None


# ============================================================
# LOAD MODEL
# ============================================================

def get_model():
    """
    Load SentenceTransformer only when it is actually needed.

    This prevents the model from blocking FastAPI startup.
    """

    global _model

    if _model is None:

        print(
            f"Loading SentenceTransformer model: {MODEL_NAME}"
        )

        start = time.time()

        _model = SentenceTransformer(
            MODEL_NAME
        )

        print(
            "SentenceTransformer loaded in "
            f"{time.time() - start:.2f}s"
        )

    return _model


# ============================================================
# GENERATE EMBEDDING
# ============================================================

def get_embedding(
    text: str
):
    """
    Generate a sentence embedding for complaint text.

    The model is loaded lazily on the first call.
    """

    if not text:
        text = ""

    text = str(text).strip()

    model = get_model()

    start = time.time()

    embedding = model.encode(
        text,
        convert_to_tensor=True,
    )

    print(
        "Embedding generation: "
        f"{time.time() - start:.4f}s"
    )

    return embedding


# ============================================================
# COMPARE EMBEDDINGS
# ============================================================

def compare_embeddings(
    emb1,
    emb2,
    threshold: float = DEFAULT_THRESHOLD,
):
    """
    Compare two embeddings using cosine similarity.

    Returns:

        (
            is_duplicate,
            similarity_score
        )
    """

    start = time.time()

    similarity = util.cos_sim(
        emb1,
        emb2,
    ).item()

    print(
        "Similarity calculation: "
        f"{time.time() - start:.4f}s"
    )

    is_duplicate = (
        similarity >= threshold
    )

    return (
        is_duplicate,
        similarity,
    )


# ============================================================
# EMBEDDING → JSON
# ============================================================

def embedding_to_json(
    embedding
):
    """
    Convert a PyTorch embedding tensor into
    a JSON string suitable for database storage.
    """

    if embedding is None:
        return None

    # Make sure tensor is detached from any graph.
    if isinstance(
        embedding,
        torch.Tensor,
    ):

        embedding = (
            embedding
            .detach()
            .cpu()
        )

        values = embedding.tolist()

    else:

        values = list(
            embedding
        )

    return json.dumps(
        values
    )


# ============================================================
# JSON → EMBEDDING
# ============================================================

def json_to_embedding(
    embedding_json
):
    """
    Convert a stored JSON embedding back
    into a PyTorch tensor.
    """

    if not embedding_json:
        return None

    if isinstance(
        embedding_json,
        str,
    ):

        values = json.loads(
            embedding_json
        )

    else:

        values = embedding_json

    return torch.tensor(
        values,
        dtype=torch.float32,
    )


# ============================================================
# CHECK DUPLICATE
# ============================================================

def is_duplicate(
    new_embedding,
    existing_embedding,
    threshold: float = DEFAULT_THRESHOLD,
):
    """
    Convenience function for duplicate detection.

    Returns:

        {
            "duplicate": bool,
            "similarity": float
        }
    """

    if (
        new_embedding is None
        or existing_embedding is None
    ):

        return {
            "duplicate": False,
            "similarity": 0.0,
        }

    duplicate, similarity = (
        compare_embeddings(
            new_embedding,
            existing_embedding,
            threshold,
        )
    )

    return {
        "duplicate": duplicate,
        "similarity": similarity,
    }