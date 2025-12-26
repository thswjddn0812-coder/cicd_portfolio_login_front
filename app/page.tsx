"use client";
import { useEffect, useState } from "react";
import api from "@/src/api/axios";
import { useAuthStore } from "@/src/store/authStore";

export default function Home() {
  // 닉네임을 담아둘 상태 변수
  const [nickname, setNickname] = useState<string>("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const { accessToken } = useAuthStore(); // Zustand에서 토큰 가져오기
  const [hydrated, setHydrated] = useState(false); // 수화(Hydration) 상태 체크

  useEffect(() => {
    // 클라이언트 마운트 후 수화 완료 처리
    setHydrated(true);
  }, []);

  const fetchMyInfo = async () => {
    try {
      console.log("3. 메인페이지 - 내 정보 가져오기 시도. 토큰:", accessToken);
      // 이미 axios 인터셉터가 헤더에 토큰을 실어주고 있을 거야!
      const res = await api.get("/auth/me");

      // 백엔드 Interceptor가 응답을 { data: { ... }, ... } 형태로 감싸서 줍니다.
      setNickname(res.data.data.nickname);
      setProfileImage(res.data.data.profileImageUrl);
    } catch (err) {
      console.error("정보 가져오기 실패:", err);
    }
  };

  useEffect(() => {
    // 토큰이 있을 때만 내 정보 가져오기 시도
    if (accessToken) {
      fetchMyInfo();
    } else {
      console.log("3. 메인페이지 - 토큰 없음. 로그인 필요 상태.");
    }
  }, [accessToken]); // 토큰이 생기면(로그인 성공하면) 다시 실행

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      await api.post("/users/profile-image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      alert("프로필 이미지가 변경되었습니다!");
      fetchMyInfo(); // 정보 갱신
    } catch (error) {
      console.error("이미지 업로드 실패:", error);
      alert("이미지 업로드 실패 ㅠㅠ");
    }
  };

  if (!hydrated) {
    // 수화되기 전에는 아무것도 보여주지 않거나 로딩 중 표시 (깜빡임 방지)
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      {accessToken ? (
        <div className="flex flex-col items-center space-y-6 rounded-2xl bg-white p-12 shadow-xl">
          {/* 프로필 이미지 영역 */}
          <div className="relative group">
            <div className="h-32 w-32 overflow-hidden rounded-full border-4 border-blue-100 shadow-sm">
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gray-200 text-gray-400">
                  <svg className="h-16 w-16" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              )}
            </div>
            {/* 이미지 변경 버튼 (호버 시 표시) */}
            <label className="absolute bottom-0 right-0 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-blue-600 text-white shadow-md transition hover:bg-blue-700">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
                />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
              </svg>
              <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
            </label>
          </div>

          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800">
              <span className="text-blue-600">{nickname}</span>님, 반가워요! 👋
            </h1>
            <p className="mt-2 text-gray-500">오늘도 즐거운 하루 보내세요.</p>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-800">로그인이 필요합니다.</h1>
          <button onClick={() => (window.location.href = "/login")} className="mt-4 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">
            로그인하러 가기
          </button>
        </div>
      )}
    </div>
  );
}
