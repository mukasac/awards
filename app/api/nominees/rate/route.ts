import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import { Rating } from '@/types/interfaces';

// POST - Create a nominee and submit multiple ratings
export async function POST(req: NextRequest) {
  try {
    // Parse the incoming JSON body
    const { nomineeData, ratings } = await req.json();

    // Validate nomineeData
    const { name, institutionId, positionId, districtId } = nomineeData;
    if (!name || !institutionId || !positionId || !districtId ) {
      return NextResponse.json({ error: 'Missing required nominee fields' }, { status: 400 });
    }

    // Start a Prisma transaction to ensure both nominee and ratings are created atomically
    const result = await prisma.$transaction(async (prisma) => {
      // Create the nominee
      const nominee = await prisma.nominee.create({
        data: {
          name,
          institutionId,
          positionId,
          districtId,
        },
      });

      // Prepare the ratings data
      const ratingsData = ratings.map((rating: Rating) => ({
        userId: rating.userId,
        ratingCategoryId: rating.ratingCategoryId,
        score: rating.score,
        severity: rating.severity,
        evidence: rating.evidence,
        nomineeId: nominee.id, // Associate each rating with the newly created nominee
      }));

      // Create multiple ratings at once
      const createdRatings = await prisma.nomineeRating.createMany({
        data: ratingsData,
      });

      // Return the nominee along with the created ratings
      return {
        nominee,
        ratings: createdRatings,
      };
    });

    // Return a response with the nominee and ratings
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error creating nominee and ratings' }, { status: 400 });
  }
}
