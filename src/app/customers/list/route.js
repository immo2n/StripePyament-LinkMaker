import { prisma } from "@/lib/prisma";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "15", 10);
    const skip = (page - 1) * limit;
    const query = searchParams.get("query")?.trim() || "";

    const where = query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
            { remarks: { contains: query, mode: "insensitive" } },
          ],
        }
      : {};

    const totalCustomers = await prisma.customer.count({ where });

    const customers = await prisma.customer.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        remarks: true,
        stripeCustomerId: true,
        createdAt: true,
      },
    });

    return new Response(
      JSON.stringify({
        customers,
        meta: {
          total: totalCustomers,
          page,
          limit,
          totalPages: Math.ceil(totalCustomers / limit),
        },
      }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
