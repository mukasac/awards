import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// GET - Get nominee by ID
export async function GET(req: NextRequest) {
    try {
        // Extract the ID from the URL parameter
        const id = parseInt(req.nextUrl.pathname.split('/').pop() as string, 10);

        const nominee = await prisma.nominee.findUnique({
            where: { id },
            include: {
                position: true,
                institution: true,
                district: true,
                rating: {

                    select: {
                        evidence: true,
                        severity: true,
                        score: true, ratingCategory: true
                    }
                },
            },
        });

        if (!nominee) {
            return NextResponse.json({ error: 'Nominee not found' }, { status: 404 });
        }

        return NextResponse.json(nominee);
    } catch (error) {
        return NextResponse.json({ error: 'Error fetching nominee' + error }, { status: 400 });
    }
}


export async function PATCH(req: NextRequest) {
    try {
        const id = parseInt(req.url.split('/').pop() as string, 10); // Assuming the ID is part of the URL
        const dataToUpdate = await req.json(); // The partial data to update

        const updatedNominee = await prisma.nominee.update({
            where: { id },
            data: dataToUpdate,
            include: {
                position: true,
                institution: true,
                district: true,
            },
        });

        return NextResponse.json(updatedNominee);
    } catch (error) {
        return NextResponse.json({ error: 'Error updating nominee' + error }, { status: 500 });
    }
}


// DELETE - Delete nominee
export async function DELETE(req: NextRequest) {
    try {
        const id = parseInt(req.url.split('/').pop() as string, 10); // Ensure id is parsed to a number

        await prisma.nominee.delete({
            where: { id },
        });

        return NextResponse.json({ message: 'Nominee deleted successfully' });
    } catch (error) {
        return NextResponse.json({ error: 'Error deleting nominee' + error }, { status: 500 });
    }
}