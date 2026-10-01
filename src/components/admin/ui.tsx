"use client";

import { createContext, useCallback, useContext, useEffect, useId, useRef, useState } from "react";
import clsx from "clsx";
import { Check, Warning, X, ArrowUp, ArrowDown, Trash, Plus, FloppyDisk } from "@phosphor-icons/react";
import type { L } from "@/lib/i18n";

/* ------------------------------------------------------------------
   Buttons
------------------------------------------------------------------ */
type BtnTone = "primary" | "ghost" | "danger" | "subtle";
const btnTones: Record<BtnTone, string> = {
  primary: "gold-fill text-ink",
  ghost: "bg-transparent ring-1 ring-inset ring-white/15 hover:ring-white/40",
  danger: "bg-red-500/10 text-red-300 ring-1 ring-inset ring-red-400/30 hover:bg-red-500/20",
  subtle: "bg-white/[0.06] hover:bg-white/[0.12]",
};

export function Button({
  tone = "subtle",
  className,
  children,
  icon,
  ...rest
}: { tone?: BtnTone; icon?: React.ReactNode } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={clsx(
        "chamfer inline-flex h-10 items-center gap-2 px-4 text-sm font-medium transition-colors [--chamfer:8px] disabled:cursor-not-allowed disabled:opacity-40",
        btnTones[tone],
        className,
      )}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
}

