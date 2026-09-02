from fastapi import Depends
from fastapi import HTTPException
from fastapi.security import HTTPBearer
from fastapi.security import HTTPAuthorizationCredentials

from jose import jwt
from jose import JWTError

from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.models.user import User

from app.core.security import (
    SECRET_KEY,
    ALGORITHM,
)


# ============================================================
# HTTP AUTHENTICATION
# ============================================================

security = HTTPBearer(
    auto_error=True
)


# ============================================================
# GET CURRENT USER
# ============================================================

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(
        security
    ),
    db: Session = Depends(
        get_db
    ),
):
    """
    Validate the JWT and return the authenticated user.

    Authentication required.
    """

    # ========================================================
    # GET TOKEN
    # ========================================================

    token = credentials.credentials


    # ========================================================
    # DECODE TOKEN
    # ========================================================

    try:

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[
                ALGORITHM
            ],
        )

    except JWTError:

        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token.",
            headers={
                "WWW-Authenticate":
                    "Bearer"
            },
        )


    # ========================================================
    # GET USER IDENTITY
    # ========================================================

    email = payload.get(
        "sub"
    )


    if not email or not isinstance(
        email,
        str,
    ):

        raise HTTPException(
            status_code=401,
            detail="Invalid authentication token.",
            headers={
                "WWW-Authenticate":
                    "Bearer"
            },
        )


    # ========================================================
    # FIND USER
    # ========================================================

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
            detail="Invalid authentication token.",
            headers={
                "WWW-Authenticate":
                    "Bearer"
            },
        )


    # ========================================================
    # RETURN USER
    # ========================================================

    return user