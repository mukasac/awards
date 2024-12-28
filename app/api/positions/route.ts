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
  
    const result = await paginate(prisma.position, { page, limit }, filters);
  
    return NextResponse.json(result);
  }