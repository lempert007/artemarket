import client from "./client";
import type { UserOut } from "../types";

export async function login(username: string): Promise<{ access_token: string; user: UserOut }> {
  const res = await client.post("/auth/login", { username });
  return res.data;
}

export async function getMe(): Promise<UserOut> {
  const res = await client.get("/auth/me");
  return res.data;
}
