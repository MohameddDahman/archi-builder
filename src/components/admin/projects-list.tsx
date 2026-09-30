"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Plus, PencilSimple, ArrowUp, ArrowDown, Trash, MagnifyingGlass } from "@phosphor-icons/react";
import { useSite } from "@/lib/content/store";
import { Button, Confirm, IconButton, PageTitle, useToast } from "./ui";

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

  const move = (id: string, d: number) => {
    const ids = sorted.map((p) => p.id);
    const i = ids.indexOf(id);
    const j = i + d;
    if (j < 0 || j >= ids.length) return;
    [ids[i], ids[j]] = [ids[j], ids[i]];
    reorder(ids);
  };

  const flag = (id: string, key: "published" | "featured" | "inBook") => {
    const p = projects.find((x) => x.id === id);
    if (!p) return;
    saveProject({ ...p, [key]: !p[key] });
    toast(`${p.name}: ${key === "inBook" ? "book" : key} ${!p[key] ? "on" : "off"}`);
  };

  const target = projects.find((p) => p.id === pending);

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
        <input id="project-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, city or type" className="h-11 flex-1 bg-transparent text-sm outline-none placeholder:text-gypsum/30" />
      </div>
      <div className="overflow-x-auto border border-white/10">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-deep-2 text-left text-xs uppercase tracking-[0.08em] text-mist">
            <tr>
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">Project</th>
              <th className="px-4 py-3 font-medium">Published</th>
              <th className="px-4 py-3 font-medium">Featured</th>
              <th className="px-4 py-3 font-medium">In book</th>
              <th className="px-4 py-3 text-end font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {shown.map((p, i) => (
              <tr key={p.id} className="hover:bg-white/[0.02]">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <span className="w-6 font-mono text-xs text-ochre">{String(i + 1).padStart(2, "0")}</span>
                    <IconButton label="Move up" onClick={() => move(p.id, -1)} disabled={q !== "" || i === 0}>
                      <ArrowUp size={14} />
                    </IconButton>
                    <IconButton label="Move down" onClick={() => move(p.id, 1)} disabled={q !== "" || i === shown.length - 1}>
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
                {(["published", "featured", "inBook"] as const).map((k) => (
                  <td key={k} className="px-4 py-3">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={p[k]}
                      aria-label={`${k} ${p.name}`}
                      onClick={() => flag(p.id, k)}
                      className={`relative h-6 w-11 rounded-full transition-colors ${p[k] ? "bg-ochre" : "bg-white/15"}`}
                    >
                      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${p[k] ? "left-[1.4rem]" : "left-0.5"}`} />
                    </button>
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
            {shown.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-mist">
                  No projects match “{q}”.{" "}
                  <Button tone="ghost" className="ms-2" onClick={() => setQ("")}>
                    Clear search
                  </Button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Confirm
        open={!!target}
        title={`Delete ${target?.name ?? "project"}?`}
        body="It will disappear from the site, the filters and the portfolio book. This can't be undone."
        confirmLabel="Delete project"
        onConfirm={() => {
          if (!target) return;
          deleteProject(target.id);
          toast(`Deleted ${target.name}`);
        }}
        onClose={() => setPending(null)}
      />
    </>
  );
}
