import google.generativeai as genai
import os
from dotenv import load_dotenv
from fastapi import APIRouter
from fastapi import Depends

from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.models.complaint import Complaint
load_dotenv()

genai.configure(
    api_key=os.getenv(
        "GOOGLE_API_KEY"
    )
)

model = genai.GenerativeModel(
    "gemini-2.5-flash"
)

router = APIRouter(
    prefix="/assistant",
    tags=["AI Assistant"]
)

@router.get("/summary")
def assistant_summary(
    db: Session = Depends(get_db)
):

    complaints = db.query(
        Complaint
    ).all()

    total = len(complaints)

    high = len([
        c for c in complaints
        if c.priority == "high"
    ])

    pending = len([
        c for c in complaints
        if c.status == "pending"
    ])

    return {
        "total_complaints":
            total,

        "high_priority":
            high,

        "pending":
            pending
    }
from fastapi import Body

@router.post("/ask")
def ask_assistant(
    data: dict,
    db: Session = Depends(get_db)
):

    question = (
        data.get("question", "")
        .lower()
    )

    complaints = db.query(
    Complaint
).order_by(
    Complaint.id.desc()
).limit(20).all()

    # Total Complaints

    if "total" in question:

        return {
            "answer":
                f"There are {len(complaints)} complaints in the system."
        }

    # High Priority

    elif "high priority" in question:

        count = len([
            c for c in complaints
            if (
                c.priority
                and
                c.priority.lower() == "high"
            )
        ])

        return {
            "answer":
                f"There are {count} high priority complaints."
        }

    # Pending

    elif "pending" in question:

        count = len([
            c for c in complaints
            if (
                c.status
                and
                c.status.lower() == "pending"
            )
        ])

        return {
            "answer":
                f"There are {count} pending complaints."
        }

    # Most Common Category

    elif (
        "category" in question
        or
        "most complaints" in question
    ):

        categories = {}

        for complaint in complaints:

            category = (
                complaint.category
                or "Unknown"
            )

            categories[category] = (
                categories.get(
                    category,
                    0
                ) + 1
            )

        if not categories:

            return {
                "answer":
                    "No complaints available."
            }

        top_category = max(
            categories,
            key=categories.get
        )

        return {
            "answer":
                f"{top_category} is the most reported category with {categories[top_category]} complaints."
        }

    # Hotspot Analysis

        # Hotspot Analysis

    elif (
        "risk" in question
        or
        "hotspot" in question
    ):

        hotspot_scores = {}

        for complaint in complaints:

            if (
                complaint.latitude is None
                or complaint.longitude is None
                or complaint.latitude == 0
                or complaint.longitude == 0
            ):
                continue

            location = (
                f"{complaint.latitude}, "
                f"{complaint.longitude}"
            )

            score = 0

            if (
                complaint.priority
                and
                complaint.priority.lower()
                == "high"
            ):
                score += 3

            elif (
                complaint.priority
                and
                complaint.priority.lower()
                == "medium"
            ):
                score += 2

            else:
                score += 1

            hotspot_scores[location] = (
                hotspot_scores.get(
                    location,
                    0
                ) + score
            )

        if not hotspot_scores:

            return {
                "answer":
                    "No valid location data found."
            }

        hotspot = max(
            hotspot_scores,
            key=hotspot_scores.get
        )

        return {
            "answer":
                f"Highest risk hotspot is located at {hotspot} with risk score {hotspot_scores[hotspot]}."
        }

    # Water Complaints

    elif "water" in question:

        count = len([
            c for c in complaints
            if (
                c.category
                and
                c.category.lower()
                == "water"
            )
        ])

        return {
            "answer":
                f"There are {count} water complaints."
        }

    # Electricity Complaints

    elif "electricity" in question:

        count = len([
            c for c in complaints
            if (
                c.category
                and
                c.category.lower()
                == "electricity"
            )
        ])

        return {
            "answer":
                f"There are {count} electricity complaints."
        }

    # Waste Complaints

    elif "waste" in question:

        count = len([
            c for c in complaints
            if (
                c.category
                and
                c.category.lower()
                == "waste"
            )
        ])

        return {
            "answer":
                f"There are {count} waste complaints."
        }
            # AI Recommendation Engine

    elif (
        "fix first" in question
        or
        "recommendation" in question
        or
        "what should be fixed first" in question
    ):

        recommendations = []

        for complaint in complaints:

            impact_score = 0

            # Priority Score

            if (
                complaint.priority
                and
                complaint.priority.lower() == "high"
            ):
                impact_score += 40

            elif (
                complaint.priority
                and
                complaint.priority.lower() == "medium"
            ):
                impact_score += 20

            else:
                impact_score += 10

            # Severity Score

            if (
                complaint.severity
                and
                complaint.severity.lower() == "high"
            ):
                impact_score += 40

            elif (
                complaint.severity
                and
                complaint.severity.lower() == "medium"
            ):
                impact_score += 20

            else:
                impact_score += 10

            # Category Criticality

            if complaint.category in [
                "Electricity",
                "Road"
            ]:
                impact_score += 10

            elif complaint.category == "Water":
                impact_score += 8

            else:
                impact_score += 5

            # Location Bonus

            if (
                complaint.latitude
                and complaint.longitude
                and complaint.latitude != 0
                and complaint.longitude != 0
            ):
                impact_score += 10

            # Urgency Classification

            if impact_score >= 90:
                urgency = "Critical"

            elif impact_score >= 70:
                urgency = "High"

            elif impact_score >= 50:
                urgency = "Medium"

            else:
                urgency = "Low"

            recommendations.append({
                "title": complaint.title,
                "category": complaint.category,
                "impact_score": impact_score,
                "severity": complaint.severity,
                "priority": complaint.priority,
                "urgency": urgency
            })

        recommendations.sort(
            key=lambda x: x["impact_score"],
            reverse=True
        )

        top = recommendations[:3]

        answer = (
            "🚨 Municipality Priority Recommendations\n\n"
        )

        for idx, item in enumerate(
            top,
            start=1
        ):

            answer += (
                f"{idx}. {item['title']}\n"
                f"Category: {item['category']}\n"
                f"Priority: {item['priority']}\n"
                f"Severity: {item['severity']}\n"
                f"Impact Score: {item['impact_score']}/100\n"
                f"Urgency: {item['urgency']}\n\n"
            )

        return {
            "answer": answer
        }
            # Gemini Fallback

    summary = ""

    for complaint in complaints:

        summary += (
            f"""
Title: {complaint.title}
Category: {complaint.category}
Priority: {complaint.priority}
Severity: {complaint.severity}
Status: {complaint.status}
Latitude: {complaint.latitude}
Longitude: {complaint.longitude}
"""
        )

    prompt = f"""
You are CivicPulse AI,
an expert Smart City Analyst and Municipal Advisor.

Analyze the complaint data carefully and provide:

1. Highest risk areas
2. Most common complaint categories
3. Urgent complaints requiring action
4. Municipality recommendations
5. Emerging trends and observations

Complaint Data:

{summary}

User Question:

{question}

Guidelines:
- Give clear and concise answers.
- Use complaint data to justify conclusions.
- Mention specific locations when relevant.
- Prioritize public safety issues.
- Provide actionable recommendations.

Answer:
"""

    try:

        response = model.generate_content(
            prompt
        )

        return {
            "answer":
                response.text
        }

    except Exception as e:

        return {
            "answer":
                f"Gemini Error: {str(e)}"
        }