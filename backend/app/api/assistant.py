import os

from dotenv import load_dotenv
from fastapi import APIRouter, Depends

from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.models.complaint import Complaint


load_dotenv()


# ============================================================
# GEMINI CONFIGURATION
# ============================================================

MODEL_NAME = "gemini-2.5-flash"


def get_gemini_client():
    """
    Create Gemini client only when the Gemini fallback
    is actually required.

    This prevents Gemini initialization from blocking
    FastAPI startup.
    """

    from google import genai

    api_key = os.getenv(
        "GOOGLE_API_KEY"
    )

    if not api_key:
        raise RuntimeError(
            "GOOGLE_API_KEY environment variable is not configured."
        )

    return genai.Client(
        api_key=api_key
    )


# ============================================================
# ROUTER
# ============================================================

router = APIRouter(
    prefix="/assistant",
    tags=["AI Assistant"],
)


# ============================================================
# SUMMARY
# ============================================================

@router.get("/summary")
def assistant_summary(
    db: Session = Depends(get_db),
):
    complaints = (
        db.query(Complaint)
        .all()
    )

    total = len(
        complaints
    )

    high = len(
        [
            c
            for c in complaints
            if (
                c.priority
                and c.priority.lower()
                == "high"
            )
        ]
    )

    pending = len(
        [
            c
            for c in complaints
            if (
                c.status
                and c.status.lower()
                == "pending"
            )
        ]
    )

    return {
        "total_complaints": total,
        "high_priority": high,
        "pending": pending,
    }


# ============================================================
# AI ASSISTANT
# ============================================================