export function IconButton({ label, className, children, ...rest }: { label: string } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={clsx("grid h-10 w-10 place-items-center rounded-sm text-gypsum/70 transition-colors hover:bg-white/10 hover:text-gypsum disabled:opacity-30 lg:h-9 lg:w-9", className)}
      {...rest}
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------
   Surfaces
------------------------------------------------------------------ */
export function Card({ title, description, actions, children, className }: { title?: string; description?: string; actions?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={clsx("border border-white/10 bg-deep-2", className)}>
      {(title || actions) && (
        <header className="flex flex-wrap items-start justify-between gap-3 border-b border-white/10 px-4 py-4 sm:px-5">
          <div>
            {title && <h2 className="font-semibold">{title}</h2>}
            {description && <p className="mt-1 text-sm text-mist">{description}</p>}
          </div>
          {actions && <div className="flex gap-2">{actions}</div>}
        </header>
      )}
      <div className="p-4 sm:p-5">{children}</div>
    </section>
  );
}

export function PageTitle({ title, description, actions }: { title: string; description?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4 md:mb-8">
      <div className="min-w-0">
        <h1 className="mega mega-md break-words">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm text-mist">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

/* ------------------------------------------------------------------
   Fields
------------------------------------------------------------------ */
const inputCls =
  "w-full border border-white/12 bg-deep px-3 py-2.5 text-base outline-none transition-colors placeholder:text-gypsum/25 focus:border-ochre aria-[invalid=true]:border-red-400/70 md:text-[0.95rem]";

export function Field({ label, help, error, children, htmlFor }: { label: string; help?: string; error?: string; children: React.ReactNode; htmlFor?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-xs font-medium uppercase tracking-[0.08em] text-mist">
        {label}
      </label>
      {children}
      {help && !error && <p className="text-xs text-gypsum/45">{help}</p>}
      {error && (
        <p className="text-xs text-red-300" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function TextInput({ label, help, error, value, onChange, multiline, rows = 3, dir, ...rest }: {
  label: string;
  help?: string;
  error?: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  rows?: number;
  dir?: "ltr" | "rtl";
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "dir">) {
  const id = useId();
  return (
    <Field label={label} help={help} error={error} htmlFor={id}>
      {multiline ? (
        <textarea id={id} rows={rows} dir={dir} className={clsx(inputCls, "resize-y")} value={value} onChange={(e) => onChange(e.target.value)} aria-invalid={!!error} />
      ) : (
        <input id={id} dir={dir} className={inputCls} value={value} onChange={(e) => onChange(e.target.value)} aria-invalid={!!error} {...rest} />
      )}
    </Field>
  );
}

/** English and Arabic side by side, the way the site is edited. */
export function Bilingual({ label, value, onChange, multiline, rows, help }: { label: string; value: L; onChange: (v: L) => void; multiline?: boolean; rows?: number; help?: string }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <TextInput label={`${label} · English`} value={value.en} onChange={(en) => onChange({ ...value, en })} multiline={multiline} rows={rows} help={help} />
      <TextInput label={`${label} · العربية`} dir="rtl" value={value.ar} onChange={(ar) => onChange({ ...value, ar })} multiline={multiline} rows={rows} />
    </div>
  );
}

export function Toggle({ label, checked, onChange, description }: { label: string; checked: boolean; onChange: (v: boolean) => void; description?: string }) {
  const id = useId();
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>
        {description && <p className="text-xs text-mist">{description}</p>}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={clsx("relative h-6 w-11 shrink-0 rounded-full transition-colors", checked ? "bg-ochre" : "bg-white/15")}
      >
        <span className={clsx("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all", checked ? "start-[1.4rem]" : "start-0.5")} />
      </button>
    </div>
  );
}

export function Select<T extends string>({ label, value, onChange, options }: { label: string; value: T; onChange: (v: T) => void; options: { value: T; label: string }[] }) {
  const id = useId();
  return (
    <Field label={label} htmlFor={id}>
      <select id={id} className={inputCls} value={value} onChange={(e) => onChange(e.target.value as T)}>
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-deep">
            {o.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

/* ------------------------------------------------------------------
   Repeating lists (values, services, steps…)
------------------------------------------------------------------ */
export function ListEditor<T>({
  items,
  onChange,
  render,
  create,
  addLabel,
  itemLabel,
}: {
  items: T[];
  onChange: (items: T[]) => void;
  render: (item: T, update: (v: T) => void, index: number) => React.ReactNode;
  create: () => T;
  addLabel: string;
  itemLabel: (item: T, index: number) => string;
}) {
  const move = (i: number, d: number) => {
    const next = [...items];
    const [x] = next.splice(i, 1);
    next.splice(i + d, 0, x);
    onChange(next);
  };
  return (
    <div className="flex flex-col gap-4">
      {items.map((item, i) => (
        <div key={i} className="border border-white/10 bg-deep/60">
          <div className="flex items-center justify-between gap-2 border-b border-white/10 px-4 py-2">
            <span className="text-sm font-medium">
              <span className="me-2 font-mono text-xs text-ochre">{String(i + 1).padStart(2, "0")}</span>
              {itemLabel(item, i)}
            </span>
            <div className="flex">
              <IconButton label="Move up" disabled={i === 0} onClick={() => move(i, -1)}>
                <ArrowUp size={16} />
              </IconButton>
              <IconButton label="Move down" disabled={i === items.length - 1} onClick={() => move(i, 1)}>
                <ArrowDown size={16} />
              </IconButton>
              <IconButton label="Remove" onClick={() => onChange(items.filter((_, j) => j !== i))} className="hover:!text-red-300">
                <Trash size={16} />
              </IconButton>
            </div>
          </div>
          <div className="flex flex-col gap-4 p-4">{render(item, (v) => onChange(items.map((x, j) => (j === i ? v : x))), i)}</div>
        </div>
      ))}
      <div>
        <Button icon={<Plus size={16} />} onClick={() => onChange([...items, create()])}>
          {addLabel}
        </Button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------
   Toasts
------------------------------------------------------------------ */
type Toast = { id: number; text: string; tone: "ok" | "warn" };
const ToastCtx = createContext<(text: string, tone?: Toast["tone"]) => void>(() => {});
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((text: string, tone: Toast["tone"] = "ok") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, text, tone }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-4 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-[60] flex flex-col items-center gap-2 lg:inset-x-auto lg:bottom-6 lg:end-6 lg:items-end"
        role="status"
        aria-live="polite"
      >
        {toasts.map((t) => (
          <div key={t.id} className="chamfer pointer-events-auto flex items-center gap-3 bg-deep-3 px-4 py-3 text-sm shadow-2xl ring-1 ring-white/10 [--chamfer:10px]">
            {t.tone === "ok" ? <Check size={16} className="text-ochre" /> : <Warning size={16} className="text-red-300" />}
            {t.text}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

/* ------------------------------------------------------------------
   Confirm dialog (destructive actions)
------------------------------------------------------------------ */
export function Confirm({
  open,
  title,
  body,
  confirmLabel,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    ref.current?.querySelector<HTMLElement>("[data-cancel]")?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      prev?.focus();
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        ref={ref}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        className="chamfer w-full max-w-md bg-deep-2 p-6 ring-1 ring-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <h2 id="confirm-title" className="text-lg font-semibold">
            {title}
          </h2>
          <IconButton label="Close" onClick={onClose}>
            <X size={16} />
          </IconButton>
        </div>
        <p className="mt-2 text-sm text-mist">{body}</p>
        <div className="mt-6 flex justify-end gap-2">
          <Button data-cancel onClick={onClose}>
            Cancel
          </Button>
          <Button
            tone="danger"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * The save button that follows the editor down the page: above the tab bar on
 * a phone, at the foot of the form on a desktop. Shown only with unsaved edits.
 */
export function SaveBar({ show, busy, onSave, label = "Save changes" }: { show: boolean; busy?: boolean; onSave: () => void; label?: string }) {
  if (!show) return null;
  return (
    <div className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-30 px-4 pb-3 lg:sticky lg:bottom-4 lg:mt-8 lg:flex lg:justify-end lg:px-0 lg:pb-0">
      <div className="chamfer flex items-center justify-between gap-3 bg-deep-3 p-2 ps-4 shadow-2xl ring-1 ring-white/10 [--chamfer:10px]">
        <span className="text-sm text-mist">Unsaved changes</span>
        <Button tone="primary" icon={<FloppyDisk size={16} />} onClick={onSave} disabled={busy}>
          {busy ? "Saving…" : label}
        </Button>
      </div>
    </div>
  );
}

/** Warn before leaving with unsaved edits. */
export function useUnsavedGuard(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);
}
