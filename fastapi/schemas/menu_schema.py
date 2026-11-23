from pydantic import BaseModel,ConfigDict,Field
from datetime import date, datetime
from typing import Literal


class MenuCreate(BaseModel):
    userid: str = Field(max_length=20)
    summary: str = Field(max_length=254)
    meal_type: Literal['아침','점심','저녁','간식']
    menu_time: datetime
    menu_date: date
    # 날짜와 시간은 몰아서 올리는 경우가 있어서
    # now 쓰지 않았음


class MenuResponse(BaseModel):
    menuid: int #pk key
    userid: str #user ID
    menu_time: datetime #title
    menu_date: date
    # picture #추후 기능
    meal_type: str # 아침, 점심, 저녁, 간식으로 받을건데
    summary: str # subtitle 설명?


    model_config = ConfigDict(from_attributes=True)