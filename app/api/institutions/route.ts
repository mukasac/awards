import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { buildFilters } from '@/utils/filters';
import { paginate } from '@/utils/pagination';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
  
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
  
    const filters = buildFilters(searchParams, {
      searchFields: ['name'],
      rangeFields: {
        createdAt: { min: new Date(), max: new Date() },
      },
    });
    //fetch related model
    const include = {
      rating: {

          select: {
              evidence: true,
              severity: true,
              score: true, ratingCategory: true
          }
      }
  };
  
    const result = await paginate(prisma.institution, { page, limit }, filters, include);
  
    return NextResponse.json(result);
  }

  export async function POST(req: NextRequest) {
    try {
        const { name, image} = await req.json();

        const newInstitution = await prisma.institution.create({
            data: {
                name,
                image,
            }
        });

        return NextResponse.json(newInstitution, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Error creating institution' + error }, { status: 500 });
    }
}
