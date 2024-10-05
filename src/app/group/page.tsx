import { currentUserServer } from "@/lib/currentUserServer";

export default async function GroupManagement() {
  const { user, token } = await currentUserServer();
  if (!user || !token) {
    Response.redirect("/login");
  }

  return null;
}
