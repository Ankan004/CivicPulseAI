import time

from sentence_transformers import (
    SentenceTransformer,
    util
)

model = SentenceTransformer(
    "all-MiniLM-L6-v2"
)

def get_embedding(
    text: str
):
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