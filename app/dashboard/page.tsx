import Link from "next/link";
import { DashboardClient } from "@/components/dashboard-client";
import { staticUser } from "@/lib/static-user";

export default function DashboardPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-pulse">Growth workspace</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-100 sm:text-4xl md:text-5xl">Your AI learning and career command center</h1>
        </div>
        <Link href="/" className="w-full rounded-full border border-slate-700 px-5 py-3 text-center text-sm font-semibold text-slate-300 sm:w-auto">
          Back to overview
        </Link>
      </div>

      <DashboardClient initialUser={staticUser} />
    </main>
  );
}
