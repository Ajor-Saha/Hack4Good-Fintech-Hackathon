"use client";

import { sidebarLinks } from "@/constants";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";


const Sidebar = () => {
  const pathname = usePathname();

  

  return (
    <aside className="hidden h-full lg:block bg-slate-50 dark:bg-gray-900 border-x border-gray-300 p-4 w-64">
      <nav className="space-y-4">
        {sidebarLinks.map((item) => {
          const isActive =
            pathname === item.route || pathname.startsWith(`${item.route}/`);

          return (
            <Link
              href={item.route}
              key={item.label}
              className={cn(
                "flex items-center p-3 rounded-lg space-x-4 transition-all duration-200",
                {
                  "bg-gradient-to-r from-slate-100 to-slate-300 dark:from-slate-600 dark:to-slate-800": isActive,
                  "hover:bg-slate-300 dark:hover:bg-slate-700": !isActive,
                }
              )}
            >
              <div className="relative w-6 h-6">
                <Image
                  src={item.imgURL}
                  alt={item.label}
                  width={30}
                  height={30}
                  className={cn("transition-all duration-200", {
                    "brightness-200 invert": isActive,
                  })}
                />
              </div>
              <p
                className={cn("text-sm font-medium", {
                  "text-gray-700 dark:text-gray-100": isActive,
                  "text-gray-800 dark:text-gray-300": !isActive,
                })}
              >
                {item.label}
              </p>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
