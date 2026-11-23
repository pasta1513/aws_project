from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from schemas.menu_schema import MenuCreate
from models.menu_model import Menu

# 서비스: 실제로 DB에 넣고/꺼내는 일을 하는 곳
# 라우트는 "요청 받고 응답 주는 것"만, 서비스는 "DB 작업"만 담당하도록 나눔


# 존재하지 않는 userid로 등록하려 할 때 라우트에 알리기 위한 예외
class UserNotFoundError(Exception):
    pass


# 전체 조회: SELECT * FROM menu
def get_menus(db: Session) -> list[Menu]:
    return db.query(Menu).all()


# 단일 조회: SELECT * FROM menu WHERE menuid = ?
# 없으면 None 반환 → 라우트에서 404 처리
def get_menu(db: Session, menuid: int) -> Menu | None:
    return db.query(Menu).filter(Menu.menuid == menuid).first()


# 등록: INSERT INTO menu (...) VALUES (...)
def create_menu(db: Session, menu_in: MenuCreate) -> Menu:
    # 1. 스키마(요청 데이터) → 모델(DB 테이블 객체)로 옮겨 담기
    menu = Menu(
        userid=menu_in.userid,
        menu_time=menu_in.menu_time,
        menu_date=menu_in.menu_date,
        meal_type=menu_in.meal_type,
        summary=menu_in.summary,
    )

    # 2. 세션에 추가 (아직 DB에 저장된 건 아님, 대기 상태)
    db.add(menu)

    # 3. commit 해야 실제 DB에 저장됨
    try:
        db.commit()
    except IntegrityError:
        # userid가 users 테이블에 없으면 FK 제약 때문에 여기로 옴
        db.rollback()  # 실패한 작업 되돌리기
        raise UserNotFoundError()

    # 4. DB가 만들어준 값(menuid 같은 자동 증가 값)을 객체에 다시 채워 넣기
    db.refresh(menu)
    return menu
