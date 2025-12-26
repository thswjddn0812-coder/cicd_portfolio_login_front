import axios from "axios";
import { useAuthStore } from "../store/authStore";

const api = axios.create({
  baseURL: "http://localhost:3001",
  withCredentials: true,
});

// 요청 인터셉터 추가: 모든 요청 전에 실행됨
api.interceptors.request.use(
  (config) => {
    // 1. 서버 사이드 렌더링(SSR) 중에는 토큰 접근 불가하므로 패스
    if (typeof window === "undefined") return config;

    // 2. Zustand 스토어에서 직접 상태 가져오기
    const { accessToken } = useAuthStore.getState();

    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
