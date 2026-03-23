"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Code2, BarChart3, Trophy } from "lucide-react";
import clsx from "clsx";

const links = [
  { href: "/", label: "Home", icon: BookOpen },
  { href: "/practice", label: "Practice", icon: Code2 },
  { href: "/progress", label: "Progress", icon: BarChart3 },
];

export default function Navigation() {
  const pathname = usePathname();
  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 flex items-center gap-2 h-14">
        <Link href="/" className="flex items-center gap-2 font-bold text-blue-700 mr-4">
          <Trophy className="w-5 h-5" />
          <span>AP CSP Prep</span>
        </Link>
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={clsx(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
              pathname === href
                ? "bg-blue-50 text-blue-700"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
