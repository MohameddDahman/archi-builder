"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import clsx from "clsx";
import { Plus, PencilSimple, ArrowUp, ArrowDown, Trash, MagnifyingGlass } from "@phosphor-icons/react";
import { useSite } from "@/lib/content/store";
import { errorText } from "@/lib/admin/session";
import type { Project } from "@/lib/content/types";
import { Button, Confirm, IconButton, PageTitle, useToast } from "./ui";

type Flag = "published" | "featured" | "inBook";
const flags: { key: Flag; label: string }[] = [
  { key: "published", label: "Published" },
  { key: "featured", label: "Featured" },
  { key: "inBook", label: "In book" },
];

function Switch({ on, label, onClick }: { on: boolean; label: string; onClick: () => void }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} onClick={onClick} className={clsx("relative h-6 w-11 shrink-0 rounded-full transition-colors", on ? "bg-ochre" : "bg-white/15")}>
      <span className={clsx("absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all", on ? "left-[1.4rem]" : "left-0.5")} />
    </button>
  );
}

export function ProjectsList() {
  const projects = useSite((s) => s.projects);
  const saveProject = useSite((s) => s.saveProject);
  const deleteProject = useSite((s) => s.deleteProject);
  const reorder = useSite((s) => s.reorderProjects);
  const toast = useToast();
  const [q, setQ] = useState("");
  const [pending, setPending] = useState<string | null>(null);

  const sorted = useMemo(() => [...projects].sort((a, b) => a.order - b.order), [projects]);
  const shown = sorted.filter((p) => `${p.name} ${p.nameAr} ${p.city.en} ${p.type.en}`.toLowerCase().includes(q.toLowerCase()));

  const run = async (work: Promise<void>, done: string) => {
    try {
      await work;
      toast(done);
    } catch (e) {
      toast(errorText(e), "warn");
    }
  };

  const move = (id: string, d: number) => {
    const ids = sorted.map((p) => p.id);
    const i = ids.indexOf(id);
    const j = i + d;
    if (j < 0 || j >= ids.length) return;
    [ids[i], ids[j]] = [ids[j], ids[i]];
    void run(reorder(ids), "Order saved");
  };

  const flag = (p: Project, key: Flag) => {
    const on = !p[key];
    void run(saveProject({ ...p, [key]: on }), `${p.name}: ${key === "inBook" ? "book" : key} ${on ? "on" : "off"}`);
  };

  const target = projects.find((p) => p.id === pending);
  const searching = q !== "";

  return (
    <>
      <PageTitle
        title="Projects"
        description="Order sets the running order on the site and in the book. Featured projects appear in the home slideshow."
        actions={
          <Link href="/admin/projects/new" className="chamfer gold-fill inline-flex h-10 items-center gap-2 px-4 text-sm font-medium text-ink [--chamfer:8px]">
            <Plus size={16} /> New project
          </Link>
        }
      />
      <div className="mb-4 flex items-center gap-2 border border-white/10 bg-deep-2 px-3">
        <MagnifyingGlass size={16} className="text-mist" aria-hidden="true" />
        <label htmlFor="project-search" className="sr-only">
          Search projects
        </label>
        <input id="project-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, city or type" className="h-11 min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-gypsum/30 md:text-sm" />
      </div>

      {/* Phone and tablet: one card per project */}
      <ul className="flex flex-col gap-3 lg:hidden">
        {shown.map((p, i) => (
          <li key={p.id} className="border border-white/10 bg-deep-2">
            <div className="flex gap-3 p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.cover} alt="" className="h-20 w-24 shrink-0 object-cover" />
              <div className="min-w-0 flex-1">
                <p className="flex items-baseline gap-2">
                  <span className="font-mono text-xs text-ochre">{String(i + 1).padStart(2, "0")}</span>
                  <span className="truncate font-medium">{p.name}</span>
                </p>
                <p className="mt-0.5 truncate text-xs text-mist">
                  {p.type.en} · {p.city.en}
                </p>
                <div className="mt-2 flex items-center gap-1">
                  <IconButton label={`Move ${p.name} up`} onClick={() => move(p.id, -1)} disabled={searching || i === 0}>
                    <ArrowUp size={16} />
                  </IconButton>
                  <IconButton label={`Move ${p.name} down`} onClick={() => move(p.id, 1)} disabled={searching || i === shown.length - 1}>
                    <ArrowDown size={16} />
                  </IconButton>
                  <Link href={`/admin/projects/${p.id}`} className="ms-auto grid h-10 w-10 place-items-center text-gypsum/70 hover:text-gypsum" aria-label={`Edit ${p.name}`}>
                    <PencilSimple size={18} />
                  </Link>
                  <IconButton label={`Delete ${p.name}`} onClick={() => setPending(p.id)} className="hover:!text-red-300">
                    <Trash size={18} />
                  </IconButton>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 border-t border-white/10">
              {flags.map(({ key, label }) => (
                <div key={key} className="flex flex-col items-center gap-1.5 border-e border-white/10 py-2.5 last:border-e-0">
                  <span className="text-[0.65rem] uppercase tracking-[0.08em] text-mist">{label}</span>
                  <Switch on={p[key]} label={`${label}: ${p.name}`} onClick={() => flag(p, key)} />
                </div>
              ))}
            </div>
          </li>
        ))}
      </ul>

      {/* Desktop: the table */}
      <div className="hidden overflow-x-auto border border-white/10 lg:block">
        <table className="w-full text-sm">
          <thead className="bg-deep-2 text-left text-xs uppercase tracking-[0.08em] text-mist">
            <tr>
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">Project</th>
              {flags.map((f) => (
                <th key={f.key} className="px-4 py-3 font-medium">
                  {f.label}
                </th>
              ))}
              <th className="px-4 py-3 text-end font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {shown.map((p, i) => (
              <tr key={p.id} className="hover:bg-white/[0.02]">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <span className="w-6 font-mono text-xs text-ochre">{String(i + 1).padStart(2, "0")}</span>
                    <IconButton label={`Move ${p.name} up`} onClick={() => move(p.id, -1)} disabled={searching || i === 0}>
                      <ArrowUp size={14} />
                    </IconButton>
                    <IconButton label={`Move ${p.name} down`} onClick={() => move(p.id, 1)} disabled={searching || i === shown.length - 1}>
                      <ArrowDown size={14} />
                    </IconButton>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.cover} alt="" className="h-12 w-16 object-cover" />
                    <div>
                      <p className="font-medium">{p.name}</p>
                      <p className="text-xs text-mist">
                        {p.type.en} · {p.city.en}
                      </p>
                    </div>
                  </div>
                </td>
                {flags.map(({ key, label }) => (
                  <td key={key} className="px-4 py-3">
                    <Switch on={p[key]} label={`${label}: ${p.name}`} onClick={() => flag(p, key)} />
                  </td>
                ))}
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <Link href={`/admin/projects/${p.id}`} className="grid h-9 w-9 place-items-center text-gypsum/70 hover:bg-white/10 hover:text-gypsum" aria-label={`Edit ${p.name}`} title="Edit">
                      <PencilSimple size={16} />
                    </Link>
                    <IconButton label={`Delete ${p.name}`} onClick={() => setPending(p.id)} className="hover:!text-red-300">
                      <Trash size={16} />
                    </IconButton>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {shown.length === 0 && (
        <div className="mt-3 border border-white/10 px-4 py-10 text-center text-mist">
          No projects match “{q}”.{" "}
          <Button tone="ghost" className="ms-2" onClick={() => setQ("")}>
            Clear search
          </Button>
        </div>
      )}

      <Confirm
        open={!!target}
        title={`Delete ${target?.name ?? "project"}?`}
        body="It will disappear from the site, the filters and the portfolio book. This can't be undone."
        confirmLabel="Delete project"
        onConfirm={() => {
          if (target) void run(deleteProject(target.id), `Deleted ${target.name}`);
        }}
        onClose={() => setPending(null)}
      />
    </>
  );
}
