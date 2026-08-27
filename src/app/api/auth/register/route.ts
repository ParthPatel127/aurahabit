import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: "User already exists with this email" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // Create default categories for user
    const defaultCategories = [
      { name: "Health", color: "#10B981", icon: "Heart" },
      { name: "Fitness", color: "#EF4444", icon: "Dumbbell" },
      { name: "Study", color: "#3B82F6", icon: "BookOpen" },
      { name: "Work", color: "#8B5CF6", icon: "Briefcase" },
      { name: "Finance", color: "#F59E0B", icon: "DollarSign" },
      { name: "Spiritual", color: "#EC4899", icon: "Sun" },
      { name: "Reading", color: "#06B6D4", icon: "Book" },
    ];

    for (const cat of defaultCategories) {
      await prisma.habitCategory.create({
        data: {
          userId: user.id,
          name: cat.name,
          color: cat.color,
          icon: cat.icon,
        },
      });
    }

    // Create default settings
    await prisma.userSettings.create({
      data: {
        userId: user.id,
        theme: "system",
        reminderNotifications: true,
        dailyWaterGoal: 3000,
      },
    });

    return NextResponse.json({ message: "User registered successfully", userId: user.id });
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
