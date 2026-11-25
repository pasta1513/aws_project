from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from routes.user_route import user_router
from routes.meal_route import meal_router

app = FastAPI()

# 프론트엔드(port:5500)에서 API를 호출할 수 있도록 하는 CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=['http://localhost:5500', 'http://127.0.0.1:5500'],
    allow_methods=['*'],
    allow_headers=['*'],
)

app.include_router(user_router, prefix='/users')
app.include_router(meal_router, prefix='/meals')

if __name__ == '__main__':
    uvicorn.run('main:app', host='127.0.0.1', port=8080, reload=True)