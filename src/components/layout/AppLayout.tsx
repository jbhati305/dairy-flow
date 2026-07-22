import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-50">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex h-screen min-w-0 flex-1 flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-5 lg:px-8">
          <div className="mx-auto w-full max-w-[1440px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
