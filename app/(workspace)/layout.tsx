import type { ReactNode } from "react";

import { headers } from "next/headers";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { Topbar } from "@/components/layout/topbar";
import { requireSession } from "@/lib/auth";

export default async function WorkspaceLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await requireSession();
  const headerList = await headers();
  const pathname = headerList.get("x-current-path") ?? "/dashboard";

  return (
    <div className="min-h-screen lg:flex">
      <AppSidebar pathname={pathname} />
      <main className="min-h-screen flex-1">
        <Topbar userName={session.name} userRole={session.role} />
        <div className="px-5 py-6 md:px-8">{children}</div>
      </main>
    </div>
  );
}
