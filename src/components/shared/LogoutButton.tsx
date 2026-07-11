"use client";

import { signOut } from "@/app/actions/auth";
import { useRouter } from "next/navigation";

export const LogoutButton = () => {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.replace("/login");
    router.refresh();
  };

  return (
    <button className="btn btn-ghost btn-sm" onClick={handleLogout} type="button">
      Logout
    </button>
  );
};
