// app/api/upload/route.ts
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { writeFile } from "fs/promises";
import { join } from "path";
import { NextRequest, NextResponse } from "next/server";

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

async function uploadToS3(buffer: Buffer, contentType: string): Promise<string> {
  const filename = `uploads/${Date.now()}-${Math.random().toString(36).substring(7)}`;
  await s3Client.send(
    new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: filename,
      Body: buffer,
      ContentType: contentType,
    })
  );
  return `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${filename}`;
}

async function uploadToLocal(formData: FormData): Promise<string> {
  const file = formData.get('file') as File;
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uploadDir = join(process.cwd(), 'public/uploads');
  const filename = `${Date.now()}-${file.name}`;
  const filepath = join(uploadDir, filename);

  await writeFile(filepath, buffer);
  return `/uploads/${filename}`;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const url = process.env.USE_S3 === 'true'
      ? await uploadToS3(
        Buffer.from(await (formData.get('file') as File).arrayBuffer()),
        (formData.get('file') as File).type
      )
      : await uploadToLocal(formData);

    return NextResponse.json({ url });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { message: 'Upload failed' },
      { status: 500 }
    );
  }
}