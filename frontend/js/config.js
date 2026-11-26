// 백엔드(FastAPI) 주소 설정
// - 기본값 '/api': dev_server.py(또는 배포 서버의 리버스 프록시)가 '/api'를 떼고 FastAPI로 전달한다.
// - 다른 주소의 백엔드를 직접 부르려면 여기 값을 바꾼다. (예: 'https://api.example.com')
//   이때는 백엔드에 CORS 설정이 필요하다.
export const API_BASE_URL = '/api';
