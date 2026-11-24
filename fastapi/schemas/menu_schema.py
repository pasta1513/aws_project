import datetime

from pydantic import BaseModel, ConfigDict, Field, computed_field, field_validator

from models.menu_model import MenuTime

# title을 만들 때 쓰는 끼니 한글 이름
MENU_TIME_KO = {
    MenuTime.breakfast: '아침',
    MenuTime.lunch: '점심',
    MenuTime.dinner: '저녁',
    MenuTime.late_snack: '야식',
    MenuTime.snack: '간식',
}

class MenuCreate(BaseModel):
    userid: str
    menu_time: MenuTime
    date: datetime.date
    summary: str = Field(min_length=1, max_length=300)

    # 앞뒤 공백을 지운 뒤 길이 검사 (공백만 있으면 422)
    @field_validator('summary', mode='before')
    @classmethod
    def strip_summary(cls, value):
        if isinstance(value, str):
            return value.strip()
        return value

class MenuResponse(BaseModel):
    menu_id: int
    userid: str
    menu_time: MenuTime
    date: datetime.date
    summary: str

    model_config = ConfigDict(from_attributes=True)

    # 저장하지 않고 계산하는 값, 예: "11월 24일 점심"
    @computed_field
    @property
    def title(self) -> str:
        return f'{self.date.month}월 {self.date.day}일 {MENU_TIME_KO[self.menu_time]}'
