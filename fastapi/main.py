from fastapi import FastAPI
import uvicorn

from routes.user_route import user_router
from routes.menu_route import menu_router

app = FastAPI()

app.include_router(user_router, prefix='/users')
app.include_router(menu_router, prefix='/menus')

if __name__ == '__main__':
    uvicorn.run('main:app', host='127.0.0.1', port=8080, reload=True)