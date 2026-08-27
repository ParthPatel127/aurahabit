import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getAuthUserId(): Promise<string | null> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return null;

    // Verify user exists in current database by email to avoid stale session ID mismatch
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    return user?.id || null;
  } catch (e) {
    console.error("Error in getAuthUserId:", e);
    return null;
  }
}
