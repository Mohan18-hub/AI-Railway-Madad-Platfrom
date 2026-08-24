"""RailMadad AI Platform — Authentication Routes."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas import OTPRequest, OTPVerify, TokenResponse, TokenRefresh, MessageResponse

router = APIRouter()


@router.post("/otp/request", response_model=MessageResponse)
async def request_otp(
    payload: OTPRequest,
    db: AsyncSession = Depends(get_db),
) -> MessageResponse:
    """Send OTP to user's phone or email for authentication."""
    # TODO: Implement OTP generation and sending via SMS/Email provider
    if not payload.phone and not payload.email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either phone or email is required",
        )
    return MessageResponse(message="OTP sent successfully")


@router.post("/otp/verify", response_model=TokenResponse)
async def verify_otp(
    payload: OTPVerify,
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    """Verify OTP and return JWT access + refresh tokens."""
    # TODO: Implement OTP verification, user creation/lookup, token generation
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="OTP verification not yet implemented",
    )


@router.post("/token/refresh", response_model=TokenResponse)
async def refresh_token(
    payload: TokenRefresh,
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    """Refresh an expired access token using a valid refresh token."""
    # TODO: Implement token refresh logic
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Token refresh not yet implemented",
    )


@router.post("/guest/register", response_model=TokenResponse)
async def guest_register(
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    """Register as a guest user and receive temporary access tokens."""
    # TODO: Create guest user and issue limited-scope tokens
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Guest registration not yet implemented",
    )
