from pydantic import BaseModel,ConfigDict,Field
from datetime import date, datetime
from typing import Literal


class MenuCreate(BaseModel):
    user_id: int #userid가 아닌 user_id가 있어야함
    summary: str = Field(max_length=254)
    type: Literal['아침','점심','저녁','간식']
    time: datetime
    date: datetime.date
    # 날짜와 시간은 몰아서 올리는 경우가 있어서
    # now 쓰지 않았음


class MenuResponse(BaseModel):
    menuid: int #pk key -> 식별 키는 외부에 보일 필요 없어서 굳이 필요 없음
    userid: str #user ID -> _가 있으면 sql에 있는 table 
    menu_time: datetime #title
    menu_date: date # datetime.date
    # picture #추후 기능
    meal_type: str # 아침, 점심, 저녁, 간식으로 받을건데
    summary: str # subtitle 설명? 수정할 때도 값을 받아야하니까 최소는 1 ~ 255


    model_config = ConfigDict(from_attributes=True)


    # 만들 때 생성할 때 받아올 때 다 세개를 나눠서 받는 것이 좋음
