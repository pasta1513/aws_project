# soban (소반) — Frontend

하루의 식탁을 기록하는 푸드 다이어리. `fastapi/` 백엔드를 그대로 사용하는 프론트엔드입니다.
빌드 도구 없이 **HTML · CSS · JavaScript(ES 모듈)** 만으로 만들었습니다. `npm install`이 필요 없습니다.

## 실행

```bash
# 1) 백엔드 (fastapi/ 에서)
python main.py              # http://127.0.0.1:8080

# 2) 프론트엔드 (frontend/ 에서)
python dev_server.py        # http://localhost:5173
```

- 백엔드에 CORS 설정이 없어서 `dev_server.py`가 프록시 역할을 합니다. `/api/*` 요청은 `/api`를 떼고 `http://127.0.0.1:8080/*`로 전달됩니다.
- 백엔드 주소가 다르면 `python dev_server.py --api http://host:port`로 지정합니다. 포트는 `--port`로 바꿉니다.
- ES 모듈을 쓰기 때문에 html 파일을 더블클릭(file://)으로 열면 동작하지 않습니다. 꼭 서버로 열어 주세요.
- 배포할 때는 이 폴더를 그대로 정적 파일로 올리고, 웹 서버(nginx 등)에서 `/api`를 백엔드로 프록시합니다. 백엔드를 다른 주소로 직접 부르려면 `js/config.js`의 `API_BASE_URL`을 바꾸고 백엔드에 CORS를 허용해야 합니다.

## 화면

| 파일 | 화면 | 사용하는 API |
|---|---|---|
| `login.html` | 로그인(간이) | `GET /users/{userid}` |
| `signup.html` | 회원가입 | `POST /users/signup` |
| `index.html` | 대시보드 | `GET /meals/user/{user_id}` → 프론트에서 날짜별로 묶음 |
| `day.html?date=YYYY-MM-DD` | 날짜 상세 | `GET /meals/user/{user_id}` |
| `new.html?date=&type=` | 기록 작성 | `POST /meals` |
| `account.html` | 내 정보 수정 / 탈퇴 | `PUT /users/{userid}`, `DELETE /users/{userid}` |
| `404.html` | 없는 페이지 | — |

디자인: Playful Wellness — milky white 바탕에 식사 구분별 컬러(아침 버터 · 점심 민트 · 간식 핑크 · 저녁 피치 · 야식 라벤더), Fredoka + Pretendard. 기능 아이콘은 라인 SVG, 장식은 스티커 일러스트로 구분합니다.

## 백엔드 현황에 따른 제약 (의도된 동작)

- **로그인**: 백엔드에 로그인(비밀번호 검증·토큰) API가 없습니다. 그래서 아이디로 사용자가 있는지만 확인하고 세션을 localStorage에 저장합니다. 비밀번호는 검증되지 않습니다. 로그인 API가 추가되면 `js/auth.js`의 `login()`만 바꾸면 됩니다.
- **식단 수정·삭제**: 해당 라우트가 없어서 작성과 조회만 제공합니다.
- **이미지**: `meals` 테이블에 이미지 컬럼이 없어서, 메뉴 텍스트로 위에서 내려다본 식탁 일러스트를 생성해 사진 자리에 씁니다(`js/plate.js`). 같은 메뉴는 항상 같은 그림이 나옵니다.
- **회원정보 수정**: `UserUpdate` 스키마가 비밀번호를 필수로 받기 때문에, 저장할 때 비밀번호를 함께 입력해야 합니다.

## 구조

```
frontend/
  *.html            # 화면 하나 = html 하나 (body 는 비어 있고 js/pages/*.js 가 그림)
  dev_server.py     # 개발용 서버: 정적 파일 + /api 프록시
  favicon.svg
  css/
    tokens.css      # 디자인 토큰 (색·글꼴·간격)
    global.css      # 전역 스타일 (.container, .input, .chip …)
    components.css  # 공통 부품 (.btn-*, .field-*, .notice-*, .plate-*, .sticker-* …)
    app-layout.css  # 로그인 후 헤더·탭바 (.app-*)
    auth-layout.css # 로그인·회원가입 틀 (.auth-*)
    dashboard.css · day.css · new.css · account.css · notfound.css  # 화면별 (.dash-*, .day-*, .new-*, .acct-*, .nf-*)
  js/
    config.js       # API 주소
    api.js          # ★ 백엔드와 통신하는 유일한 곳 (fetch 래퍼, 422 메시지 한글화, users/meals API)
    auth.js         # 간이 세션, 로그인 필요 화면 / 손님 전용 화면 처리
    data.js         # 식단 목록 받아서 날짜별로 묶기
    date.js · meal.js · validation.js   # 날짜 유틸, 식사 구분 메타·통계, 회원 정보 검증
    plate.js        # 식탁 일러스트 구성·SVG
    ui.js           # 아이콘, 스티커, 버튼, 입력칸, 안내, 빈/오류 상태, 확인 대화상자, 화면 주소(routes)
    layout.js       # 공통 틀 (헤더·탭바 / 로그인 화면 콜라주)
    pages/          # 화면별 스크립트 (login, signup, dashboard, day, new, account, notfound)
```

CSS 클래스는 `화면접두어-이름` 규칙을 씁니다(예: `.dash-hero`, `.btn-primary`). 전역 스타일(`global.css`)은 React 빌드와 같은 우선순위를 갖도록 html에서 **마지막에** 불러옵니다.
