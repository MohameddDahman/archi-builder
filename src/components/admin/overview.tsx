"use client";

import Link from "next/link";
import { Buildings, Tray, UsersThree, TextAa, ArrowRight } from "@phosphor-icons/react";
import { useSite } from "@/lib/content/store";
import { Card, PageTitle } from "./ui";

export function Overview() {
  const projects = useSite((s) => s.projects);
  const messages = useSite((s) => s.messages);
  const team = useSite((s) => s.team);
  const unread = messages.filter((m) => !m.read).length;

  const stats = [
    { label: "Published projects", value: projects.filter((p) => p.published).length, href: "/admin/projects", icon: Buildings },
    { label: "Unread messages", value: unread, href: "/admin/messages", icon: Tray },
    { label: "Team members", value: team.length, href: "/admin/team", icon: UsersThree },
    { label: "In the portfolio book", value: projects.filter((p) => p.inBook && p.published).length, href: "/admin/projects", icon: TextAa },
  ];

  return (
    <>
      <PageTitle title="Overview" description="What visitors see right now, and what needs your attention." />
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {stats.map(({ label, value, href, icon: Icon }) => (
          <Link key={label} href={href} className="group border border-white/10 bg-deep-2 p-4 transition-colors hover:border-ochre/40 sm:p-5">
            <Icon size={20} className="text-ochre" aria-hidden="true" />
            <p className="mega mega-md mt-6">{String(value).padStart(2, "0")}</p>
            <p className="mt-1 flex items-center justify-between text-sm text-mist">
              {label}
              <ArrowRight size={14} className="opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true" />
            </p>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <Card title="Latest messages" actions={<Link href="/admin/messages" className="-my-2 inline-block py-2 text-sm text-ochre hover:underline">Open inbox</Link>}>
          {messages.length === 0 ? (
            <p className="text-sm text-mist">No messages yet. Enquiries from the contact page arrive here.</p>
          ) : (
            <ul className="flex flex-col divide-y divide-white/10">
              {messages.slice(0, 5).map((m) => (
                <li key={m.id} className="flex items-start justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <p className="font-medium">
                      {!m.read && <span className="me-2 inline-block h-2 w-2 rounded-full bg-ochre" aria-label="Unread" />}
                      {m.name}
                    </p>
                    <p className="truncate text-sm text-mist">{m.message}</p>
                  </div>
                  <time className="shrink-0 text-xs text-mist">{new Date(m.createdAt).toLocaleDateString()}</time>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card title="Quick edits">
          <ul className="grid gap-2 sm:grid-cols-2">
            {[
              { href: "/admin/projects/new", label: "Add a project" },
              { href: "/admin/content#hero", label: "Change the home headline" },
              { href: "/admin/content#services", label: "Edit services" },
              { href: "/admin/settings", label: "Update phone numbers" },
            ].map((q) => (
              <li key={q.href}>
                <Link href={q.href} className="flex items-center justify-between border border-white/10 px-4 py-3 text-sm hover:border-ochre/40 hover:text-ochre">
                  {q.label} <ArrowRight size={14} aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}
