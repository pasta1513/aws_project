import enum
import datetime

from sqlalchemy import String, Integer, Date, Enum, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from connection import Base
from models.user_model import User

class MealType(str, enum.Enum):
    breakfast = 'breakfast'
    lunch = 'lunch'
    dinner = 'dinner'
    late_snack = 'late_snack'
    snack = 'snack'

class Meal(Base):
    __tablename__ = 'meals'
    __table_args__ = (UniqueConstraint('user_id', 'date', 'type'), )

    id: Mapped[int] = mapped_column(Integer, autoincrement=True, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey('users.id', ondelete='CASCADE'))
    type: Mapped[MealType] = mapped_column(Enum(MealType, native_enum=True, length=10))
    menu: Mapped[str] = mapped_column(String(255))
    date: Mapped[datetime.date] = mapped_column(Date)

    # 식단 작성자 정보를 응답에 함께 담기 위한 관계
    # lazy='joined': 식단을 조회할 때 JOIN으로 작성자를 같이 가져와서 식단마다 추가 쿼리가 나가지 않도록 함
    user: Mapped[User] = relationship(lazy='joined')
