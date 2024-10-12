"use client";
import { useState } from "react";
import axios, { type AxiosError } from "axios";
import { useRouter } from "next/navigation";
import {
  type LoginResponse,
  type ErrorResponse,
} from "@/interface";
import { handleAPIError } from "@/util/error";
import toast from "react-hot-toast";
import { ApiError } from "next/dist/server/api-utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const LoginPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function apiLogin() {
    try {
      const response = await axios.post<LoginResponse>("/api/auth/login", {
        email,
        password,
      });

      const { token } = response.data;
      localStorage.setItem("token", token);
      return response.data;
    } catch (error) {
      throw handleAPIError(error);
    }
  }

  const handleLogin = async () => {
    try {
      const response = await toast.promise(
        apiLogin(),
        {
          loading: "Logging you in...",
          success: "Logged in!",
          error: (err: ApiError) => err.message,
        },
      );
      if (response) {
        setTimeout(() => {
          router.push("/adminupload");
        }, 1500);
      }
    } catch (e) {
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center ">
      <div className="w-full max-w-md rounded-md bg-blue-800 p-8 shadow-md">
        <h1 className="mb-4 text-2xl font-bold">Login</h1>
        {error && <p className="mb-4 text-red-500">{error}</p>}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void handleLogin();
          }}
        >
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-sm font-medium"
            >
              Email:
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border px-3 py-2 shadow-sm sm:text-sm"
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="password"
              className="block text-sm font-medium"
            >
              Password:
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border px-3 py-2 shadow-sm sm:text-sm"
            />
          </div>
          <Button
            type="submit"
            variant="outline"
            className="w-full"
          >
            Login
          </Button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
