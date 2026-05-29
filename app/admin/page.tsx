import type { Metadata } from "next";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, adminConfigured, verifyToken } from "@/lib/auth";
import { getGenerationConfig } from "@/lib/generation-config";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { AdminSettings } from "@/components/admin/AdminSettings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Nastavení — Příležitosti",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const store = await cookies();
  const isAuthed = verifyToken(store.get(ADMIN_COOKIE)?.value);

  return (
    <div className="container-tight py-10">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-dark">
          Zabezpečená sekce
        </p>
        <h1 className="mt-2.5 text-3xl font-extrabold leading-[1.1] tracking-tight sm:text-4xl">
          Nastavení generování
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-ink/60">
          Tady upravuješ pokyny a limity, podle kterých se generují všechny
          další články. Změny se projeví u nového ranního běhu i při ručním
          generování.
        </p>

        {isAuthed ? (
          <AdminSettings config={getGenerationConfig()} />
        ) : (
          <AdminLogin configured={adminConfigured()} />
        )}
      </div>
    </div>
  );
}
