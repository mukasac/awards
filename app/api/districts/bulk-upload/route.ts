import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parse } from "csv-parse/sync";

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file = data.get('file');

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: 'No valid file provided' },
        { status: 400 }
      );
    }

    // Read file content
    const csvText = await file.text();

    // Parse CSV to JSON
    const records = parse(csvText, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    const results = {
      successful: 0,
      failed: 0,
      errors: [] as string[],
    };

    // Process each record
    for (const record of records) {
      try {
        // Validate required fields
        if (!record.name || !record.region) {
          throw new Error('Missing required fields: name and region are required');
        }

        // Create district
        await prisma.district.create({
          data: {
            name: record.name,
            region: record.region,
          },
        });

        results.successful++;
      } catch (error) {
        results.failed++;
        results.errors.push(
          `Failed to process district ${record.name}: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }

    return NextResponse.json({
      message: 'Upload processed',
      summary: {
        total: records.length,
        successful: results.successful,
        failed: results.failed,
      },
      errors: results.errors,
    });

  } catch (error) {
    console.error('Error processing upload:', error);
    return NextResponse.json(
      {
        error: 'Failed to process upload',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    template: {
      headers: ["name", "region"],
      required: ["name", "region"],
      example: {
        name: "Example District",
        region: "Example Region"
      }
    }
  });
}