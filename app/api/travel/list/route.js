import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import prisma from "@/utils/db";

export async function GET(request) {
  const { userId } = auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Fetch all saved trips for the user
    const trips = await prisma.tour.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        title: true,
        description: true,
        city: true,
        country: true,
        image: true,
        stops: true,
        metadata: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ trips });
  } catch (error) {
    console.error("Error fetching trips:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch trips",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

