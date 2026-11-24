import enum
from datetime import datetime,date
from sqlalchemy import Enum, String, Integer,DateTime,Date,ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from connection import Base

# Base를 상속받으면 SQLAlchemy가 이 클래스를 DB 테이블과 매핑
# DB 테이블을 만들고 관리하기 위한 설계도 역할

#Enum 허용되는 값 목록. 이 중 하나만 컬럼에 저장
class MealType(str,enum.Enum):
    breakfast ="breakfast"
    lunch="lunch"
    dinner="dinner"
    late_snack="late_snack"
    snack="snack"


class Menu(Base):
    __tablename__ = 'menu'
    #mapped_column은 Base를 상속한 모델 클래스 안에서만 db 컬럼 동작
    id: Mapped[int] = mapped_column(Integer, autoincrement=True, primary_key=True) #menuid보다는 _로 구분 해주기 (외래키를 참조할 때가 _사용)
    # Integer -> int로 저장하라는 뜻 
    user_id: Mapped[str] = mapped_column(Integer,ForeignKey('users.id')) #fk #user_id
    time: Mapped[datetime] = mapped_column(DateTime) #yyyy-mm-dd hh:mm
    date: Mapped[datetime.date] = mapped_column(Date) #yyyy-mm-dd 타이틀
    #native_enum=False -> DB ENUM 타입을 쓰지 않고 그냥 VARCHAR 문자열 컬럼
    type: Mapped[MealType] = mapped_column(Enum(MealType, native_enum=False, length=10)) #아침인지, 점심인지, 저녁인지, 간식인지 
    summary: Mapped[str] = mapped_column(String(255)) #255가 최대


    #날짜만 받아도 충분할 것 같다 (식단 기록 - 한 번에 올릴 수 있으니까)
    # 최대가 255 글자
    #meal_type => enum으로 받기로 했으니까 메뉴 타입에만 쓸 메뉴 타입 클래스를 따로 빼라 (아점저간야)
