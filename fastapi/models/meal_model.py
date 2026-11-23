import enum
import datetime

from sqlalchemy import String, Integer, Date, Enum, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from connection import Base

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
    type: Mapped[MealType] = mapped_column(Enum(MealType, native_enum=False, length=10))
    menu: Mapped[str] = mapped_column(String(255))
    date: Mapped[datetime.date] = mapped_column(Date)