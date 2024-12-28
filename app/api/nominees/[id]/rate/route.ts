import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    // Extract the nominee ID from the URL parameter
    const nomineeId = parseInt(req.nextUrl.pathname.split('/')[3], 10);

    // Check if the nominee exists
    const nominee = await prisma.nominee.findUnique({
      where: { id: nomineeId },
    });

    if (!nominee) {
      return NextResponse.json({ error: 'Nominee not found' }, { status: 404 });
    }

    // Extract ratings array from the request body
    const { ratings } = await req.json();

    if (!Array.isArray(ratings) || ratings.length === 0) {
      return NextResponse.json({ error: 'Ratings must be an array with at least one item' }, { status: 400 });
    }

    // Validate and create each rating
    const createdRatings = [];
    for (const rating of ratings) {
      const { userId, ratingCategoryId, score, severity, evidence } = rating;

      if (typeof score !== 'number' || typeof severity !== 'number') {
        return NextResponse.json({ error: 'Invalid score or severity' }, { status: 400 });
      }

      const newRating = await prisma.nomineeRating.create({
        data: {
          userId,
          nomineeId,
          ratingCategoryId,
          score,
          severity,
          evidence,
        },
      });

      createdRatings.push(newRating);
    }

    // Return the created ratings
    return NextResponse.json({ ratings: createdRatings }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error submitting ratings' }, { status: 500 });
  }
}
