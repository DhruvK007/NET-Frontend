"use server";

// src/lib/currentUserServer.ts
import { cookies } from "next/headers";
import { createClient } from "@/lib/axios-server";

export async function currentUserServer() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("token");

    if (!token) {
      return null;
    }

    const client = createClient(token.value);
    const response = await client.get("/api/Users/Profile");

    return response.data;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
}
