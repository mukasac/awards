import { NextRequest, NextResponse } from "next/server";
import { parse } from "csv-parse/sync";
import { prisma } from "@/lib/prisma";
import { Nominee } from "@prisma/client";

interface CSVRecord {
  name: string;
  position: string;
  institution: string;
  district: string;
  region: string;
  image?: string;
}

interface ProcessingSummary {
  positions: { created: number; existing: number };
  institutions: { created: number; existing: number };
  districts: { created: number; existing: number };
  nominees: { created: number; failed: number };
}

interface ProcessNomineeResult {
  success: boolean;
  nominee: string;
  data?: Nominee;
  error?: string;
  createdEntities?: {
    position: number;
    institution: number;
    district: number;
  };
}

async function validateImageUrl(url: string | undefined): Promise<string | null> {
  if (!url) return null;
  try {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return null;
    }
    return url;
  } catch (error) {
    console.error('Error validating image URL:', error);
    return null;
  }
}

async function processNominee(
  record: CSVRecord, 
  summary: ProcessingSummary
): Promise<ProcessNomineeResult> {
  try {
    // Validate required fields
    if (!record.name || !record.position || !record.institution || !record.district || !record.region) {
      throw new Error("Missing required fields");
    }

    // Validate image URL if provided
    const imageUrl = await validateImageUrl(record.image);

    // Find or create position
    let position = await prisma.position.findFirst({
      where: {
        name: {
          equals: record.position,
          mode: 'insensitive'
        }
      }
    });

    if (!position) {
      position = await prisma.position.create({
        data: { name: record.position }
      });
      summary.positions.created++;
    } else {
      summary.positions.existing++;
    }

    // Find or create institution
    let institution = await prisma.institution.findFirst({
      where: {
        name: {
          equals: record.institution,
          mode: 'insensitive'
        }
      }
    });

    if (!institution) {
      institution = await prisma.institution.create({
        data: {
          name: record.institution,
          status: false
        }
      });
      summary.institutions.created++;
    } else {
      summary.institutions.existing++;
    }

    // Find or create district
    let district = await prisma.district.findFirst({
      where: {
        name: {
          equals: record.district,
          mode: 'insensitive'
        }
      }
    });

    if (!district) {
      district = await prisma.district.create({
        data: {
          name: record.district,
          region: record.region
        }
      });
      summary.districts.created++;
    } else {
      summary.districts.existing++;
    }

    // Create nominee
    const nominee = await prisma.nominee.create({
      data: {
        name: record.name,
        positionId: position.id,
        institutionId: institution.id,
        districtId: district.id,
        image: imageUrl,
        status: false
      },
    });

    summary.nominees.created++;

    return {
      success: true,
      nominee: record.name,
      data: nominee,
      createdEntities: {
        position: position.id,
        institution: institution.id,
        district: district.id
      }
    };
  } catch (error) {
    summary.nominees.failed++;
    return {
      success: false,
      nominee: record.name,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

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
    }) as CSVRecord[];

    // Initialize summary
    const summary: ProcessingSummary = {
      positions: { created: 0, existing: 0 },
      institutions: { created: 0, existing: 0 },
      districts: { created: 0, existing: 0 },
      nominees: { created: 0, failed: 0 }
    };

    // Process all nominees
    const results = await Promise.all(
      records.map(record => processNominee(record, summary))
    );

    // Calculate overall success/failure
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    return NextResponse.json({
      message: 'Bulk upload completed',
      summary: {
        total: records.length,
        successful,
        failed,
        details: summary
      },
      results,
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
      headers: ["name", "position", "institution", "district", "region", "image"],
      required: ["name", "position", "institution", "district", "region"],
      optional: ["image"],
      example: {
        name: "John Doe",
        position: "Chairman",
        institution: "Example Institution",
        district: "Central District",
        region: "Central",
        image: "https://example.com/image.jpg"
      }
    }
  });
}