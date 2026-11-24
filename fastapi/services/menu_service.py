from sqlalchemy.orm import Session
from schemas.menu_schema import MenuCreate, MenuUpdate
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

def get_menus(db: Session) -> list[Menu]:
    return db.query(Menu).order_by(Menu.date.desc()).all()

def get_menu(db: Session, menu_id: int) -> Menu | None:
    return db.query(Menu).filter(Menu.id == menu_id).first()

def update_menu(db: Session, menu_id: int, menu_in: MenuUpdate) -> Menu | None:
    menu = get_menu(db, menu_id)

    if menu is None:
        return None
    
    menu.menu_type = menu_in.menu_type
    menu.summary = menu_in.summary
    menu.date = menu_in.date

    db.commit()
    db.refresh(menu)

    return menu

def delete_menu(db: Session, menu_id: int) -> bool:
    menu = get_menu(db, menu_id)

    if menu is None:
        return False
    
    db.delete(menu)
    db.commit()
    
    return True