import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// GET - Get institution by ID
export async function GET(req: NextRequest) {
    try {
        // Extract the ID from the URL parameter
        const id = parseInt(req.nextUrl.pathname.split('/').pop() as string, 10);

        const institution = await prisma.institution.findUnique({
            where: { id },
            include: {
  
                rating: {

                    select: {
                        evidence: true,
                        severity: true,
                        score: true, 
                        ratingCategory: true
                    }
                },
            },
        });

        if (!institution) {
            return NextResponse.json({ error: 'Institution not found' }, { status: 404 });
        }

        return NextResponse.json(institution);
    } catch (error) {
        return NextResponse.json({ error: 'Error fetching institution' + error }, { status: 400 });
    }
}


export async function PATCH(req: NextRequest) {
    try {
        const id = parseInt(req.url.split('/').pop() as string, 10); // Assuming the ID is part of the URL
        const dataToUpdate = await req.json(); // The partial data to update

        const updatedInstitution = await prisma.institution.update({
            where: { id },
            data: dataToUpdate,
            include: {
                rating: true
            },
        });

        return NextResponse.json(updatedInstitution);
    } catch (error) {
        return NextResponse.json({ error: 'Error updating institution' + error }, { status: 500 });
    }
}


// DELETE - Delete institution
export async function DELETE(req: NextRequest) {
    try {
        const id = parseInt(req.url.split('/').pop() as string, 10); // Ensure id is parsed to a number

        await prisma.institution.delete({
            where: { id },
        });

        return NextResponse.json({ message: 'Institution deleted successfully' });
    } catch (error) {
        return NextResponse.json({ error: 'Error deleting institution' + error }, { status: 500 });
    }
}