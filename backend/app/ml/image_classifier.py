from transformers import (
    AutoImageProcessor,
    AutoModelForImageClassification,
    pipeline
)

processor = AutoImageProcessor.from_pretrained(
    "google/vit-base-patch16-224"
)

model = AutoModelForImageClassification.from_pretrained(
    "google/vit-base-patch16-224"
)

classifier = pipeline(
    "image-classification",
    model=model,
    image_processor=processor
)

def analyze_image(image_path):

    results = classifier(image_path)

    top = results[0]

    label = top["label"].lower()

    category = "General"

    if any(
        word in label
        for word in [
            "manhole",
            "street",
            "road",
            "traffic",
            "pole"
        ]
    ):
        category = "Road"

    elif any(
        word in label
        for word in [
            "water",
            "dam",
            "river"
        ]
    ):
        category = "Water"

    elif any(
        word in label
        for word in [
            "trash",
            "garbage",
            "waste",
            "dustbin"
        ]
    ):
        category = "Waste"

    return {
        "category": category,
        "label": top["label"],
        "confidence":
            round(
                top["score"] * 100,
                2
            )
    }