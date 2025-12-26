"use client";
import api from "@/src/api/axios";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

const RegisterPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    nickname: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async () => {
    try {
      if (!formData.email || !formData.password || !formData.nickname) {
        alert("모든 필드를 입력해주세요.");
        return;
      }

      await api.post("/users/signup", formData);
      alert("회원가입 성공! 로그인 페이지로 이동합니다.");
      router.push("/login");
    } catch (error: any) {
      console.error("회원가입 실패:", error);
      alert(error.response?.data?.message || "회원가입에 실패했습니다.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-lg">
        <h2 className="mb-6 text-center text-2xl font-semibold text-gray-800">Sign Up</h2>

        <div className="space-y-4">
          <input
            type="text"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-900 placeholder:text-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-900 placeholder:text-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
          <input
            type="text"
            name="nickname"
            placeholder="Nickname"
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-900 placeholder:text-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />

          <button onClick={handleSignup} className="w-full rounded-lg bg-green-600 py-2 text-sm font-medium text-white transition hover:bg-green-700 active:scale-[0.98]">
            Sign Up
          </button>

          <button onClick={() => router.push("/login")} className="w-full rounded-lg bg-gray-100 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-200 active:scale-[0.98]">
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
