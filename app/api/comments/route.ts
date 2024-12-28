import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { buildFilters } from "@/utils/filters";
import { paginate } from '@/utils/pagination';

const prisma = new PrismaClient();

// POST - Create a new comment
export async function POST(req: NextRequest) {
  try {
    const { content, userId, nomineeId, institutionId } = await req.json();

    const newComment = await prisma.comment.create({
      data: {
        content,
        userId,
        nomineeId,
        institutionId,
      },
    });

    return NextResponse.json(newComment, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error creating comment' }, { status: 400 });
  }
}

/// GET - Get all comments or a comment by ID
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const nomineeId = searchParams.get('nomineeId');
    const institutionId = searchParams.get('institutionId');

    if (id) {
      // Fetch a specific comment by ID
      const comment = await prisma.comment.findUnique({
        where: { id: parseInt(id, 10) },
      });

      if (!comment) {
        return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
      }

      return NextResponse.json(comment);
    } else if (nomineeId) {
      // Fetch comments by User ID
      const comments = await prisma.comment.findMany({
        where: { nomineeId: parseInt(nomineeId, 10) },
      });

      return NextResponse.json(comments);
    }else if (institutionId) {
      // Fetch comments by User ID
      const comments = await prisma.comment.findMany({
        where: { institutionId: parseInt(institutionId, 10) },
      });

      return NextResponse.json(comments);
    }   else {
      // Fetch all comments
      const filters = buildFilters(searchParams, {
        searchFields: ['name'],
        rangeFields: {
          createdAt: { min: new Date(), max: new Date() },
        },
      });
      const comments = await paginate(prisma.comment, { page: 1, limit: 10 }, filters);
      return NextResponse.json(comments);
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error fetching comments' }, { status: 400 });
  }
}

// PATCH - Update a comment by ID
export async function PATCH(req: NextRequest) {
  try {
    const id = parseInt(req.nextUrl.pathname.split('/').pop() as string, 10);
    const dataToUpdate = await req.json();

    const updatedComment = await prisma.comment.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json(updatedComment);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error updating comment' }, { status: 400 });
  }
}

// DELETE - Delete a comment by ID
export async function DELETE(req: NextRequest) {
  try {
    const id = parseInt(req.nextUrl.pathname.split('/').pop() as string, 10);

    await prisma.comment.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error deleting comment' }, { status: 400 });
  }
}