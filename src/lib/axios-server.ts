// src/lib/axios-server.ts
import axios from "axios";
import https from "https";

export const createClient = (token?: string) => {
  const client = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "https://localhost:7116",
    httpsAgent: new https.Agent({
      rejectUnauthorized: process.env.NODE_ENV !== "development",
    }),
    headers: token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {},
  });

  return client;
};
