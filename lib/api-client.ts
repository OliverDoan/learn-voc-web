interface SuccessBody<T> {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
}

interface FailureBody {
  success: false;
  error: string;
  issues?: unknown;
}

export class ApiError extends Error {
  status: number;
  issues?: unknown;
  constructor(message: string, status: number, issues?: unknown) {
    super(message);
    this.status = status;
    this.issues = issues;
  }
}

export async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  const body = (await res.json()) as SuccessBody<T> | FailureBody;
  if (!res.ok || body.success === false) {
    const errMsg = body.success === false ? body.error : "Yêu cầu thất bại";
    throw new ApiError(
      errMsg,
      res.status,
      body.success === false ? body.issues : undefined,
    );
  }
  return body.data;
}

export function apiPost<T>(url: string, payload: unknown): Promise<T> {
  return apiFetch<T>(url, { method: "POST", body: JSON.stringify(payload) });
}

export function apiPatch<T>(url: string, payload: unknown): Promise<T> {
  return apiFetch<T>(url, { method: "PATCH", body: JSON.stringify(payload) });
}

export function apiDelete<T>(url: string): Promise<T> {
  return apiFetch<T>(url, { method: "DELETE" });
}
