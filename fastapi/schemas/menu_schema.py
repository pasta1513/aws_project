from datetime import datetime
from typing import Literal
from pydantic import BaseModel, Field, ConfigDict

class MenuCreate(BaseModel):
    userid : str
    menu_type : Literal['아침', '점심', '저녁', '야식', '간식']
    # Literal : 적어둔 값들 중에 하나만 허용한다. 그 외의 값은 에러 코드 422.
    summary : str = Field(min_length=1, max_length=100)
    date : datetime

class MenuResponse(BaseModel):
    id : int
    user_id : int
    menu_type : str
    summary : str
    date : datetime

    model_config = ConfigDict(from_attributes=True)