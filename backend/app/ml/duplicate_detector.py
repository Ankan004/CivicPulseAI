from sentence_transformers import (
    SentenceTransformer,
    util
)

model = SentenceTransformer(
    "all-MiniLM-L6-v2"
)

def is_duplicate(
    new_text: str,
    existing_text: str,
    threshold: float = 0.75
):

    emb1 = model.encode(
        new_text,
        convert_to_tensor=True
    )

    emb2 = model.encode(
        existing_text,
        convert_to_tensor=True
    )

    similarity = util.cos_sim(
        emb1,
        emb2
    ).item()

    return (
        similarity >= threshold,
        similarity
    )