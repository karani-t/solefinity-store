import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ dimensions: string[] }> }
) {
  const { dimensions } = await params;
  const [width = "400", height = "300"] = dimensions;

  // Create a simple SVG placeholder
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#e2e8f0;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#cbd5e1;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)"/>
      <circle cx="50%" cy="40%" r="15%" fill="#64748b" opacity="0.3"/>
      <rect x="35%" y="65%" width="30%" height="8%" rx="4%" fill="#64748b" opacity="0.3"/>
      <rect x="45%" y="78%" width="10%" height="4%" rx="2%" fill="#64748b" opacity="0.2"/>
      <text x="50%" y="85%" text-anchor="middle" font-family="Arial, sans-serif" font-size="${Math.max(12, parseInt(height) * 0.03)}" fill="#64748b" opacity="0.6">
        ${width}×${height}
      </text>
    </svg>
  `;

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=31536000",
    },
  });
}