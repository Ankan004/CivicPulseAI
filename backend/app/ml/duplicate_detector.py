import time

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

    start1 = time.time()

    emb1 = model.encode(
        new_text,
        convert_to_tensor=True
    )

    print(
        f"New Text Encode: {time.time()-start1:.2f}s"
    )

    start2 = time.time()

    emb2 = model.encode(
        existing_text,
        convert_to_tensor=True
    )

    print(
        f"Existing Text Encode: {time.time()-start2:.2f}s"
    )

    similarity = util.cos_sim(
        emb1,
        emb2
    ).item()

    print(
        f"Similarity Calculation: {similarity:.4f}"
    )

    return (
        similarity >= threshold,
        similarity
    )