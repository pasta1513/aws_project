from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from connection import get_db
from schemas.menu_schema import MenuCreate, MenuResponse
from services import menu_service

menu_router = APIRouter(tags=['Menu'])

@menu_router.post('', status_code=status.HTTP_201_CREATED)
def create_menu(menu_in: MenuCreate, db: Session = Depends(get_db))-> MenuResponse:
    menu = menu_service.create_menu(db, menu_in)

    if menu is None:
        raise HTTPException(
            status_code = status.HTTP_404_NOT_FOUND,
            detail = '사용자를 찾을 수 없습니다.'
        )

    return menu