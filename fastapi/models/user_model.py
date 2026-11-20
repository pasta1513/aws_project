from sqlalchemy import String, Integer
from sqlalchemy.orm import Mapped, mapped_column

from connection import Base

# Base를 상속받으면 SQLAlchemy가 이 클래스를 DB 테이블과 매핑
# DB 테이블을 만들고 관리하기 위한 설계도 역할
class User(Base):
    __tablename__ = 'users'

    id: Mapped[int] = mapped_column(Integer, autoincrement=True, primary_key=True)
    userid: Mapped[str] = mapped_column(String(20), unique=True)
    password: Mapped[str] = mapped_column(String(255))
    email: Mapped[str] = mapped_column(String(254), unique=True)
    name: Mapped[str] = mapped_column(String(50))