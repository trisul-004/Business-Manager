import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const role = sessionClaims?.metadata?.role || "manager";
  redirect(role === 'supervisor' ? "/supervisor" : "/manager");

  return null;
}
