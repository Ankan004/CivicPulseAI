import os

from dotenv import load_dotenv

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)

from fastapi.security import (
    HTTPBearer,
    HTTPAuthorizationCredentials,
)

from jose import jwt, JWTError

from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.models.complaint import Complaint
from app.models.user import User
from app.core.security import (
    SECRET_KEY,
    ALGORITHM,
)


load_dotenv()


# ============================================================
# GEMINI CONFIGURATION
# ============================================================

MODEL_NAME = "gemini-2.5-flash"


# ============================================================
# OPTIONAL AUTHENTICATION
# ============================================================
#
# The Assistant remains publicly accessible.
#
# However, Gemini fallback requires authentication.
#
# auto_error=False means visitors can still use the
# database-based Assistant responses.
#

security = HTTPBearer(
    auto_error=False
)


# ============================================================
# GEMINI CLIENT
# ============================================================

def get_gemini_client():
    """
    Create Gemini client lazily.

    Gemini is initialized only when a question
    actually requires the Gemini fallback.
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
    """
    Public civic summary.

    No authentication required.
    """

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
# OPTIONAL USER VALIDATION
# ============================================================

def get_optional_user(
    credentials: HTTPAuthorizationCredentials | None,
    db: Session,
):
    """
    Validate a JWT if one was supplied.

    Returns:
        User object if authenticated.
        None if no token was supplied.

    Invalid tokens are rejected rather than silently
    treating them as anonymous.
    """

    if credentials is None:
        return None

    token = credentials.credentials

    try:

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[
                ALGORITHM
            ],
        )

        email = payload.get(
            "sub"
        )

        if not email:

            raise HTTPException(
                status_code=401,
                detail="Invalid authentication token.",
            )

    except JWTError:

        raise HTTPException(
            status_code=401,
            detail="Invalid authentication token.",
        )

    user = (
        db.query(User)
        .filter(
            User.email == email
        )
        .first()
    )

    if not user:

        raise HTTPException(
            status_code=401,
            detail="User not found.",
        )

    return user


# ============================================================
# AI ASSISTANT
# ============================================================

@router.post("/ask")
def ask_assistant(
    data: dict,
    db: Session = Depends(get_db),
    credentials: HTTPAuthorizationCredentials | None = Depends(
        security
    ),
):
    """
    CivicPulse AI Assistant.

    Public:
        - Database-based civic questions.

    Authenticated:
        - Database-based questions.
        - Gemini fallback questions.

    This protects Gemini API usage while keeping
    basic civic exploration public.
    """

    # ========================================================
    # QUESTION VALIDATION
    # ========================================================

    question = data.get(
        "question",
        "",
    )

    if not isinstance(
        question,
        str,
    ):

        question = ""

    question = question.strip()

    if not question:

        return {
            "answer":
                "Please enter a question about the civic complaints."
        }


    question_lower = question.lower()


    # ========================================================
    # LOAD RECENT COMPLAINTS
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
    # TOTAL COMPLAINTS
    # ========================================================

    if "total" in question_lower:

        # Use the actual total instead of only
        # counting the last 20 complaints.

        total = (
            db.query(Complaint)
            .count()
        )

        return {
            "answer":
                f"There are {total} complaints in the system."
        }


    # ========================================================
    # HIGH PRIORITY
    # ========================================================

    if "high priority" in question_lower:

        count = (
            db.query(Complaint)
            .filter(
                Complaint.priority.ilike(
                    "high"
                )
            )
            .count()
        )

        return {
            "answer":
                f"There are {count} high priority complaints."
        }


    # ========================================================
    # PENDING
    # ========================================================

    if "pending" in question_lower:

        count = (
            db.query(Complaint)
            .filter(
                Complaint.status.ilike(
                    "pending"
                )
            )
            .count()
        )

        return {
            "answer":
                f"There are {count} pending complaints."
        }


    # ========================================================
    # MOST COMMON CATEGORY
    # ========================================================

    if (
        "category" in question_lower
        or "most complaints"
        in question_lower
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

    if (
        "risk" in question_lower
        or "hotspot"
        in question_lower
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

    if "water" in question_lower:

        count = (
            db.query(Complaint)
            .filter(
                Complaint.category.ilike(
                    "water"
                )
            )
            .count()
        )

        return {
            "answer":
                f"There are {count} water complaints."
        }


    # ========================================================
    # ELECTRICITY
    # ========================================================

    if "electricity" in question_lower:

        count = (
            db.query(Complaint)
            .filter(
                Complaint.category.ilike(
                    "electricity"
                )
            )
            .count()
        )

        return {
            "answer":
                f"There are {count} electricity complaints."
        }


    # ========================================================
    # WASTE
    # ========================================================

    if "waste" in question_lower:

        count = (
            db.query(Complaint)
            .filter(
                Complaint.category.ilike(
                    "waste"
                )
            )
            .count()
        )

        return {
            "answer":
                f"There are {count} waste complaints."
        }


    # ========================================================
    # MUNICIPALITY RECOMMENDATIONS
    # ========================================================

    if (
        "fix first"
        in question_lower
        or "recommendation"
        in question_lower
        or "what should be fixed first"
        in question_lower
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
    #
    # Everything above can be used publicly.
    #
    # Unknown/general questions require authentication
    # before consuming Gemini.
    #

    current_user = get_optional_user(
        credentials,
        db,
    )


    if current_user is None:

        raise HTTPException(
            status_code=401,
            detail=(
                "Please login to use "
                "advanced AI Assistant analysis."
            ),
        )


    # ========================================================
    # BUILD COMPLAINT SUMMARY
    # ========================================================

    summary_parts = []

    for complaint in complaints:

        summary_parts.append(
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


    summary = "\n".join(
        summary_parts
    )


    # ========================================================
    # GEMINI PROMPT
    # ========================================================

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


    # ========================================================
    # GEMINI REQUEST
    # ========================================================

    try:

        client = get_gemini_client()

        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt,
        )


        answer = (
            response.text
            or "Gemini returned an empty response."
        ).strip()


        return {
            "answer": answer
        }


    except Exception as e:

        # Log detailed error server-side.

        print(
            "Gemini Assistant Error:",
            str(e),
        )


        # Do NOT expose the actual exception,
        # API details, quota information,
        # or internal configuration to users.

        return {
            "answer":
                "The advanced AI Assistant is temporarily unavailable. "
                "Please try again later."
        }