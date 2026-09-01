import json
import torch
import time

from sentence_transformers import (
    SentenceTransformer,
    util
)

# Lazy-loaded model
_model = None


def get_model():
    global _model

    if _model is None:
        print("Loading SentenceTransformer model...")
        _model = SentenceTransformer(
            "all-MiniLM-L6-v2"
        )

    return _model


def get_embedding(
    text: str
):
    model = get_model()

    return model.encode(
        text,
        convert_to_tensor=True
    )


def compare_embeddings(
    emb1,
    emb2,
    threshold: float = 0.75
):

    start = time.time()

    similarity = util.cos_sim(
        emb1,
        emb2
    ).item()

    print(
        f"Similarity Calc: {time.time()-start:.4f}s"
    )

    return (
        similarity >= threshold,
        similarity
    )


def embedding_to_json(
    embedding
):
    return json.dumps(
        embedding.tolist()
    )


def json_to_embedding(
    embedding_json
):
    return torch.tensor(
        json.loads(
            embedding_json
        )
    )