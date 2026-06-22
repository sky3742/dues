"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

const navItems = [
  { href: "/", label: "Dashboard", icon: "📊" },
  { href: "/accounts", label: "Accounts", icon: "💳" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="bg-base-100/80 backdrop-blur-md border-b border-base-300 sticky top-0 z-50"
    >
      <div className="container mx-auto max-w-4xl px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 group">
            <motion.span whileHover={{ rotate: 10 }} className="text-2xl">
              💰
            </motion.span>
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
                  className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "text-primary"
                      : "text-base-content/60 hover:text-base-content hover:bg-base-200"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <span className="text-base">{item.icon}</span>
                    <span className="hidden sm:inline">{item.label}</span>
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute inset-0 bg-primary/10 rounded-lg"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
