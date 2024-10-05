"use server";

interface CurrentUserResponse {
  user: User | null;
  token: string | null;
}

interface User {
  id: string;
  name: string;
  email: string;
}

// src/lib/currentUserServer.ts
import { cookies } from "next/headers";
import { createClient } from "@/lib/axios-server";

export async function currentUserServer(): Promise<CurrentUserResponse> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("token");

    if (!token) {
      return { user: null, token: null };
    }

    const client = createClient(token.value);
    const response = await client.get<User>("/api/Users/Profile");

    return { user: response.data, token: token.value };
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return { user: null, token: null };
  }
}
