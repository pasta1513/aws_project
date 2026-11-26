import datetime

from pydantic import BaseModel, Field, ConfigDict

from models.meal_model import MealType

# API 요청과 응답에 사용할 데이터 형식을 정의
class MealCreate(BaseModel):
    user_id: int
    type: MealType
    menu: str = Field(min_length=1, max_length=255)
    date: datetime.date

# 식단 응답에 함께 보여줄 작성자 정보 (이메일 등은 노출하지 않음)
class MealAuthor(BaseModel):
    userid: str
    name: str

    model_config = ConfigDict(from_attributes=True)

class MealResponse(BaseModel):
    id: int
    user_id: int
    user: MealAuthor
    type: MealType
    menu: str
    date: datetime.date

    model_config = ConfigDict(from_attributes=True)

class MealUpdate(BaseModel):
    type: MealType
    menu: str = Field(min_length=1, max_length=255)