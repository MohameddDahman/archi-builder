"use client";

import { useEffect, useState } from "react";
import { FloppyDisk, Plus } from "@phosphor-icons/react";
import { useSite, newId } from "@/lib/content/store";
import type { TeamMember } from "@/lib/content/types";
import { errorText } from "@/lib/admin/session";
import { Bilingual, Button, Card, Confirm, PageTitle, SaveBar, useToast, useUnsavedGuard } from "./ui";
import { ImageInput } from "./image-input";

export function TeamEditor() {
  const toast = useToast();
  const team = useSite((s) => s.team);
  const saveTeam = useSite((s) => s.saveTeam);
  const deleteMember = useSite((s) => s.deleteMember);
  const [draft, setDraft] = useState<TeamMember[]>(team);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [remove, setRemove] = useState<TeamMember | null>(null);
  useUnsavedGuard(dirty);

  useEffect(() => {
    if (!dirty) setDraft([...team].sort((a, b) => a.order - b.order));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [team]);

  const update = (id: string, m: Partial<TeamMember>) => {
    setDraft((d) => d.map((x) => (x.id === id ? { ...x, ...m } : x)));
    setDirty(true);
  };

  const save = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await saveTeam(draft);
      setDirty(false);
      toast("Team saved");
    } catch (e) {
      toast(errorText(e), "warn");
    } finally {
      setBusy(false);
    }
  };

  const add = () => {
    setDraft((d) => [
      ...d,
      { id: newId("t"), name: { en: "", ar: "" }, role: { en: "", ar: "" }, bio: { en: "", ar: "" }, photo: "", order: d.length + 1 },
    ]);
    setDirty(true);
  };

  return (
    <>
      <PageTitle
        title="Team"
        description="Without a photo, a card shows the person's initials in gold."
        actions={
          <>
            <Button icon={<Plus size={16} />} onClick={add}>
              Add person
            </Button>
            <Button tone="primary" icon={<FloppyDisk size={16} />} disabled={!dirty || busy} onClick={save}>
              {busy ? "Saving…" : "Save changes"}
            </Button>
          </>
        }
      />
      <div className="flex flex-col gap-6">
        {draft.map((m, i) => (
          <Card
            key={m.id}
            title={m.name.en || "New person"}
            description={m.role.en}
            actions={
              <Button tone="danger" onClick={() => setRemove(m)}>
                Remove
              </Button>
            }
          >
            <div className="grid gap-6 xl:grid-cols-[1fr_16rem]">
              <div className="flex flex-col gap-4">
                <Bilingual label="Name" value={m.name} onChange={(v) => update(m.id, { name: v })} />
                <Bilingual label="Role" value={m.role} onChange={(v) => update(m.id, { role: v })} />
                <Bilingual label="Biography" value={m.bio} onChange={(v) => update(m.id, { bio: v })} multiline rows={4} />
              </div>
              <ImageInput label={`Photo (position ${i + 1})`} value={m.photo} onChange={(v) => update(m.id, { photo: v })} />
            </div>
          </Card>
        ))}
      </div>
      <SaveBar show={dirty} busy={busy} onSave={save} />
      <Confirm
        open={!!remove}
        title={`Remove ${remove?.name.en || "this person"}?`}
        body="They will no longer appear on the Studio page or in the book."
        confirmLabel="Remove"
        onConfirm={async () => {
          if (!remove) return;
          try {
            if (team.some((t) => t.id === remove.id)) await deleteMember(remove.id);
            setDraft((d) => d.filter((x) => x.id !== remove.id));
            toast(`Removed ${remove.name.en || "person"}`);
          } catch (e) {
            toast(errorText(e), "warn");
          }
        }}
        onClose={() => setRemove(null)}
      />
    </>
  );
}
