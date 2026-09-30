"use client";

import { useId, useRef, useState } from "react";
import clsx from "clsx";
import { UploadSimple, ImagesSquare, X, ArrowLeft, ArrowRight } from "@phosphor-icons/react";
import { seed } from "@/lib/content/seed";
import { Button, Field, IconButton, useToast } from "./ui";

/** Downscale and re-encode uploads as WebP so they stay light. */
export async function compressImage(file: File, max = 1800, quality = 0.82): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("not-image");
  if (file.size > 20 * 1024 * 1024) throw new Error("too-large");
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/webp", quality);
}

/** Every image already on the site, offered as a library. */
export const imageLibrary = Array.from(
  new Set([
    ...seed.projects.flatMap((p) => [p.cover, ...p.gallery]),
    seed.content.about.image,
    seed.content.vision.image,
    seed.content.mission.image,
    ...seed.content.services.map((s) => s.image),
    ...seed.content.sectors.map((s) => s.image),
    "/images/site/villa-dusk.jpg",
    "/images/site/process-hall.jpg",
    "/images/site/detail.jpg",
    "/images/site/helmet.jpg",
  ]),
);

function Thumb({ src, className }: { src: string; className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="" className={clsx("h-full w-full object-cover", className)} loading="lazy" />;
}

function Library({ onPick, onClose }: { onPick: (src: string) => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Image library"
        className="chamfer max-h-[85vh] w-full max-w-4xl overflow-y-auto bg-deep-2 p-5 ring-1 ring-white/10"
        onClick={(e) => e.stopPropagation()}
        data-lenis-prevent
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold">Image library</h2>
          <IconButton label="Close" onClick={onClose}>
            <X size={16} />
          </IconButton>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          {imageLibrary.map((src) => (
            <button key={src} type="button" onClick={() => onPick(src)} className="aspect-square overflow-hidden ring-ochre hover:ring-2 focus-visible:ring-2">
              <Thumb src={src} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ImageInput({ label, value, onChange, help }: { label: string; value: string; onChange: (v: string) => void; help?: string }) {
  const id = useId();
  const file = useRef<HTMLInputElement>(null);
  const [lib, setLib] = useState(false);
  const [busy, setBusy] = useState(false);
  const toast = useToast();

  const upload = async (f?: File) => {
    if (!f) return;
    setBusy(true);
    try {
      onChange(await compressImage(f));
      toast("Image added. Save to publish it.");
    } catch (e) {
      toast((e as Error).message === "too-large" ? "That file is over 20 MB. Use a smaller image." : "That file isn't an image. Choose a JPG, PNG or WebP.", "warn");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Field label={label} help={help} htmlFor={id}>
      <div className="flex items-start gap-4">
        <div className="aspect-[4/3] w-40 shrink-0 overflow-hidden bg-deep ring-1 ring-white/10">{value ? <Thumb src={value} /> : null}</div>
        <div className="flex flex-col gap-2">
          <input id={id} ref={file} type="file" accept="image/*" className="sr-only" onChange={(e) => upload(e.target.files?.[0])} />
          <Button icon={<UploadSimple size={16} />} onClick={() => file.current?.click()} disabled={busy}>
            {busy ? "Processing…" : "Upload"}
          </Button>
          <Button icon={<ImagesSquare size={16} />} onClick={() => setLib(true)}>
            Choose from library
          </Button>
        </div>
      </div>
      {lib && (
        <Library
          onPick={(src) => {
            onChange(src);
            setLib(false);
          }}
          onClose={() => setLib(false)}
        />
      )}
    </Field>
  );
}

export function GalleryInput({ label, value, onChange }: { label: string; value: string[]; onChange: (v: string[]) => void }) {
  const id = useId();
  const file = useRef<HTMLInputElement>(null);
  const [lib, setLib] = useState(false);
  const [busy, setBusy] = useState(false);
  const toast = useToast();

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    const added: string[] = [];
    for (const f of Array.from(files)) {
      try {
        added.push(await compressImage(f));
      } catch {
        toast(`Skipped ${f.name}: not an image or over 20 MB.`, "warn");
      }
    }
    onChange([...value, ...added]);
    setBusy(false);
  };
  const move = (i: number, d: number) => {
    const next = [...value];
    const [x] = next.splice(i, 1);
    next.splice(i + d, 0, x);
    onChange(next);
  };

  return (
    <Field label={label} help="The first image is used where one photograph is shown." htmlFor={id}>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {value.map((src, i) => (
          <div key={`${src.slice(0, 40)}-${i}`} className="group relative aspect-[4/3] overflow-hidden bg-deep ring-1 ring-white/10">
            <Thumb src={src} />
            <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/70 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
              <IconButton label="Move earlier" disabled={i === 0} onClick={() => move(i, -1)}>
                <ArrowLeft size={14} />
              </IconButton>
              <IconButton label="Remove image" onClick={() => onChange(value.filter((_, j) => j !== i))}>
                <X size={14} />
              </IconButton>
              <IconButton label="Move later" disabled={i === value.length - 1} onClick={() => move(i, 1)}>
                <ArrowRight size={14} />
              </IconButton>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <input id={id} ref={file} type="file" accept="image/*" multiple className="sr-only" onChange={(e) => upload(e.target.files)} />
        <Button icon={<UploadSimple size={16} />} onClick={() => file.current?.click()} disabled={busy}>
          {busy ? "Processing…" : "Upload images"}
        </Button>
        <Button icon={<ImagesSquare size={16} />} onClick={() => setLib(true)}>
          Add from library
        </Button>
      </div>
      {lib && (
        <Library
          onPick={(src) => {
            onChange([...value, src]);
            setLib(false);
          }}
          onClose={() => setLib(false)}
        />
      )}
    </Field>
  );
}
