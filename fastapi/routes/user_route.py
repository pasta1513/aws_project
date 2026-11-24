from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from connection import get_db
from schemas.user_schema import UserCreate, UserResponse, UserUpdate
from services import user_service
from services.user_service import DuplicateUserError,UserHasMenuError

user_router = APIRouter(tags=['User'])

@user_router.get('')
def get_users(db: Session = Depends(get_db)) -> list[UserResponse]:
    users = user_service.get_users(db)

    return users

@user_router.post('/signup', status_code=status.HTTP_201_CREATED)
def sign_up(user_in: UserCreate, db: Session = Depends(get_db)) -> UserResponse:
    try:
        return user_service.create_user(db, user_in)
    except DuplicateUserError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail='이미 존재하는 아이디 혹은 이메일입니다.'
        )

@user_router.get('/{userid}')
def get_user(userid: str, db: Session = Depends(get_db)) -> UserResponse:
    user = user_service.get_user(db, userid)

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='사용자를 찾을 수 없습니다.'
        )

    return user

@user_router.put('/{userid}')
def update_user(userid: str, user_in: UserUpdate, db: Session = Depends(get_db)) -> UserResponse:
    try:
        user = user_service.update_user(db, userid, user_in)
    except DuplicateUserError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail='이미 사용 중인 이메일입니다.'
        )

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='사용자 id가 존재하지 않습니다.'
        )

    return user


# 회원 삭제
@user_router.delete('/{userid}',status_code=status.HTTP_204_NO_CONTENT)
def delete_user(userid:str, db: Session=Depends(get_db)):
    try:
        user = user_service.delete_user(db, userid)
    except UserHasMenuError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="메뉴부터 삭제 하세요."
        )
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='없는 회원 입니다.'
        )