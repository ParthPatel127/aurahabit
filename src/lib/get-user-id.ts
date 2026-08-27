import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getAuthUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  return (session.user as any).id || null;
}
