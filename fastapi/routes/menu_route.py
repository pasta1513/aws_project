from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from connection import get_db
from schemas.menu_schema import MenuCreate, MenuResponse, MenuUpdate
from services import menu_service

menu_router = APIRouter(tags=['Menu'])

@menu_router.post('', status_code=status.HTTP_201_CREATED)
def create_menu(menu_in: MenuCreate, db: Session = Depends(get_db))-> MenuResponse:
    menu = menu_service.create_menu(db, menu_in)

    if menu is None:
        raise HTTPException(
            status_code = status.HTTP_404_NOT_FOUND,
            detail = '작성자를 찾을 수 없습니다.'
        )

    return menu

@menu_router.get('')
def get_menus(db: Session = Depends(get_db)) -> list[MenuResponse]:
    return menu_service.get_menus(db)

@menu_router.get('/{menu_id}')
def get_menu(menu_id: int, db: Session = Depends(get_db)) -> MenuResponse:
    menu = menu_service.get_menu(db, menu_id)

    if menu is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail='글을 찾을 수 없습니다.'
            )
    
    return menu

@menu_router.put('/{menu_id}')
def update_menu(menu_id: int, menu_in: MenuUpdate, db: Session = Depends(get_db)) -> MenuResponse:
    menu = menu_service.update_menu(db, menu_id, menu_in)

    if menu is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail='글을 찾을 수 없습니다.'
            )
    
    return menu

@menu_router.delete('/{menu_id}', status_code=status.HTTP_204_NO_CONTENT)
def delete_menu(menu_id: int, db: Session = Depends(get_db)) -> None:

    if not menu_service.delete_menu(db, menu_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail='글을 찾을 수 없습니다.'
            )