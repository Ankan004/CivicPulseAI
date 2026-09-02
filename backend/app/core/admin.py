from fastapi import Depends
from fastapi import HTTPException

from app.models.user import User

from app.core.dependencies import (
    get_current_user,
)


# ============================================================
# ADMIN AUTHORIZATION
# ============================================================

def admin_required(
    current_user: User = Depends(
        get_current_user
    ),
) -> User:
    """
    Require the authenticated user to have
    administrator privileges.
    """

    if current_user.role != "admin":

        raise HTTPException(
            status_code=403,
            detail="Admin access required.",
        )

    return current_user