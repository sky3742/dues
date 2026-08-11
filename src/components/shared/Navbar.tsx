"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutButton } from "./LogoutButton";

const navItems = [
  { href: "/", label: "Dashboard", icon: "📊" },
  { href: "/accounts", label: "Accounts", icon: "💳" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="bg-base-100/80 backdrop-blur-md border-b border-base-300 sticky top-0 z-50 animate-slide-down">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-2xl hover:rotate-10 transition-transform">💰</span>
            <span className="font-bold text-lg group-hover:text-primary transition-colors">
              Dues
            </span>
          </Link>

          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  prefetch={false}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "text-primary bg-primary/10"
                      : "text-base-content/60 hover:text-base-content hover:bg-base-200"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <span className="text-base">{item.icon}</span>
                    <span className="hidden sm:inline">{item.label}</span>
                  </span>
                </Link>
              );
            })}
            <LogoutButton />
          </div>
        </div>
      </div>
    </nav>
  );
}
