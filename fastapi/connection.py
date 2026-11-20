import os

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

load_dotenv()

DATABASE_URL = os.getenv('DATABASE_URL')
if not DATABASE_URL:
    raise RuntimeError('DATABASE_URL 환경 변수가 설정되지 않았습니다. .env 파일을 확인하세요.')

# engine: 애플리케이션과 데이터베이스 사이의 연결을 관리하는 객체
engine = create_engine(DATABASE_URL, echo=True) # SQL 실행 로그 출력

# ORM 모델들이 상속받는 부모 클래스, ORM 모델과 테이블 구조를 관리
class Base(DeclarativeBase):
    pass

# 애플리케이션에서 데이터베이스 작업을 수행하고, 그 작업의 상태를 관리하는 객체
SessionLocal = sessionmaker(bind=engine)   # autoflush=True는 기본값이라 생략

# Engine: 데이터베이스와 통신할 연결 환경을 관리하는 관리자
# Session: 실제 데이터베이스 작업을 진행하는 작업 공간

def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()