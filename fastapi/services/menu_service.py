from sqlalchemy.orm import Session
from schemas.menu_schema import MenuCreate
from models.menu_model import Menu
from models.user_model import User

def create_menu(db: Session, menu_in: MenuCreate) -> Menu | None:
    user = db.query(User).filter(User.userid == menu_in.userid).first()

    if user is None:
        return None

    menu = Menu(
        user_id = user.id,
        menu_type = menu_in.menu_type,
        summary = menu_in.summary,
        date = menu_in.date
    )

    db.add(menu)
    db.commit()
    db.refresh(menu)

    return menu