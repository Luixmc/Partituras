import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import MobileNav from "@/components/layout/MobileNav";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import ReadingControls from "@/components/theme/ReadingControls";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <ThemeProvider>
      <div className="flex h-dvh overflow-hidden bg-slate-50 dark:bg-slate-950">
        {/* Desktop sidebar */}
        <aside className="hidden md:flex w-64 flex-shrink-0">
          <Sidebar profile={profile} />
        </aside>

        {/* Main content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            {children}
          </div>
          {/* Mobile bottom nav */}
          <MobileNav role={profile?.role ?? "viewer"} />
        </main>

        {/* Control de lectura flotante (solo móvil; en escritorio está en la
            barra lateral). Disponible en todas las secciones. */}
        <div className="fixed bottom-20 right-3 z-30 md:hidden">
          <ReadingControls className="shadow-lg" />
        </div>
      </div>
    </ThemeProvider>
  );
}
