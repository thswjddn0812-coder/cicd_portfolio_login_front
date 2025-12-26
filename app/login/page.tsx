"use client";
import api from "@/src/api/axios";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/src/store/authStore";
const page = () => {
  const router = useRouter();
  const { setAccessToken } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const loginInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.name === "email") {
      setEmail(e.target.value);
    } else {
      setPassword(e.target.value);
    }
  };
  const handleLogin = async () => {
    try {
      const response = await api.post("/auth/login", { email, password });
      // 백엔드 Interceptor가 응답을 { data: { ... }, ... } 형태로 감싸서 줍니다.
      const token = response.data.data.access_token;
      console.log("2. 로그인 응답 받은 토큰:", token);

      if (token) {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        setAccessToken(token);
        alert("로그인 성공! (토큰 저장됨)");
      } else {
        console.error("토큰이 없습니다!", response.data);
        alert("로그인은 성공했는데 토큰이 없어요...");
      }

      console.log("1. 로그인 성공 및 신분증 장착");
      router.push("/");
    } catch (error: any) {
      console.error("에러 발생:", error.response?.data || error.message);
      alert("신분증이 가짜거나 로그인이 실패했어, 형!");
    }
  };
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-lg">
        <h2 className="mb-6 text-center text-2xl font-semibold text-gray-800">Login</h2>

        <div className="space-y-4">
          <input
            type="text"
            name="email"
            placeholder="Email"
            onChange={loginInput}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 
             text-sm text-gray-900 
             placeholder:text-gray-600
             focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={loginInput}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 
             text-sm text-gray-900 
             placeholder:text-gray-600
             focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />

          <button onClick={handleLogin} className="w-full rounded-lg bg-blue-600 py-2 text-sm font-medium text-white transition hover:bg-blue-700 active:scale-[0.98]">
            Login
          </button>

          <button onClick={() => router.push("/register")} className="w-full rounded-lg bg-gray-100 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-200 active:scale-[0.98]">
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
};

export default page;
