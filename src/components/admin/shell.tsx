"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import clsx from "clsx";
import { useQuery } from "convex/react";
import {
  ArrowSquareOut,
  Buildings,
  DotsThreeOutline,
  GearSix,
  SignOut,
  SquaresFour,
  TextAa,
  Tray,
  UsersThree,
  X,
  type Icon,
} from "@phosphor-icons/react";
import { api } from "@convex/_generated/api";
import { Logo } from "@/components/brand/logo";
import { convex } from "@/lib/convex";
import { useAdminSession } from "@/lib/admin/session";
import { useSite } from "@/lib/content/store";
import { seed } from "@/lib/content/seed";
import { ToastProvider } from "./ui";
import { Login } from "./login";

type NavItem = { href: string; label: string; short: string; icon: Icon };

const nav: NavItem[] = [
  { href: "/admin", label: "Overview", short: "Overview", icon: SquaresFour },
  { href: "/admin/projects", label: "Projects", short: "Projects", icon: Buildings },
  { href: "/admin/content", label: "Page content", short: "Content", icon: TextAa },
  { href: "/admin/messages", label: "Messages", short: "Inbox", icon: Tray },
  { href: "/admin/team", label: "Team", short: "Team", icon: UsersThree },
  { href: "/admin/settings", label: "Settings", short: "Settings", icon: GearSix },
];
/** On a phone the first four sit in the tab bar; the rest live under "More". */
const TABS = 4;

function Centered({ children }: { children: React.ReactNode }) {
  return <div className="grid min-h-svh place-items-center bg-deep px-6 text-center text-sm text-mist">{children}</div>;
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const token = useAdminSession((s) => s.token);

  // The token lives in this browser; read it after hydration so server and client agree.
  useEffect(() => {
    Promise.resolve(useAdminSession.persist.rehydrate()).then(() => setReady(true));
  }, []);

  return (
    <ToastProvider>
      {!convex ? (
        <Centered>The site manager needs its backend. Set NEXT_PUBLIC_CONVEX_URL and reload.</Centered>
      ) : !ready ? (
        <Centered>Loading…</Centered>
      ) : !token ? (
        <Login />
      ) : (
        <SignedIn token={token}>{children}</SignedIn>
      )}
    </ToastProvider>
  );
}

function SignedIn({ token, children }: { token: string; children: React.ReactNode }) {
  const setToken = useAdminSession((s) => s.setToken);
  const data = useQuery(api.admin.data, { token });

  useEffect(() => {
    if (data === null) {
      setToken(null); // the session ended or was signed out elsewhere
      return;
    }
    if (!data) return;
    useSite.setState({
      content: data.content ?? seed.content,
      settings: data.settings ?? seed.settings,
      projects: data.projects,
      team: data.team,
      messages: data.messages,
      hydrated: true,
    });
  }, [data, setToken]);

  if (!data) return <Centered>Loading your site…</Centered>;
  return <Dashboard token={token}>{children}</Dashboard>;
}

