import { currentUserServer } from "@/lib/currentUserServer";

export default async function GroupManagement() {
  const user = await currentUserServer();
  console.log(user);
  return null;
}
