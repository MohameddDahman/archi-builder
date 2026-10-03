"use client";

import { useId, useRef, useState } from "react";
import clsx from "clsx";
import { CheckCircle, WhatsappLogo, Phone, MapPin } from "@phosphor-icons/react";
import { useLocale } from "@/components/providers/locale";
import { useSite } from "@/lib/content/store";
import { ui } from "@/lib/dict";
import { PageHero } from "@/components/ui/page-hero";
import { Axis, BtnButton, BtnA, TextArrow } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/motion";

type Fields = { name: string; phone: string; email: string; projectType: string; message: string };
type Errors = Partial<Record<keyof Fields, string>>;

const empty: Fields = { name: "", phone: "", email: "", projectType: "", message: "" };

export function ContactPage() {
  const { t } = useLocale();
  return (
    <>
      <PageHero index="06" name={t(ui.nav.contact)} title={t(ui.contactTitle)} lead={t(ui.contactIntro)} />
      <section className="px-[var(--gutter)] pb-[var(--bay)] pt-16">
        <div className="grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <ContactForm />
          </div>
          <div className="lg:col-span-4 lg:col-start-9">
            <Details />
          </div>
        </div>
      </section>
    </>
  );
}

function ContactForm() {
  const { t, lang } = useLocale();
  const addMessage = useSite((s) => s.addMessage);
  const [f, setF] = useState<Fields>(empty);
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof Fields, boolean>>>({});
  const [state, setState] = useState<"idle" | "sending" | "sent" | "failed">("idle");
  const summary = useRef<HTMLDivElement>(null);
  const id = useId();

  const validate = (v: Fields): Errors => {
    const e: Errors = {};
    if (v.name.trim().length < 2) e.name = t(ui.form.errName);
    if (v.phone.replace(/\D/g, "").length < 9) e.phone = t(ui.form.errPhone);
    if (v.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)) e.email = t(ui.form.errEmail);
    if (v.message.trim().length < 10) e.message = t(ui.form.errMessage);
    return e;
  };

  const set = (k: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const next = { ...f, [k]: e.target.value };
    setF(next);
    if (touched[k]) setErrors(validate(next));
  };
  const blur = (k: keyof Fields) => () => {
    setTouched((s) => ({ ...s, [k]: true }));
    setErrors(validate(f));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const found = validate(f);
    setErrors(found);
    setTouched({ name: true, phone: true, email: true, message: true });
    if (Object.keys(found).length) {
      requestAnimationFrame(() => summary.current?.focus());
      return;
    }
    setState("sending");
    try {
      await addMessage({ ...f, locale: lang });
      setState("sent");
    } catch {
      setState("failed");
    }
  };

  if (state === "sent") {
    return (
      <div className="chamfer chamfer-lg flex flex-col items-start gap-6 bg-deep-2 p-10" role="status">
        <CheckCircle size={40} weight="thin" className="text-ochre" aria-hidden="true" />
        <h2 className="mega mega-md">{t(ui.form.sent)}</h2>
        <p className="max-w-md text-gypsum/70">{t(ui.form.sentBody)}</p>
        <BtnButton
          tone="ghost"
          onClick={() => {
            setF(empty);
            setErrors({});
            setTouched({});
            setState("idle");
          }}
        >
          {t(ui.form.another)}
        </BtnButton>
      </div>
    );
  }

  const errList = Object.entries(errors).filter(([k]) => touched[k as keyof Fields]);
  const field = "w-full border-b border-white/20 bg-transparent py-3 text-lg outline-none transition-colors placeholder:text-gypsum/30 focus:border-ochre";

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-10">
      {errList.length > 0 && state === "idle" && (
        <div ref={summary} tabIndex={-1} role="alert" className="chamfer border-s-2 border-ochre bg-deep-2 p-5 outline-none">
          <p className="label text-ochre">{lang === "ar" ? "راجع الحقول التالية" : "Check these fields"}</p>
          <ul className="mt-3 flex flex-col gap-1 text-sm">
            {errList.map(([k, msg]) => (
              <li key={k}>
                <a href={`#${id}-${k}`} className="link-line">
                  {msg}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Axis letter="A" className="text-ochre">
        {t(ui.startProject)}
      </Axis>

      <div className="grid gap-10 md:grid-cols-2">
        <Field id={`${id}-name`} label={t(ui.form.name)} error={touched.name ? errors.name : undefined} required>
          <input id={`${id}-name`} className={field} value={f.name} onChange={set("name")} onBlur={blur("name")} autoComplete="name" required aria-invalid={!!(touched.name && errors.name)} aria-describedby={errors.name ? `${id}-name-err` : undefined} />
        </Field>
        <Field id={`${id}-phone`} label={t(ui.form.phone)} error={touched.phone ? errors.phone : undefined} required>
          <input id={`${id}-phone`} type="tel" inputMode="tel" dir="ltr" className={clsx(field, "text-start")} value={f.phone} onChange={set("phone")} onBlur={blur("phone")} autoComplete="tel" required aria-invalid={!!(touched.phone && errors.phone)} aria-describedby={errors.phone ? `${id}-phone-err` : undefined} placeholder="05X XXX XXXX" />
        </Field>
      </div>

      <Field id={`${id}-email`} label={t(ui.form.email)} error={touched.email ? errors.email : undefined}>
        <input id={`${id}-email`} type="email" inputMode="email" dir="ltr" className={clsx(field, "text-start")} value={f.email} onChange={set("email")} onBlur={blur("email")} autoComplete="email" aria-invalid={!!(touched.email && errors.email)} aria-describedby={errors.email ? `${id}-email-err` : undefined} />
      </Field>

      <fieldset>
        <legend className="label mb-4 text-mist">{t(ui.form.type)}</legend>
        <div className="flex flex-wrap gap-2">
          {ui.form.types.map((ty) => {
            const value = ty.en;
            const on = f.projectType === value;
            return (
              <label key={value} className={clsx("label chamfer cursor-pointer px-4 py-3 transition-colors [--chamfer:9px]", on ? "bg-ochre text-ink" : "bg-white/[0.06] text-gypsum/75 hover:bg-white/[0.12]")}>
                <input type="radio" name="projectType" value={value} checked={on} onChange={() => setF({ ...f, projectType: value })} className="sr-only" />
                {t(ty)}
              </label>
            );
          })}
        </div>
      </fieldset>

      <Field id={`${id}-message`} label={t(ui.form.message)} error={touched.message ? errors.message : undefined} help={t(ui.form.messageHelp)} required>
        <textarea id={`${id}-message`} rows={5} className={clsx(field, "resize-none")} value={f.message} onChange={set("message")} onBlur={blur("message")} required aria-invalid={!!(touched.message && errors.message)} aria-describedby={`${id}-message-help${errors.message ? ` ${id}-message-err` : ""}`} />
      </Field>

      <div className="flex flex-col items-start gap-4">
        {state === "failed" && (
          <p role="alert" className="max-w-md text-sm text-red-300">
            {t(ui.form.failed)}
          </p>
        )}
        <BtnButton type="submit" disabled={state === "sending"} aria-busy={state === "sending"} className="disabled:opacity-70">
          {state === "sending" ? t(ui.form.sending) : t(ui.form.send)}
        </BtnButton>
      </div>
    </form>
  );
}

function Field({ id, label, error, help, required, children }: { id: string; label: string; error?: string; help?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="label block text-mist">
        {label}
        {required && <span className="text-ochre"> *</span>}
      </label>
      {children}
      {help && (
        <p id={`${id}-help`} className="mt-2 text-sm text-gypsum/50">
          {help}
        </p>
      )}
      {error && (
        <p id={`${id}-err`} className="mt-2 text-sm text-ochre-2" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function Details() {
  const { t } = useLocale();
  const settings = useSite((s) => s.settings);
  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(settings.mapQuery)}&output=embed`;
  const mapHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.mapQuery)}`;
  return (
    <Reveal className="flex flex-col gap-10">
      <div>
        <p className="label mb-3 flex items-center gap-2 text-mist">
          <MapPin size={14} aria-hidden="true" /> {t(ui.address)}
        </p>
        <address className="statement-sm not-italic">{t(settings.address)}</address>
        <a href={mapHref} target="_blank" rel="noreferrer" className="label link-line mt-3 inline-block text-ochre">
          {t(ui.directions)} <TextArrow to="out" />
        </a>
      </div>
      <div>
        <p className="label mb-3 flex items-center gap-2 text-mist">
          <Phone size={14} aria-hidden="true" /> {t(ui.phones)}
        </p>
        <ul className="flex flex-col gap-1">
          {settings.phones.map((p) => (
            <li key={p}>
              <a href={`tel:${p}`} className="statement-sm link-line" dir="ltr">
                {p}
              </a>
            </li>
          ))}
        </ul>
      </div>
      {settings.whatsapp && (
        <div>
          <BtnA href={`https://wa.me/${settings.whatsapp}`} external tone="ghost">
            <span className="flex items-center gap-2">
              <WhatsappLogo size={16} aria-hidden="true" /> {t(ui.whatsapp)}
            </span>
          </BtnA>
        </div>
      )}
      <div className="chamfer chamfer-lg relative aspect-[4/3] overflow-hidden bg-deep-3">
        <iframe
          title={t(ui.address)}
          src={mapSrc}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="absolute inset-0 h-full w-full [filter:grayscale(1)_invert(0.92)_contrast(0.9)]"
        />
      </div>
    </Reveal>
  );
}
