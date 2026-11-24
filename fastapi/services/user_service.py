import bcrypt
from sqlalchemy.orm import Session
from sqlalchemy import or_
from sqlalchemy.exc import IntegrityError

from schemas.user_schema import UserCreate, UserUpdate
from models.user_model import User

# 아이디/이메일 중복을 라우트에 알리기 위한 예외
class DuplicateUserError(Exception):
    pass

def get_users(db: Session) -> list[User]:
    # ORM 객체를 그대로 반환하면 라우트의 반환 타입(list[UserResponse])이
    # from_attributes 설정에 따라 Pydantic 객체로 변환해 줌
    return db.query(User).all()

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def create_user(db: Session, user_in: UserCreate) -> User:
    email = user_in.email.lower()
    exist = (
        db.query(User)
            .filter(or_(User.userid == user_in.userid, User.email == email))
            .first()
    )

    if exist:
        raise DuplicateUserError()

    user = User(
        userid = user_in.userid,
        password = hash_password(user_in.password),
        email = email,
        name = user_in.name
    )
    db.add(user)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise DuplicateUserError()

    db.refresh(user)
    return user

def get_user(db: Session, userid: str) -> User | None:
    return db.query(User).filter(User.userid == userid).first()

def update_user(db: Session, userid: str, user_in: UserUpdate) -> User | None:
    user = db.query(User).filter(User.userid == userid).first()

    if user is None:
        return None

    user.password = hash_password(user_in.password)
    user.email = user_in.email.lower()
    user.name = user_in.name

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise DuplicateUserError()

    db.refresh(user)
    return user

def delete_user(db: Session, userid: str) -> bool:      # 지웠으면 True, 못 찾았으면 False
    user = get_user(db, userid)                         # 위에 이미 있는 get_user로 아이디 찾기 (같은 코드 다시 안 씀)

    if user is None:                                    # 그런 회원이 없으면
        return False                                    # "못 찾았다"만 알림 (오류 번호는 라우터가 정함)

    db.delete(user)                                     # 이 회원 줄을 지우라고 표시
    db.commit()                                         # DB에 확정
    return True                                         # "지웠다"