from datetime import datetime,date
from sqlalchemy import String, Integer,DateTime,Date,ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from connection import Base

# Base를 상속받으면 SQLAlchemy가 이 클래스를 DB 테이블과 매핑
# DB 테이블을 만들고 관리하기 위한 설계도 역할
class Menu(Base):
    __tablename__ = 'menu'

    menuid: Mapped[int] = mapped_column(Integer, autoincrement=True, primary_key=True)
    userid: Mapped[str] = mapped_column(String(20),ForeignKey('users.userid')) #fk
    menu_time: Mapped[datetime] = mapped_column(DateTime) #yyyy-mm-dd hh:mm
    menu_date: Mapped[date] = mapped_column(Date) #yyyy-mm-dd 타이틀
    meal_type: Mapped[str] = mapped_column(String(10)) #아침인지, 점심인지, 저녁인지, 간식인지 
    summary: Mapped[str] = mapped_column(String(254))