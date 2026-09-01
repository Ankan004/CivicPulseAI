import pandas as pd
import random

df = pd.read_csv("complaints_dataset.csv")

title_variations = [
    "near market",
    "near station",
    "near school",
    "near hospital",
    "near bus stand",
    "near railway station",
    "in ward 5",
    "in ward 10"
]

description_variations = [
    "Residents are affected",
    "Public safety issue",
    "Needs urgent attention",
    "Causing inconvenience",
    "Problem worsening daily",
    "Authorities should inspect immediately"
]

new_rows = []

for _, row in df.iterrows():

    for i in range(10):

        new_title = (
            row["title"] +
            " " +
            random.choice(title_variations)
        )

        new_description = (
            row["description"] +
            ". " +
            random.choice(description_variations)
        )

        new_rows.append({
            "title": new_title,
            "description": new_description,
            "category": row["category"],
            "severity": row["severity"],
            "priority": row["priority"]
        })

new_df = pd.DataFrame(new_rows)

final_df = pd.concat(
    [df, new_df],
    ignore_index=True
)

final_df.to_csv(
    "expanded_dataset.csv",
    index=False
)

print(
    f"Generated {len(final_df)} rows"
)