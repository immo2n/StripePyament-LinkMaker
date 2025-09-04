// app/api/links/list/route.js
import { NextResponse } from "next/server";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page")) || 1;
  const limit = parseInt(searchParams.get("limit")) || 15;

  // Dummy data
  const allLinks = Array.from({ length: 42 }, (_, i) => ({
    id: `link-${i + 1}`,
    amount: Math.floor(Math.random() * 500) + 50, // Random amount between 50–550
    createdAt: new Date(Date.now() - i * 3600_000).toISOString(),
    hash: `dummy-hash-${i + 1}`,
  }));

  const start = (page - 1) * limit;
  const paginatedLinks = allLinks.slice(start, start + limit);

  return NextResponse.json({
    links: paginatedLinks,
    meta: {
      totalPages: Math.ceil(allLinks.length / limit),
      totalItems: allLinks.length,
    },
  });
}
