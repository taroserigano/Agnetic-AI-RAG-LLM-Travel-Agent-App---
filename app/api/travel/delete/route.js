import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import prisma from "@/utils/db";

export async function DELETE(request) {
  const { userId } = auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const tripId = searchParams.get("id");

    if (!tripId) {
      return NextResponse.json(
        { error: "Trip ID is required" },
        { status: 400 }
      );
    }

    // Verify the trip belongs to the user before deleting
    const trip = await prisma.tour.findUnique({
      where: { id: tripId },
      select: { userId: true },
    });

    if (!trip) {
      return NextResponse.json(
        { error: "Trip not found" },
        { status: 404 }
      );
    }

    if (trip.userId !== userId) {
      return NextResponse.json(
        { error: "Unauthorized to delete this trip" },
        { status: 403 }
      );
    }

    // Delete the trip
    await prisma.tour.delete({
      where: { id: tripId },
    });

    return NextResponse.json({ 
      success: true,
      message: "Trip deleted successfully" 
    });
  } catch (error) {
    console.error("Error deleting trip:", error);
    return NextResponse.json(
      {
        error: "Failed to delete trip",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

