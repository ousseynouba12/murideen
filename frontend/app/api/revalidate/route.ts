import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const secret = body?.secret;
  const path = body?.path;

  const expected = process.env.JWT_SECRET || process.env.NEXT_PUBLIC_REVALIDATE_SECRET;
  if (!expected || secret !== expected) {
    return NextResponse.json({ message: "Secret invalide." }, { status: 401 });
  }
  if (!path || typeof path !== "string") {
    return NextResponse.json({ message: "Chemin manquant." }, { status: 400 });
  }

  revalidatePath(path);
  return NextResponse.json({ revalidated: true, path });
}
