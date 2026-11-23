from datetime import datetime
from sqlalchemy import String, Integer, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column

from connection import Base


class Menu(Base):
    __tablename__ = 'menu'

    id: Mapped[int] = mapped_column(Integer, autoincrement=True, primary_key=True)
    users_id: Mapped[int] = mapped_column(ForeignKey('user_id', ondelete='CASCADE'))
    menu_type: Mapped[str] = mapped_column(String(10))
    summary: Mapped[str] = mapped_column(String(100))
    date: Mapped[datetime] = mapped_column(DateTime)
