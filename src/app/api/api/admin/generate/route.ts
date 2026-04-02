import { NextResponse } from "next/server";
import { mkdirSync, writeFileSync } from "fs";
import { dirname } from "path";

export async function POST(request: Request) {
  try {
    const { prompt, outputPath } = await request.json();

    if (!prompt || !outputPath) {
      return NextResponse.json({ success: false, error: "Missing prompt or outputPath" }, { status: 400 });
    }

    // Sanitize the output path to prevent directory traversal
    const sanitizedPath = outputPath.replace(/\.\./g, "").replace(/[^a-zA-Z0-9_\-\/\.]/g, "");
    const fullPath = `./public${sanitizedPath}`;

    // Ensure directory exists (cross-platform)
    const dir = dirname(fullPath);
    mkdirSync(dir, { recursive: true });

    // Use Pollinations.ai — free, no config needed, works everywhere
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true&seed=${Date.now()}`;

    // Download the image
    const imageRes = await fetch(imageUrl);
    if (!imageRes.ok) {
      throw new Error(`Pollinations error: ${imageRes.status}`);
    }

    const imageBuffer = Buffer.from(await imageRes.arrayBuffer());
    writeFileSync(fullPath, imageBuffer);

    return NextResponse.json({ success: true, output: fullPath });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
