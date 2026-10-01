"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, FloppyDisk, Trash, Eye } from "@phosphor-icons/react";
import { useSite, newId } from "@/lib/content/store";
import type { Project, Sector } from "@/lib/content/types";
import type { L } from "@/lib/i18n";
import { Bilingual, Button, Card, Confirm, ListEditor, PageTitle, Select, TextInput, Toggle, useToast, useUnsavedGuard } from "./ui";
import { GalleryInput, ImageInput } from "./image-input";

const blank = (order: number): Project => ({
  id: newId("p"),
  slug: "",
  name: "",
  nameAr: "",
  type: { en: "", ar: "" },
  sector: "commercial",
  city: { en: "Jeddah", ar: "جدة" },
  year: "",
  area: "",
  scope: [],
  summary: { en: "", ar: "" },
  cover: "",
  gallery: [],
  featured: false,
  inBook: true,
  published: false,
  order,
});

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-");

export function ProjectEditor({ id }: { id: string }) {
  const router = useRouter();
  const toast = useToast();
  const hydrated = useSite((s) => s.hydrated);
  const projects = useSite((s) => s.projects);
  const saveProject = useSite((s) => s.saveProject);
  const deleteProject = useSite((s) => s.deleteProject);
  const isNew = id === "new";
  const existing = projects.find((p) => p.id === id);

  const initial = useMemo(() => existing ?? blank(projects.length + 1), [existing, projects.length]);
  const [p, setP] = useState<Project>(initial);
  const [dirty, setDirty] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  useUnsavedGuard(dirty);

  useEffect(() => {
    if (!dirty) setP(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial]);

  const up = <K extends keyof Project>(k: K, v: Project[K]) => {
    setP((cur) => ({ ...cur, [k]: v }));
    setDirty(true);
  };

  if (hydrated && !isNew && !existing) {
    return (
      <div>
        <PageTitle title="Project not found" description="It may have been deleted." />
        <Link href="/admin/projects" className="text-ochre hover:underline">
          Back to projects
        </Link>
      </div>
    );
  }

  const validate = () => {
    const e: Record<string, string> = {};
    if (!p.name.trim()) e.name = "Add the project name in English.";
    const slug = p.slug || slugify(p.name);
    if (!slug) e.slug = "Add a web address (letters, numbers and dashes).";
    else if (projects.some((x) => x.slug === slug && x.id !== p.id)) e.slug = "Another project already uses this address. Change it slightly.";
    if (!p.cover) e.cover = "Choose a cover image.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const save = () => {
    if (!validate()) {
      toast("Fix the highlighted fields, then save again.", "warn");
      return;
    }
    const final = { ...p, slug: p.slug || slugify(p.name), gallery: p.gallery.length ? p.gallery : [p.cover] };
    saveProject(final);
    setP(final);
    setDirty(false);
    toast(`Saved ${final.name}${final.published ? "" : " as a draft"}`);
    if (isNew) router.replace(`/admin/projects/${final.id}`);
  };

  return (
    <>
      <Link href="/admin/projects" className="mb-4 inline-flex items-center gap-2 text-sm text-mist hover:text-gypsum">
        <ArrowLeft size={14} /> All projects
      </Link>
      <PageTitle
        title={isNew ? "New project" : p.name || "Untitled"}
        description={dirty ? "You have unsaved changes." : "All changes saved."}
        actions={
          <>
            {!isNew && p.published && (
              <a href={`/en/projects/${p.slug}`} target="_blank" rel="noreferrer" className="chamfer inline-flex h-10 items-center gap-2 bg-white/[0.06] px-4 text-sm hover:bg-white/[0.12] [--chamfer:8px]">
                <Eye size={16} /> View on site
              </a>
            )}
            {!isNew && (
              <Button tone="danger" icon={<Trash size={16} />} onClick={() => setConfirm(true)}>
                Delete
              </Button>
            )}
            <Button tone="primary" icon={<FloppyDisk size={16} />} onClick={save}>
              {isNew ? "Create project" : "Save changes"}
            </Button>
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_20rem]">
        <div className="flex flex-col gap-6">
          <Card title="Name and type">
            <div className="flex flex-col gap-4">
              <div className="grid gap-3 md:grid-cols-2">
                <TextInput label="Name · English" value={p.name} onChange={(v) => up("name", v)} error={errors.name} />
                <TextInput label="Name · العربية" dir="rtl" value={p.nameAr} onChange={(v) => up("nameAr", v)} />
              </div>
              <Bilingual label="Type" value={p.type} onChange={(v) => up("type", v)} help="For example: Restaurant & lounge" />
              <div className="grid gap-3 md:grid-cols-3">
                <Select<Sector>
                  label="Sector"
                  value={p.sector}
                  onChange={(v) => up("sector", v)}
                  options={[
                    { value: "hospitality", label: "Hospitality" },
                    { value: "commercial", label: "Commercial" },
                    { value: "residential", label: "Residential" },
                  ]}
                />
                <TextInput label="Year (optional)" value={p.year} onChange={(v) => up("year", v)} inputMode="numeric" />
                <TextInput label="Area in m² (optional)" value={p.area} onChange={(v) => up("area", v)} inputMode="numeric" />
              </div>
              <Bilingual label="City" value={p.city} onChange={(v) => up("city", v)} />
              <TextInput
                label="Web address"
                value={p.slug}
                onChange={(v) => up("slug", slugify(v))}
                error={errors.slug}
                help={`archibuilder.sa/en/projects/${p.slug || slugify(p.name) || "project-name"}`}
                dir="ltr"
              />
            </div>
          </Card>

          <Card title="Description">
            <Bilingual label="Summary" value={p.summary} onChange={(v) => up("summary", v)} multiline rows={4} />
          </Card>

          <Card title="Scope of work" description="Shown on the project page and in the book.">
            <ListEditor<L>
              items={p.scope}
              onChange={(v) => up("scope", v)}
              create={() => ({ en: "", ar: "" })}
              addLabel="Add scope item"
              itemLabel={(s) => s.en || "New item"}
              render={(s, update) => <Bilingual label="Item" value={s} onChange={update} />}
            />
          </Card>

          <Card title="Materials and finishes" description="Optional. Listed under the project's detail photographs in the book, for example: Oak veneer, Terrazzo floor.">
            <ListEditor<L>
              items={p.materials ?? []}
              onChange={(v) => up("materials", v)}
              create={() => ({ en: "", ar: "" })}
              addLabel="Add material"
              itemLabel={(s) => s.en || "New material"}
              render={(s, update) => <Bilingual label="Material" value={s} onChange={update} />}
            />
          </Card>

          <Card title="Images">
            <div className="flex flex-col gap-6">
              <ImageInput label="Cover" value={p.cover} onChange={(v) => up("cover", v)} help={errors.cover} />
              <GalleryInput label="Gallery" value={p.gallery} onChange={(v) => up("gallery", v)} />
            </div>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card title="Visibility">
            <div className="flex flex-col gap-5">
              <Toggle label="Published" description="Visible on the site." checked={p.published} onChange={(v) => up("published", v)} />
              <Toggle label="Featured" description="Shown in the home slideshow." checked={p.featured} onChange={(v) => up("featured", v)} />
              <Toggle label="In the book" description="Gets a spread in the portfolio book." checked={p.inBook} onChange={(v) => up("inBook", v)} />
            </div>
          </Card>
          {p.cover && (
            <Card title="Preview">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.cover} alt="" className="aspect-[4/5] w-full object-cover" />
              <p className="mt-3 font-semibold uppercase">{p.name || "Untitled"}</p>
              <p className="text-xs text-mist">
                {p.type.en} · {p.city.en}
              </p>
            </Card>
          )}
        </div>
      </div>

      <Confirm
        open={confirm}
        title={`Delete ${p.name || "this project"}?`}
        body="It will disappear from the site and the portfolio book. This can't be undone."
        confirmLabel="Delete project"
        onConfirm={() => {
          deleteProject(p.id);
          setDirty(false);
          toast(`Deleted ${p.name}`);
          router.push("/admin/projects");
        }}
        onClose={() => setConfirm(false)}
      />
    </>
  );
}
