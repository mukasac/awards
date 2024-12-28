// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  const users = await prisma.user.findMany();
  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  const { name, email, password } = await req.json();
  const newUser = await prisma.user.create({
    data: { name, email, password },
  });
  return NextResponse.json(newUser, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const { id, ...data } = await req.json();
  const updatedUser = await prisma.user.update({
    where: { id: Number(id) },
    data,
  });
  return NextResponse.json(updatedUser);
}

export async function DELETE(req: NextRequest) {
  const { userId } = await req.json();
  await prisma.user.delete({
    where: { id: Number(userId) },
  });
  return NextResponse.json({}, { status: 204 });
}