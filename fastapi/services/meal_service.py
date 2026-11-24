from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from schemas.meal_schema import MealCreate
from models.meal_model import Meal
from models.user_model import User

class DuplicatMealError(Exception):
    pass

class UserNotFoundError(Exception):
    pass

def create_meal(db: Session, meal_in: MealCreate) -> Meal:
    if db.get(User, meal_in.user_id) is None:
        raise UserNotFoundError()
    
    exist = (
        db.query(Meal)
            .filter(Meal.user_id == meal_in.user_id,
                    Meal.date == meal_in.date,
                    Meal.type == meal_in.type,
                    )
            .first()
    )

    if exist:
        raise DuplicatMealError()

    meal = Meal(
        user_id = meal_in.user_id,
        type = meal_in.type,
        menu = meal_in.menu,
        date = meal_in.date
    )
    db.add(meal)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise DuplicatMealError()

    db.refresh(meal)
    return meal