function Dashboard({ token, children }: { token: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const setToken = useAdminSession((s) => s.setToken);
  const unread = useSite((s) => s.messages.filter((m) => !m.read).length);
  const [more, setMore] = useState(false);

  useEffect(() => setMore(false), [pathname]);

  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));
  const current = nav.find((n) => isActive(n.href));

  const signOut = async () => {
    try {
      await convex?.mutation(api.auth.logout, { token });
    } catch {
      /* signing out locally is enough */
    }
    setToken(null);
    useSite.setState({ hydrated: false, messages: [] });
  };

  const badge = (n: NavItem, small = false) =>
    n.href === "/admin/messages" && unread > 0 ? (
      <span
        className={clsx(
          "grid place-items-center rounded-full bg-ochre font-semibold text-ink",
          small ? "absolute -end-2 -top-1 h-4 min-w-4 px-1 text-[0.6rem]" : "h-5 min-w-5 px-1.5 text-[0.65rem]",
        )}
        aria-label={`${unread} unread`}
      >
        {unread}
      </span>
    ) : null;

  return (
    <div className="min-h-svh bg-deep text-gypsum lg:grid lg:grid-cols-[16rem_1fr]">
      {/* Phone: a slim top bar */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-white/10 bg-deep/90 px-4 backdrop-blur-lg lg:hidden">
        <Link href="/admin" aria-label="Overview" className="flex items-center gap-3">
          <Logo tone="light" className="h-7 w-auto" />
        </Link>
        <span className="truncate text-sm font-medium text-gypsum/80">{current?.label}</span>
        <a href="/en" target="_blank" rel="noreferrer" aria-label="View site" className="grid h-10 w-10 place-items-center text-gypsum/70 hover:text-gypsum">
          <ArrowSquareOut size={20} />
        </a>
      </header>

      {/* Desktop: the sidebar */}
      <aside className="sticky top-0 hidden h-svh flex-col gap-6 border-e border-white/10 bg-deep-2 p-4 lg:flex">
        <div className="px-2 pt-2">
          <Logo tone="light" className="h-8 w-auto" />
          <p className="mt-3 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-mist">Site manager</p>
        </div>
        <nav aria-label="Site manager">
          <ul className="flex flex-col gap-1">
            {nav.map((n) => {
              const Icon = n.icon;
              return (
                <li key={n.href}>
                  <Link
                    href={n.href}
                    aria-current={isActive(n.href) ? "page" : undefined}
                    className={clsx(
                      "flex items-center gap-3 px-3 py-2.5 text-sm transition-colors",
                      isActive(n.href) ? "bg-white/[0.08] text-gypsum" : "text-gypsum/65 hover:bg-white/[0.04] hover:text-gypsum",
                    )}
                  >
                    <Icon size={18} weight={isActive(n.href) ? "fill" : "regular"} className={isActive(n.href) ? "text-ochre" : ""} />
                    <span className="flex-1">{n.label}</span>
                    {badge(n)}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="mt-auto flex flex-col gap-1">
          <a href="/en" target="_blank" rel="noreferrer" className="flex items-center gap-3 px-3 py-2.5 text-sm text-gypsum/70 hover:text-gypsum">
            <ArrowSquareOut size={18} /> View site
          </a>
          <button type="button" onClick={signOut} className="flex items-center gap-3 px-3 py-2.5 text-start text-sm text-gypsum/70 hover:text-gypsum">
            <SignOut size={18} /> Sign out
          </button>
        </div>
      </aside>

      <main className="min-w-0 px-4 pb-[calc(6rem+env(safe-area-inset-bottom))] pt-6 sm:px-6 md:px-10 md:pt-10 lg:pb-12">{children}</main>

      {/* Phone: the tab bar */}
      <nav aria-label="Site manager" className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-deep-2/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg lg:hidden">
        <ul className="grid grid-cols-5">
          {nav.slice(0, TABS).map((n) => {
            const Icon = n.icon;
            const active = isActive(n.href);
            return (
              <li key={n.href}>
                <Link
                  href={n.href}
                  aria-current={active ? "page" : undefined}
                  className={clsx("flex h-16 flex-col items-center justify-center gap-1 text-[0.68rem]", active ? "text-ochre" : "text-gypsum/60")}
                >
                  <span className="relative">
                    <Icon size={22} weight={active ? "fill" : "regular"} />
                    {badge(n, true)}
                  </span>
                  {n.short}
                </Link>
              </li>
            );
          })}
          <li>
            <button
              type="button"
              onClick={() => setMore((v) => !v)}
              aria-expanded={more}
              aria-controls="admin-more"
              className={clsx(
                "flex h-16 w-full flex-col items-center justify-center gap-1 text-[0.68rem]",
                more || nav.slice(TABS).some((n) => isActive(n.href)) ? "text-ochre" : "text-gypsum/60",
              )}
            >
              <DotsThreeOutline size={22} />
              More
            </button>
          </li>
        </ul>
      </nav>

      {/* Phone: "More" sheet */}
      {more && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="More">
          <button type="button" aria-label="Close" className="absolute inset-0 bg-black/60" onClick={() => setMore(false)} />
          <div id="admin-more" className="absolute inset-x-0 bottom-0 border-t border-white/10 bg-deep-2 px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-mist">Site manager</p>
              <button type="button" onClick={() => setMore(false)} aria-label="Close" className="grid h-10 w-10 place-items-center text-gypsum/70">
                <X size={18} />
              </button>
            </div>
            <ul className="flex flex-col">
              {nav.slice(TABS).map((n) => {
                const Icon = n.icon;
                return (
                  <li key={n.href}>
                    <Link href={n.href} className="flex h-14 items-center gap-3 border-b border-white/10 text-base">
                      <Icon size={20} className="text-ochre" /> {n.label}
                    </Link>
                  </li>
                );
              })}
              <li>
                <a href="/en" target="_blank" rel="noreferrer" className="flex h-14 items-center gap-3 border-b border-white/10 text-base">
                  <ArrowSquareOut size={20} className="text-ochre" /> View site
                </a>
              </li>
              <li>
                <button type="button" onClick={signOut} className="flex h-14 w-full items-center gap-3 text-start text-base">
                  <SignOut size={20} className="text-ochre" /> Sign out
                </button>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
