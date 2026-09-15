import { DesktopAppShell } from "@/components/layout/desktop-app-shell";
import { MobileAppShell } from "@/components/layout/mobile-app-shell";

export function AppShell() {
  return (
    <>
      <div className="hidden min-h-screen lg:block">
        <DesktopAppShell />
      </div>
      <div className="min-h-screen lg:hidden">
        <MobileAppShell />
      </div>
    </>
  );
}
