from fastapi import FastAPI
import uvicorn

from routes.user_route import user_router
from routes.meal_route import meal_router

app = FastAPI()

app.include_router(user_router, prefix='/users')
app.include_router(meal_router, prefix='/meals')

if __name__ == '__main__':
    uvicorn.run('main:app', host='127.0.0.1', port=8080, reload=True)