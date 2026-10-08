import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/session";
import { UnlockCard } from "@/components/unlock/UnlockCard";

export default async function UnlockRequired() {
  const token = cookies().get("aniflix_key")?.value;
  if (token) {
    const session = await verifySession(token);
    if (session) {
      redirect("/");
    }
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <UnlockCard variant="gate" />
    </main>
  );
}
