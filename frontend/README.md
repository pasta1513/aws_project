# soban (소반) — Frontend

하루의 식탁을 기록하는 푸드 다이어리. `fastapi/` 백엔드를 그대로 사용하는 별도 프론트엔드 프로젝트입니다.

## 실행

```bash
# 1) 백엔드 (fastapi/ 에서)
python main.py            # http://127.0.0.1:8080

# 2) 프론트엔드 (frontend/ 에서)
npm install
npm run dev               # http://localhost:5173
```

- 백엔드에 CORS 설정이 없어서 Vite 개발 서버 프록시를 사용합니다. `/api/*` 요청은 `http://127.0.0.1:8080/*`로 전달됩니다.
- 백엔드 주소가 다르면 `API_PROXY_TARGET=http://host:port npm run dev`로 지정합니다.
- 다른 도메인에 배포할 경우 `VITE_API_BASE_URL`로 API 경로를 지정하고, 백엔드 CORS 설정이나 리버스 프록시가 필요합니다.

## 기술 스택

React 18 · TypeScript · Vite · React Router 6 · TanStack Query 5 · CSS Modules(디자인 토큰은 `src/styles/tokens.css`)

디자인: Playful Wellness — milky white 바탕에 식사 구분별 컬러(아침 버터 · 점심 민트 · 간식 핑크 · 저녁 피치 · 야식 라벤더), Fredoka + Pretendard. 기능 아이콘은 라인 SVG(`icons.tsx`, `MealIcon.tsx`), 장식은 스티커 일러스트(`Sticker.tsx`)로 구분합니다.

## 사용하는 API

| 화면 | API |
|---|---|
| 회원가입 | `POST /users/signup` |
| 로그인(간이) | `GET /users/{userid}` |
| 내 정보 수정 / 탈퇴 | `PUT /users/{userid}`, `DELETE /users/{userid}` |
| 대시보드·날짜 상세 | `GET /meals/user/{user_id}` → 프론트에서 날짜별로 묶음 |
| 기록 작성 | `POST /meals` |

## 백엔드 현황에 따른 제약 (의도된 동작)

- **로그인**: 백엔드에 로그인(비밀번호 검증·토큰) API가 없습니다. 그래서 아이디로 사용자가 있는지만 확인하고 세션을 localStorage에 저장합니다. 비밀번호는 검증되지 않습니다. 로그인 API가 추가되면 `src/auth/AuthContext.tsx`의 `login()`만 바꾸면 됩니다.
- **식단 수정·삭제**: 해당 라우트가 없어서 작성과 조회만 제공합니다.
- **이미지**: `meals` 테이블에 이미지 컬럼이 없어서, 메뉴 텍스트로 위에서 내려다본 식탁 일러스트를 생성해 사진 자리에 씁니다(`src/lib/plate.ts`, `src/components/Plate.tsx`). 같은 메뉴는 항상 같은 그림이 나옵니다.
- **회원정보 수정**: `UserUpdate` 스키마가 비밀번호를 필수로 받기 때문에, 저장할 때 비밀번호를 함께 입력해야 합니다.

## 구조

```
src/
  api/          # fetch 래퍼(ApiError, 422 메시지 한글화), users/meals API, 타입
  auth/         # AuthContext(간이 세션), 라우트 가드
  hooks/        # TanStack Query 훅 (useUserMeals, useDayLogs, useCreateMeal)
  lib/          # 날짜 유틸, 식사 구분 메타·날짜별 그룹핑·통계, plate(식탁 일러스트 구성)
  components/   # Button, Field, Notice, Plate, MealIcon, Sticker, StateViews(로딩/빈/오류), ConfirmDialog, layout/
  pages/        # Login, Signup, dashboard/, day/, new/, account/, NotFound
  styles/       # tokens.css, global.css
```
