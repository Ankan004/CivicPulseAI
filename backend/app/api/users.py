from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException

from sqlalchemy.orm import Session

from app.models.user import User

from app.database.dependencies import get_db

from app.core.dependencies import (
    get_current_user,
)

from app.core.admin import (
    admin_required,
)


# ============================================================
# ROUTER
# ============================================================

router = APIRouter(
    prefix="/users",
    tags=["Users"],
)


# ============================================================
# GET CURRENT USER
# ============================================================

@router.get("/me")
def get_current_user_profile(
    current_user: User = Depends(
        get_current_user
    ),
):
    """
    Return the currently authenticated user's
    public profile information.

    Authentication required.
    """

    return {
        "id":
            current_user.id,

        "name":
            current_user.name,

        "email":
            current_user.email,

        "role":
            current_user.role,
    }


# ============================================================
# MAKE USER ADMIN
# ============================================================

@router.patch(
    "/make-admin/{user_id}"
)
def make_admin(
    user_id: int,

    db: Session = Depends(
        get_db
    ),

    admin_user: User = Depends(
        admin_required
    ),
):
    """
    Promote a user to administrator.

    ADMIN ONLY.
    """

    user = (
        db.query(User)
        .filter(
            User.id == user_id
        )
        .first()
    )


    # ========================================================
    # USER NOT FOUND
    # ========================================================

    if not user:

        raise HTTPException(
            status_code=404,
            detail="User not found",
        )


    # ========================================================
    # ALREADY ADMIN
    # ========================================================

    if user.role == "admin":

        return {
            "message":
                f"{user.name} is already an admin",

            "user_id":
                user.id,

            "role":
                user.role,
        }


    # ========================================================
    # PROMOTE USER
    # ========================================================

    user.role = "admin"

    db.commit()

    db.refresh(user)


    # ========================================================
    # RESPONSE
    # ========================================================

    return {
        "message":
            f"{user.name} is now admin",

        "user_id":
            user.id,

        "role":
            user.role,
    }