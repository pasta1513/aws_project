from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from connection import get_db
from schemas.meal_schema import MealCreate, MealResponse
from services import meal_service
from services.meal_service import DuplicatMealError, UserNotFoundError

meal_router = APIRouter(tags=['Meal'])

@meal_router.post('', status_code=status.HTTP_201_CREATED)
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

@meal_router.get('')
def get_all_meals(db: Session = Depends(get_db)) -> list[MealResponse]:
    return meal_service.get_all_meals(db)

@meal_router.get('/user/{user_id}')
def get_user_meals(user_id: int, db: Session = Depends(get_db)) -> list[MealResponse]:
    return meal_service.get_user_meals(db, user_id)

@meal_router.get('/{meal_id}')
def get_meal(meal_id: int, user_id: int, db: Session = Depends(get_db)) -> MealResponse:
    meal = meal_service.get_meal(db, meal_id, user_id)

    if meal is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='해당하는 식단을 찾을 수 없습니다.'
        )

    return meal