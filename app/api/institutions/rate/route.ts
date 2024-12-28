import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import { Rating } from '@/types/interfaces';

// POST - Create a institution and submit multiple ratings
export async function POST(req: NextRequest) {
  try {
    // Parse the incoming JSON body
    const { institutionData, ratings } = await req.json();

    // Validate institutionData
    const { name } = institutionData;
    if (!name) {
      return NextResponse.json({ error: 'Missing required institution fields' }, { status: 400 });
    }

    // Start a Prisma transaction to ensure both institution and ratings are created atomically
    const result = await prisma.$transaction(async (prisma) => {
      // Create the institution
      const institution = await prisma.institution.create({
        data: {
          name,
        },
      });

      // Prepare the ratings data
      const ratingsData = ratings.map((rating: Rating) => ({
        userId: rating.userId,
        ratingCategoryId: rating.ratingCategoryId,
        score: rating.score,
        severity: rating.severity,
        evidence: rating.evidence,
        institutionId: institution.id, // Associate each rating with the newly created institution
      }));

      // Create multiple ratings at once
      const createdRatings = await prisma.institutionRating.createMany({
        data: ratingsData,
      });

      // Return the institution along with the created ratings
      return {
        institution,
        ratings: createdRatings,
      };
    });

    // Return a response with the institution and ratings
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error creating institution and ratings' }, { status: 400 });
  }
}
