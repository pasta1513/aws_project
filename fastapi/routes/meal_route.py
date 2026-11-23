from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from connection import get_db
from schemas.meal_schema import MealCreate, MealResponse
from services import meal_service
from services.meal_service import DuplicatMealError, UserNotFoundError

meal_router = APIRouter(tags=['Meal'])

@meal_router.post('/{user_id}/{type}', status_code=status.HTTP_201_CREATED)
def create_meal(meal_in: MealCreate, db: Session = Depends(get_db)) -> MealResponse:
    try:
        return meal_service.create_meal(db, meal_in)
    except UserNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='사용자를 찾을 수 없습니다.'
        )
    except DuplicatMealError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f'{meal_in.date} {meal_in.type.value} 식단이 이미 등록되어 있습니다.'
        )