@router.post("/ask")
def ask_assistant(
    data: dict,
    db: Session = Depends(get_db),
):
    question = (
        data.get(
            "question",
            "",
        )
        .strip()
        .lower()
    )

    # ========================================================
    # RECENT COMPLAINTS
    # ========================================================

    complaints = (
        db.query(Complaint)
        .order_by(
            Complaint.id.desc()
        )
        .limit(20)
        .all()
    )

    # ========================================================
    # EMPTY QUESTION
    # ========================================================

    if not question:

        return {
            "answer":
                "Please enter a question about the civic complaints."
        }

    # ========================================================
    # TOTAL COMPLAINTS
    # ========================================================

    if "total" in question:

        return {
            "answer":
                f"There are {len(complaints)} complaints in the system."
        }

    # ========================================================
    # HIGH PRIORITY
    # ========================================================

    elif "high priority" in question:

        count = len(
            [
                c
                for c in complaints
                if (
                    c.priority
                    and c.priority.lower()
                    == "high"
                )
            ]
        )

        return {
            "answer":
                f"There are {count} high priority complaints."
        }

    # ========================================================
    # PENDING
    # ========================================================

    elif "pending" in question:

        count = len(
            [
                c
                for c in complaints
                if (
                    c.status
                    and c.status.lower()
                    == "pending"
                )
            ]
        )

        return {
            "answer":
                f"There are {count} pending complaints."
        }

    # ========================================================
    # MOST COMMON CATEGORY
    # ========================================================

    elif (
        "category" in question
        or "most complaints" in question
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
                    0,
                )
                + 1
            )

        if not categories:

            return {
                "answer":
                    "No complaints available."
            }

        top_category = max(
            categories,
            key=categories.get,
        )

        return {
            "answer":
                f"{top_category} is the most reported category "
                f"with {categories[top_category]} complaints."
        }

    # ========================================================
    # HOTSPOT / RISK ANALYSIS
    # ========================================================

    elif (
        "risk" in question
        or "hotspot" in question
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
                and complaint.priority.lower()
                == "high"
            ):
                score += 3

            elif (
                complaint.priority
                and complaint.priority.lower()
                == "medium"
            ):
                score += 2

            else:
                score += 1

            hotspot_scores[location] = (
                hotspot_scores.get(
                    location,
                    0,
                )
                + score
            )

        if not hotspot_scores:

            return {
                "answer":
                    "No valid location data found."
            }

        hotspot = max(
            hotspot_scores,
            key=hotspot_scores.get,
        )

        return {
            "answer":
                f"Highest risk hotspot is located at "
                f"{hotspot} with risk score "
                f"{hotspot_scores[hotspot]}."
        }

    # ========================================================
    # WATER
    # ========================================================

    elif "water" in question:

        count = len(
            [
                c
                for c in complaints
                if (
                    c.category
                    and c.category.lower()
                    == "water"
                )
            ]
        )

        return {
            "answer":
                f"There are {count} water complaints."
        }

    # ========================================================
    # ELECTRICITY
    # ========================================================

    elif "electricity" in question:

        count = len(
            [
                c
                for c in complaints
                if (
                    c.category
                    and c.category.lower()
                    == "electricity"
                )
            ]
        )

        return {
            "answer":
                f"There are {count} electricity complaints."
        }

    # ========================================================
    # WASTE
    # ========================================================

    elif "waste" in question:

        count = len(
            [
                c
                for c in complaints
                if (
                    c.category
                    and c.category.lower()
                    == "waste"
                )
            ]
        )

        return {
            "answer":
                f"There are {count} waste complaints."
        }

    # ========================================================
    # MUNICIPALITY RECOMMENDATIONS
    # ========================================================

    elif (
        "fix first" in question
        or "recommendation" in question
        or "what should be fixed first"
        in question
    ):

        recommendations = []

        for complaint in complaints:

            impact_score = 0

            # ------------------------------------------------
            # Priority
            # ------------------------------------------------

            if (
                complaint.priority
                and complaint.priority.lower()
                == "high"
            ):
                impact_score += 40

            elif (
                complaint.priority
                and complaint.priority.lower()
                == "medium"
            ):
                impact_score += 20

            else:
                impact_score += 10

            # ------------------------------------------------
            # Severity
            # ------------------------------------------------

            if (
                complaint.severity
                and complaint.severity.lower()
                == "high"
            ):
                impact_score += 40

            elif (
                complaint.severity
                and complaint.severity.lower()
                == "medium"
            ):
                impact_score += 20

            else:
                impact_score += 10

            # ------------------------------------------------
            # Category criticality
            # ------------------------------------------------

            if complaint.category in [
                "Electricity",
                "Road",
            ]:

                impact_score += 10

            elif complaint.category == "Water":

                impact_score += 8

            else:

                impact_score += 5

            # ------------------------------------------------
            # Location bonus
            # ------------------------------------------------

            if (
                complaint.latitude
                and complaint.longitude
                and complaint.latitude != 0
                and complaint.longitude != 0
            ):

                impact_score += 10

            # ------------------------------------------------
            # Urgency
            # ------------------------------------------------

            if impact_score >= 90:

                urgency = "Critical"

            elif impact_score >= 70:

                urgency = "High"

            elif impact_score >= 50:

                urgency = "Medium"

            else:

                urgency = "Low"

            recommendations.append(
                {
                    "title":
                        complaint.title,

                    "category":
                        complaint.category,

                    "impact_score":
                        impact_score,

                    "severity":
                        complaint.severity,

                    "priority":
                        complaint.priority,

                    "urgency":
                        urgency,
                }
            )

        recommendations.sort(
            key=lambda x:
                x["impact_score"],
            reverse=True,
        )

        top = recommendations[:3]

        if not top:

            return {
                "answer":
                    "No complaints are available for recommendation analysis."
            }

        answer = (
            "🚨 Municipality Priority Recommendations\n\n"
        )

        for idx, item in enumerate(
            top,
            start=1,
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

    # ========================================================
    # GEMINI FALLBACK
    # ========================================================

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

        # ----------------------------------------------------
        # Lazy Gemini initialization
        # ----------------------------------------------------

        client = get_gemini_client()

        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt,
        )

        return {
            "answer":
                response.text
        }

    except Exception as e:

        print(
            "Gemini Assistant Error:",
            str(e),
        )

        return {
            "answer":
                f"Gemini Error: {str(e)}"
        }