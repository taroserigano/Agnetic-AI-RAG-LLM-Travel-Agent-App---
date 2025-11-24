import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import prisma from "@/utils/db";

export async function POST(request) {
  const { userId } = auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { itinerary } = body;

    if (!itinerary || !itinerary.tour) {
      return NextResponse.json(
        { error: "Invalid itinerary data" },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!itinerary.tour.city || !itinerary.tour.country) {
      return NextResponse.json(
        { error: "City and country are required" },
        { status: 400 }
      );
    }

    // Save trip to database (reusing the Tour model)
    const tour = await prisma.tour.create({
      data: {
        userId: userId,
        title: itinerary.tour.title || `${itinerary.tour.city}, ${itinerary.tour.country}`,
        description: itinerary.tour.description || "",
        city: itinerary.tour.city,
        country: itinerary.tour.country,
        image: itinerary.tour.image || null,
        stops: Array.isArray(itinerary.tour.stops) ? itinerary.tour.stops : [],
        tags: [],
        duration: "custom",
        isFeatured: false,
        metadata: {
          run_id: itinerary.run_id || null,
          compliance: itinerary.tour.compliance || {},
          research: itinerary.tour.research || {},
          citations: Array.isArray(itinerary.citations) ? itinerary.citations : [],
          cost: itinerary.cost || {},
          daily_plans: Array.isArray(itinerary.tour.daily_plans) ? itinerary.tour.daily_plans : [],
          daily_schedule: Array.isArray(itinerary.tour.daily_schedule) ? itinerary.tour.daily_schedule : [],
        },
      },
    });

    return NextResponse.json({
      id: tour.id,
      title: tour.title,
      description: tour.description,
      city: tour.city,
      country: tour.country,
      createdAt: tour.createdAt,
    });
  } catch (error) {
    console.error("Error saving trip:", error);
    return NextResponse.json(
      { 
        error: "Failed to save trip",
        details: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

