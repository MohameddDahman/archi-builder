"use client";

import { useState } from "react";
import clsx from "clsx";
import { ArrowLeft, EnvelopeSimple, EnvelopeSimpleOpen, Phone, Trash, WhatsappLogo, Tray } from "@phosphor-icons/react";
import { useSite } from "@/lib/content/store";
import { errorText } from "@/lib/admin/session";
import { Button, Confirm, PageTitle, useToast } from "./ui";

const linkCls = "chamfer inline-flex h-11 items-center gap-2 bg-white/[0.06] px-4 text-sm hover:bg-white/[0.12] [--chamfer:8px]";

/** The inbox. Two panes on a desktop; on a phone, the list and then one message at a time. */
export function Messages() {
  const toast = useToast();
  const messages = useSite((s) => s.messages);
  const setRead = useSite((s) => s.setMessageRead);
  const remove = useSite((s) => s.deleteMessage);
  const [openId, setOpenId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [pending, setPending] = useState<string | null>(null);

  const list = filter === "unread" ? messages.filter((m) => !m.read) : messages;
  const current = messages.find((m) => m.id === openId) ?? null;
  const unread = messages.filter((m) => !m.read).length;

  const run = async (work: Promise<void>, done?: string) => {
    try {
      await work;
      if (done) toast(done);
    } catch (e) {
      toast(errorText(e), "warn");
    }
  };

  const open = (id: string) => {
    setOpenId(id);
    const m = messages.find((x) => x.id === id);
    if (m && !m.read) void run(setRead(id, true));
  };

  return (
    <>
      <div className={clsx(current && "hidden lg:block")}>
        <PageTitle title="Messages" description="Enquiries sent from the contact page." />
        <div className="mb-4 flex gap-2" role="group" aria-label="Filter">
          {(["all", "unread"] as const).map((f) => (
            <Button key={f} tone={filter === f ? "primary" : "subtle"} aria-pressed={filter === f} onClick={() => setFilter(f)}>
              {f === "all" ? `All (${messages.length})` : `Unread (${unread})`}
            </Button>
          ))}
        </div>
      </div>

      {messages.length === 0 ? (
        <div className="grid place-items-center border border-dashed border-white/15 px-6 py-20 text-center">
          <Tray size={32} className="text-mist" aria-hidden="true" />
          <p className="mt-4 font-medium">No messages yet</p>
          <p className="mt-1 max-w-sm text-sm text-mist">When someone sends the form on the contact page, it lands here with their phone number ready to call.</p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[22rem_1fr]">
          <ul className={clsx("flex flex-col border border-white/10 lg:max-h-[70vh] lg:overflow-y-auto", current && "hidden lg:flex")} data-lenis-prevent>
            {list.map((m) => (
              <li key={m.id} className="border-b border-white/10 last:border-0">
                <button
                  type="button"
                  onClick={() => open(m.id)}
                  aria-current={openId === m.id}
                  className={clsx("flex w-full flex-col gap-1 px-4 py-3.5 text-start transition-colors", openId === m.id ? "bg-white/[0.08]" : "hover:bg-white/[0.04]")}
                >
                  <span className="flex items-center justify-between gap-3">
                    <span className={clsx("truncate", !m.read && "font-semibold")}>
                      {!m.read && <span className="me-2 inline-block h-2 w-2 rounded-full bg-ochre" aria-label="Unread" />}
                      {m.name}
                    </span>
                    <time className="shrink-0 text-xs text-mist">{new Date(m.createdAt).toLocaleDateString()}</time>
                  </span>
                  <span className="truncate text-sm text-mist">{m.projectType || "General enquiry"}</span>
                  <span className="line-clamp-1 text-sm text-gypsum/60 lg:hidden">{m.message}</span>
                </button>
              </li>
            ))}
            {list.length === 0 && <li className="px-4 py-8 text-center text-sm text-mist">No unread messages.</li>}
          </ul>

          <div className={clsx("border border-white/10 bg-deep-2 p-4 sm:p-6", !current && "hidden lg:block")}>
            {!current ? (
              <p className="text-sm text-mist">Select a message to read it.</p>
            ) : (
              <article>
                <button type="button" onClick={() => setOpenId(null)} className="-ms-1 mb-4 inline-flex min-h-10 items-center gap-2 text-sm text-mist hover:text-gypsum lg:hidden">
                  <ArrowLeft size={16} /> Inbox
                </button>
                <header className="flex flex-col gap-4 border-b border-white/10 pb-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <h2 className="break-words text-xl font-semibold">{current.name}</h2>
                    <p className="text-sm text-mist">
                      {current.projectType || "General enquiry"} · {new Date(current.createdAt).toLocaleString()} · {current.locale === "ar" ? "Arabic site" : "English site"}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      icon={current.read ? <EnvelopeSimple size={16} /> : <EnvelopeSimpleOpen size={16} />}
                      onClick={() => void run(setRead(current.id, !current.read))}
                    >
                      Mark {current.read ? "unread" : "read"}
                    </Button>
                    <Button tone="danger" icon={<Trash size={16} />} onClick={() => setPending(current.id)}>
                      Delete
                    </Button>
                  </div>
                </header>
                <p className="mt-5 whitespace-pre-wrap break-words leading-relaxed">{current.message}</p>
                <div className="mt-6 grid gap-2 sm:flex sm:flex-wrap">
                  <a href={`tel:${current.phone}`} className={linkCls} dir="ltr">
                    <Phone size={16} /> {current.phone}
                  </a>
                  <a href={`https://wa.me/${current.phone.replace(/\D/g, "").replace(/^0/, "966")}`} target="_blank" rel="noreferrer" className={linkCls}>
                    <WhatsappLogo size={16} /> WhatsApp
                  </a>
                  {current.email && (
                    <a href={`mailto:${current.email}`} className={clsx(linkCls, "break-all")}>
                      <EnvelopeSimple size={16} /> {current.email}
                    </a>
                  )}
                </div>
              </article>
            )}
          </div>
        </div>
      )}
      <Confirm
        open={!!pending}
        title="Delete this message?"
        body="The enquiry and its contact details will be removed. This can't be undone."
        confirmLabel="Delete message"
        onConfirm={() => {
          if (!pending) return;
          if (openId === pending) setOpenId(null);
          void run(remove(pending), "Message deleted");
        }}
        onClose={() => setPending(null)}
      />
    </>
  );
}
