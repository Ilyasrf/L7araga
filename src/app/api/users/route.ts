import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const users = await prisma.user.findMany({
    where: {
      targetCampus: { not: "" },
    },
    select: {
      id: true,
      intraId: true,
      login: true,
      image: true,
      slackLogin: true,
      originCampus: true,
      targetCampus: true,
      transferStatus: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(users);
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { targetCampus, transferStatus } = body;

  const intraId = (session.user as { intraId: number }).intraId;

  const updated = await prisma.user.update({
    where: { intraId },
    data: {
      ...(targetCampus !== undefined && { targetCampus }),
      ...(transferStatus !== undefined && { transferStatus }),
    },
    select: {
      id: true,
      intraId: true,
      login: true,
      image: true,
      slackLogin: true,
      originCampus: true,
      targetCampus: true,
      transferStatus: true,
    },
  });

  return NextResponse.json(updated);
}
