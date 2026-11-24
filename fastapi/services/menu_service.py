from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from schemas.menu_schema import MenuCreate
from models.menu_model import Menu
from services import user_service

# userid에 해당하는 회원이 없음을 라우트에 알리기 위한 예외
class UserNotFoundError(Exception):
    pass

# 같은 회원·날짜·끼니 식단 중복을 라우트에 알리기 위한 예외
class DuplicateMenuError(Exception):
    pass

def create_menu(db: Session, menu_in: MenuCreate) -> Menu:
    user = user_service.get_user(db, menu_in.userid)

    if user is None:
        raise UserNotFoundError()

    exist = (
        db.query(Menu)
            .filter(
                Menu.user_id == user.id,
                Menu.date == menu_in.date,
                Menu.menu_time == menu_in.menu_time
            )
            .first()
    )

    if exist:
        raise DuplicateMenuError()

    menu = Menu(
        user_id = user.id,
        menu_time = menu_in.menu_time,
        date = menu_in.date,
        summary = menu_in.summary
    )
    db.add(menu)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise DuplicateMenuError()

    db.refresh(menu)
    return menu
