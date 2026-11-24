from fastapi import APIRouter,Depends, HTTPException, status
from sqlalchemy.orm import Session

from connection import get_db
from schemas.menu_schema import MenuResponse, MenuCreate
from services import menu_service
from services.menu_service import UserNotFoundError



menu_router = APIRouter(tags=['menus'])


# 등록
@menu_router.post('', status_code=status.HTTP_201_CREATED)
def add_menu(menu_in: MenuCreate,db: Session = Depends(get_db)) -> MenuResponse:
    try:
        return menu_service.create_menu(db,menu_in)
    except UserNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='존재하지 않는 사용자입니다.'
        )


# 전체 조회
@menu_router.get('')
def get_menus(db: Session=Depends(get_db)) -> list[MenuResponse]:
    return menu_service.get_menus(db)
    


# 단일 조회
@menu_router.get('/{menuid}')
def get_menu(menuid: int,db: Session = Depends(get_db)) -> MenuResponse:
    menu = menu_service.get_menu(db,menuid)

    if menu is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='식단을 찾을 수 없습니다.'
        )

    return menu


#식단 삭제
@menu_router.delete('/{menuid}',status_code=status.HTTP_204_NO_CONTENT)
def delete_menu(menuid: int,userid:str,db: Session = Depends(get_db)):
    menu = menu_service.delete_menu(db,menuid,userid)

    if menu is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='식단을 찾을 수 없습니다.'
        )
