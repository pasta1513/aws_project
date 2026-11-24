from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from connection import get_db
from schemas.menu_schema import MenuCreate, MenuResponse
from services import menu_service
from services.menu_service import UserNotFoundError, DuplicateMenuError

menu_router = APIRouter(tags=['Menu'])

@menu_router.post('', status_code=status.HTTP_201_CREATED)
def create_menu(menu_in: MenuCreate, db: Session = Depends(get_db)) -> MenuResponse:
    try:
        return menu_service.create_menu(db, menu_in)
    except UserNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='사용자를 찾을 수 없습니다.'
        )
    except DuplicateMenuError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail='이미 같은 날짜·끼니의 식단이 있습니다.'
        )
