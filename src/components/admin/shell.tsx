"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import clsx from "clsx";
import { SquaresFour, Buildings, TextAa, UsersThree, Tray, GearSix, ArrowSquareOut, List, X, Info } from "@phosphor-icons/react";
import { Logo } from "@/components/brand/logo";
import { useSite, storageUsed } from "@/lib/content/store";
import { ToastProvider, useToast } from "./ui";

const nav = [
  { href: "/admin", label: "Overview", icon: SquaresFour },
  { href: "/admin/projects", label: "Projects", icon: Buildings },
  { href: "/admin/content", label: "Page content", icon: TextAa },
  { href: "/admin/team", label: "Team", icon: UsersThree },
  { href: "/admin/messages", label: "Messages", icon: Tray },
  { href: "/admin/settings", label: "Settings", icon: GearSix },
];

function StorageWatcher() {
  const toast = useToast();
  useEffect(() => {
    const h = () => toast("Browser storage is full. Remove some uploaded images, or connect Convex to store files.", "warn");
    window.addEventListener("ab:storage-full", h);
    return () => window.removeEventListener("ab:storage-full", h);
  }, [toast]);
  return null;
}

function StorageMeter() {
  const hydrated = useSite((s) => s.hydrated);
  const snapshot = useSite((s) => s);
  const [used, setUsed] = useState(0);
  useEffect(() => setUsed(storageUsed()), [snapshot]);
  if (!hydrated) return null;
  const pct = Math.min(100, (used / (5 * 1024 * 1024)) * 100);
  return (
    <div className="px-2">
      <div className="flex justify-between text-[0.7rem] text-mist">
        <span>Local storage</span>
        <span>{(used / 1024 / 1024).toFixed(2)} / 5 MB</span>
      </div>
      <div className="mt-1.5 h-1 bg-white/10">
        <div className={clsx("h-full", pct > 85 ? "bg-red-400" : "bg-ochre")} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const unread = useSite((s) => s.messages.filter((m) => !m.read).length);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    Promise.resolve(useSite.persist.rehydrate());
  }, []);
  useEffect(() => setOpen(false), [pathname]);

  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  return (
    <ToastProvider>
      <StorageWatcher />
      <div className="min-h-svh bg-deep text-gypsum lg:grid lg:grid-cols-[16rem_1fr]">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-3 lg:hidden">
          <Logo tone="light" className="h-7 w-auto" />
          <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-controls="admin-nav" aria-label="Menu" className="grid h-10 w-10 place-items-center bg-white/5">
            {open ? <X size={18} /> : <List size={18} />}
          </button>
        </div>
        <aside
          id="admin-nav"
          className={clsx(
            "flex-col gap-6 border-e border-white/10 bg-deep-2 p-4 lg:sticky lg:top-0 lg:flex lg:h-svh",
            open ? "flex" : "hidden",
          )}
        >
          <div className="hidden px-2 pt-2 lg:block">
            <Logo tone="light" className="h-8 w-auto" />
            <p className="mt-3 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-mist">Site manager</p>
          </div>
          <nav aria-label="Admin">
            <ul className="flex flex-col gap-1">
              {nav.map(({ href, label, icon: Icon }) => (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={isActive(href) ? "page" : undefined}
                    className={clsx(
                      "flex items-center gap-3 px-3 py-2.5 text-sm transition-colors",
                      isActive(href) ? "bg-white/[0.08] text-gypsum" : "text-gypsum/65 hover:bg-white/[0.04] hover:text-gypsum",
                    )}
                  >
                    <Icon size={18} weight={isActive(href) ? "fill" : "regular"} className={isActive(href) ? "text-ochre" : ""} />
                    <span className="flex-1">{label}</span>
                    {label === "Messages" && unread > 0 && (
                      <span className="grid h-5 min-w-5 place-items-center rounded-full bg-ochre px-1.5 text-[0.65rem] font-semibold text-ink" aria-label={`${unread} unread`}>
                        {unread}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="mt-auto flex flex-col gap-4">
            <StorageMeter />
            <a href="/en" target="_blank" rel="noreferrer" className="flex items-center gap-2 px-3 py-2.5 text-sm text-gypsum/70 hover:text-gypsum">
              <ArrowSquareOut size={18} /> View site
            </a>
          </div>
        </aside>
        <main className="min-w-0 px-5 py-8 md:px-10 md:py-10">
          <div className="mb-8 flex items-start gap-3 border border-ochre/25 bg-ochre/[0.06] px-4 py-3 text-sm text-gypsum/80">
            <Info size={18} className="mt-0.5 shrink-0 text-ochre" aria-hidden="true" />
            <p>
              Preview mode: edits are saved in this browser and show on the site here straight away. Sign-in and shared publishing switch on when the
              Convex backend is connected (see <code className="font-mono text-xs">convex/</code> and the README).
            </p>
          </div>
          {children}
        </main>
      </div>
    </ToastProvider>
  );
}
