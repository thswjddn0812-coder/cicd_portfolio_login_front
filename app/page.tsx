"use client";
import { useEffect, useState } from "react";
import api from "@/src/api/axios";
import { useAuthStore } from "@/src/store/authStore";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [nickname, setNickname] = useState<string>("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  
  // Zustand에서 필요한 상태와 함수 가져오기
  const { accessToken, setAccessToken } = useAuthStore(); 
  const [hydrated, setHydrated] = useState(false);

  // 1. 수화(Hydration) 체크
  useEffect(() => {
    setHydrated(true);
  }, []);

  // 2. [핵심] 조용히 토큰을 갱신하는 함수 (Silent Refresh)
  const handleSilentRefresh = async () => {
    try {
      console.log("3-1. 토큰 갱신 시도 (Refresh API 호출)");
      const res = await api.post("/auth/refresh");
      
      // 백엔드 컨트롤러에서 리턴하는 이름이 { access_token } 인지 꼭 확인!
      // 🚩 ResponseFormatInterceptor 때문에 data 안에 data가 또 있음!
      const newAt = res.data.data?.access_token || res.data.access_token;
      console.log("3-XX. 토큰 구조 확인:", res.data); // 디버깅용 로그 

      if (newAt) {
        setAccessToken(newAt); // Zustand 업데이트
        api.defaults.headers.common["Authorization"] = `Bearer ${newAt}`; // Axios 헤더 장착
        console.log("3-2. 토큰 갱신 성공!");
        return newAt;
      }
    } catch (fail) {
      console.error("3-3. 리프레시 토큰 만료 혹은 없음. 로그인이 필요함.");
      setAccessToken(null);
      return null;
    }
  };

  // 3. 내 정보 가져오기 (만료 시 재시도 로직 포함)
  const fetchMyInfo = async () => {
    try {
      console.log("3. 메인페이지 - 내 정보 가져오기 시도.");
      const res = await api.get("/auth/me");
      
      // 백엔드 응답 구조에 맞춰 데이터 세팅
      const userData = res.data.data || res.data; 
      setNickname(userData.nickname);
      setProfileImage(userData.profileImageUrl);
    } catch (err: any) {
      // 🚩 액세스 토큰이 만료(401)되었다면 한 번 더 기회를 준다!
      if (err.response?.status === 401) {
        console.log("4. 액세스 토큰 만료 확인 -> 재발급 후 재시도");
        const refreshedToken = await handleSilentRefresh();
        if (refreshedToken) {
          fetchMyInfo(); // 토큰 갈아끼우고 다시 호출!
        }
      } else {
        console.error("정보 가져오기 실패:", err);
      }
    }
  };

  // 4. 페이지 진입 및 토큰 변경 시 실행 로직
  useEffect(() => {
    if (hydrated) {
      if (accessToken) {
        // 주머니에 토큰이 있으면 바로 내 정보 가져오기
        fetchMyInfo();
      } else {
        // 🚩 새로고침해서 주머니가 비었어도, 쿠키(RefreshToken)가 있을지 모르니 재발급 시도!
        handleSilentRefresh();
      }
    }
  }, [hydrated, accessToken]);

  // 이미지 업로드 로직 (형의 기존 코드 유지)
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      await api.post("/users/profile-image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("프로필 이미지가 변경되었습니다!");
      fetchMyInfo(); 
    } catch (error) {
      console.error("이미지 업로드 실패:", error);
      alert("이미지 업로드 실패 ㅠㅠ");
    }
  };

  // 로그아웃 로직 (형의 기존 코드 유지 + 보완)
  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.error("로그아웃 통신 실패:", err);
    } finally {
      setAccessToken(null);
      delete api.defaults.headers.common["Authorization"];
      setNickname("");
      router.push("/login");
    }
  };

  if (!hydrated) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      {accessToken ? (
        <div className="flex flex-col items-center space-y-6 rounded-2xl bg-white p-12 shadow-xl w-full max-w-md">
          <div className="relative group">
            <div className="h-32 w-32 overflow-hidden rounded-full border-4 border-blue-100 shadow-sm bg-gray-100">
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-gray-400">
                   <svg className="h-16 w-16" fill="currentColor" viewBox="0 0 24 24">
                     <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                   </svg>
                </div>
              )}
            </div>
            <label className="absolute bottom-0 right-0 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-blue-600 text-white shadow-md transition hover:bg-blue-700">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
              </svg>
              <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
            </label>
          </div>

          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800">
              <span className="text-blue-600">{nickname || "사용자"}</span>님, 반가워요! 👋
            </h1>
            <p className="mt-2 text-gray-500">오늘도 즐거운 하루 보내세요.</p>
          </div>

          <button 
            onClick={handleLogout}
            className="w-full mt-4 rounded-xl bg-gray-100 py-3 text-sm font-semibold text-gray-600 transition hover:bg-red-50 hover:text-red-600 active:scale-95"
          >
            로그아웃
          </button>
        </div>
      ) : (
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
          <h1 className="text-2xl font-semibold text-gray-800">로그인이 필요합니다.</h1>
          <button 
            onClick={() => (window.location.href = "/login")} 
            className="mt-6 w-full rounded-xl bg-blue-600 px-8 py-3 text-white font-bold shadow-blue-200 shadow-lg hover:bg-blue-700 transition"
          >
            로그인하러 가기
          </button>
        </div>
      )}
    </div>
  );
}