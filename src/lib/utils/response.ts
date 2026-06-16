import { NextResponse } from "next/server"
import { ApiResponse } from '@/interface'

export const success = <T>(
  data: T,
  message = "OK",
  status = 200
) =>
  NextResponse.json<ApiResponse<T>>(
    { status: "success", data, message },
    { status }
  );

export const failure = <T>(
  message: string,
  status = 400,
) =>
  NextResponse.json<ApiResponse<T>>(
    { status: "error", data: null, message},
    { status }
  )