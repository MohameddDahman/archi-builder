"use client";

import { useEffect, useRef, useState } from "react";
import { FloppyDisk, DownloadSimple, UploadSimple, ArrowCounterClockwise } from "@phosphor-icons/react";
import { useSite } from "@/lib/content/store";
import type { Settings, SiteData } from "@/lib/content/types";
import { Bilingual, Button, Card, Confirm, ListEditor, PageTitle, TextInput, useToast, useUnsavedGuard } from "./ui";

export function SettingsEditor() {
  const toast = useToast();
  const settings = useSite((s) => s.settings);
  const setSettings = useSite((s) => s.setSettings);
  const resetAll = useSite((s) => s.resetAll);
  const [d, setD] = useState<Settings>(settings);
  const [dirty, setDirty] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const file = useRef<HTMLInputElement>(null);
  useUnsavedGuard(dirty);

  useEffect(() => {
    if (!dirty) setD(settings);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings]);

  const up = <K extends keyof Settings>(k: K, v: Settings[K]) => {
    setD((cur) => ({ ...cur, [k]: v }));
    setDirty(true);
  };

  const save = () => {
    setSettings({ ...d, phones: d.phones.map((p) => p.trim()).filter(Boolean) });
    setDirty(false);
    toast("Settings saved");
  };

  const exportData = () => {
    const { content, projects, team, settings: st, messages } = useSite.getState();
    const blob = new Blob([JSON.stringify({ content, projects, team, settings: st, messages }, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `archi-builder-content-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const importData = async (f?: File) => {
    if (!f) return;
    try {
      const data = JSON.parse(await f.text()) as Partial<SiteData>;
      if (!data.content || !data.projects || !data.settings) throw new Error("shape");
      useSite.setState({
        content: data.content,
        projects: data.projects,
        team: data.team ?? [],
        settings: data.settings,
        messages: data.messages ?? [],
      });
      toast("Backup restored");
    } catch {
      toast("That file isn't an Archi Builder backup. Export one from this page first.", "warn");
    }
  };

  return (
    <>
      <PageTitle
        title="Settings"
        description="Contact details used across the site, the footer and the portfolio book."
        actions={
          <Button tone="primary" icon={<FloppyDisk size={16} />} disabled={!dirty} onClick={save}>
            Save changes
          </Button>
        }
      />
      <div className="flex flex-col gap-6">
        <Card title="Company">
          <div className="flex flex-col gap-4">
            <Bilingual label="Company name" value={d.companyName} onChange={(v) => up("companyName", v)} />
            <Bilingual label="Address" value={d.address} onChange={(v) => up("address", v)} multiline rows={2} />
            <div className="grid gap-3 md:grid-cols-2">
              <TextInput label="Map search" value={d.mapQuery} onChange={(v) => up("mapQuery", v)} help="What Google Maps should search for." />
              <TextInput label="Coordinates" value={d.coordinates} onChange={(v) => up("coordinates", v)} dir="ltr" />
            </div>
          </div>
        </Card>
        <Card title="Contact">
          <div className="flex flex-col gap-4">
            <ListEditor<string>
              items={d.phones}
              onChange={(v) => up("phones", v)}
              create={() => ""}
              addLabel="Add phone number"
              itemLabel={(p) => p || "New number"}
              render={(p, update) => <TextInput label="Phone" value={p} onChange={update} dir="ltr" inputMode="tel" />}
            />
            <div className="grid gap-3 md:grid-cols-2">
              <TextInput label="Email" value={d.email} onChange={(v) => up("email", v)} dir="ltr" type="email" />
              <TextInput label="WhatsApp number" value={d.whatsapp} onChange={(v) => up("whatsapp", v.replace(/\D/g, ""))} dir="ltr" help="International format without +, e.g. 966561237800" />
              <TextInput label="Instagram link" value={d.instagram} onChange={(v) => up("instagram", v)} dir="ltr" />
              <TextInput label="LinkedIn link" value={d.linkedin} onChange={(v) => up("linkedin", v)} dir="ltr" />
            </div>
          </div>
        </Card>
        <Card title="Backup" description="Download everything as a file, or restore from one.">
          <div className="flex flex-wrap gap-2">
            <Button icon={<DownloadSimple size={16} />} onClick={exportData}>
              Export backup
            </Button>
            <input ref={file} type="file" accept="application/json" className="sr-only" onChange={(e) => importData(e.target.files?.[0])} aria-label="Backup file" />
            <Button icon={<UploadSimple size={16} />} onClick={() => file.current?.click()}>
              Restore from backup
            </Button>
          </div>
        </Card>
        <Card title="Start over" description="Replace every edit with the original portfolio content.">
          <Button tone="danger" icon={<ArrowCounterClockwise size={16} />} onClick={() => setConfirmReset(true)}>
            Restore original content
          </Button>
        </Card>
      </div>
      <Confirm
        open={confirmReset}
        title="Restore the original content?"
        body="All projects, texts, team members, settings and messages go back to the launch version. Export a backup first if you might need your edits."
        confirmLabel="Restore original"
        onConfirm={() => {
          resetAll();
          setDirty(false);
          toast("Original content restored");
        }}
        onClose={() => setConfirmReset(false)}
      />
    </>
  );
}
