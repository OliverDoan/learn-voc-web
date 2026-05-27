import { NextResponse } from "next/server";
import { ZodError } from "zod";

export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
}

export interface ApiFailure {
  success: false;
  error: string;
  issues?: unknown;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export function ok<T>(data: T, meta?: Record<string, unknown>, status = 200) {
  const body: ApiSuccess<T> = { success: true, data };
  if (meta) body.meta = meta;
  return NextResponse.json(body, { status });
}

export function fail(message: string, status = 400, issues?: unknown) {
  const body: ApiFailure = { success: false, error: message };
  if (issues !== undefined) body.issues = issues;
  return NextResponse.json(body, { status });
}

export function handleError(error: unknown): NextResponse {
  if (error instanceof ZodError) {
    return fail("Dữ liệu không hợp lệ", 400, error.issues);
  }
  if (error instanceof Error) {
    console.error("[API] Error:", error.message);
    return fail(error.message || "Lỗi máy chủ", 500);
  }
  console.error("[API] Unknown error:", error);
  return fail("Lỗi không xác định", 500);
}
