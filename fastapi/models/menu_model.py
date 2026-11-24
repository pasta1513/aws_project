import datetime
import enum

from sqlalchemy import Date, Enum, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from connection import Base
from models.user_model import User

# 끼니 종류, model과 schema가 같이 사용
# SQLAlchemy Enum은 DB에 멤버 이름을 저장하므로 이름과 값을 같은 소문자로 맞춤
class MenuTime(str, enum.Enum):
    breakfast = 'breakfast'
    lunch = 'lunch'
    dinner = 'dinner'
    late_snack = 'late_snack'
    snack = 'snack'

class Menu(Base):
    __tablename__ = 'menus'
    # 같은 회원·날짜·끼니 조합은 하나만
    __table_args__ = (
        UniqueConstraint('user_id', 'date', 'menu_time', name='uq_menus_user_date_time'),
    )

    menu_id: Mapped[int] = mapped_column(Integer, autoincrement=True, primary_key=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey('users.id', ondelete='CASCADE'))
    menu_time: Mapped[MenuTime] = mapped_column(Enum(MenuTime, native_enum=False))
    date: Mapped[datetime.date] = mapped_column(Date)
    summary: Mapped[str] = mapped_column(String(300))

    # Menu 쪽에만 둔 관계, 응답의 userid를 읽기 위해 사용
    user: Mapped[User] = relationship()

    @property
    def userid(self) -> str:
        return self.user.userid
