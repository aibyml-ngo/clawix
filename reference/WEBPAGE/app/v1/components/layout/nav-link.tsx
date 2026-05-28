"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export function NavLink({ href, children, className }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));

  return (
    <Link
      href={href}
      className={cn(
        "text-sm font-medium transition-colors hover:text-clawix-accent",
        isActive ? "text-clawix-cta" : "text-foreground/80",
        className
      )}
    >
      {children}
    </Link>
  );
}
