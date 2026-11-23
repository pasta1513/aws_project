from pydantic import BaseModel, EmailStr, Field, ConfigDict

# API 요청과 응답에 사용할 데이터 형식을 정의
class UserCreate(BaseModel):
    userid: str = Field(min_length=2, max_length=20, pattern=r'^[a-zA-Z0-9]+$') # 영문 대소문자와 숫자만 가능
    password: str = Field(min_length=4, max_length=24)
    email: EmailStr
    name: str = Field(min_length=1, max_length=50)

class UserResponse(BaseModel):
    id: int
    userid: str
    email: str
    name: str

    # SQLAlchemy ORM 객체를 Pydantic 객체로 변환해서 사용하기 위해서 '동작 방식을 정하는 설정'
    # from_attributes=True: SQLAlchemy 객체의 속성을 읽을 수 있도록 해줌
    model_config = ConfigDict(from_attributes=True)

    # model_config: 변환할 수 있는 환경을 설정하는 것
    # model_validate(): 그 설정에 따라 실제 데이터를 검증하고 Pydantic 객체를 만드는 것

class UserUpdate(BaseModel):
    password: str = Field(min_length=4, max_length=24)
    email: EmailStr
    name: str = Field(min_length=1, max_length=50)