import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { readUsers } from "@/lib/user-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.status !== "active") {
      return NextResponse.json({ error: "Please log in to view registered residents." }, { status: 401 });
    }

    const users = await readUsers();
    const residents = users
      .filter((user) => user.status === "active" && user.blockNumber && user.lotNumber)
      .map((user) => ({
        id: user.id,
        name: user.name,
        blockNumber: user.blockNumber ?? "",
        lotNumber: user.lotNumber ?? "",
        ownerRelationship: user.ownerRelationship ?? "",
        ownerRelationshipOther: user.ownerRelationshipOther ?? "",
      }));

    return NextResponse.json(
      { residents },
      { headers: { "Cache-Control": "no-store, private" } },
    );
  } catch (error) {
    console.error("PVNE directory residents failed:", error);
    return NextResponse.json({ error: "Unable to load registered residents." }, { status: 500 });
  }
}
