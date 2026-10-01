"use client";

import { useEffect, useState } from "react";
import { FloppyDisk, ArrowCounterClockwise } from "@phosphor-icons/react";
import { useSite } from "@/lib/content/store";
import type { SiteContent, Service, SectorBlock, TitledText, Value } from "@/lib/content/types";
import type { L } from "@/lib/i18n";
import { Bilingual, Button, Card, ListEditor, PageTitle, useToast, useUnsavedGuard } from "./ui";
import { ImageInput } from "./image-input";

const sections = [
  ["hero", "Home headline"],
  ["studio", "Studio"],
  ["vision", "Vision & mission"],
  ["values", "Values"],
  ["services", "Services"],
  ["sectors", "Sectors"],
  ["process", "Process"],
  ["statement", "Statement"],
  ["chapters", "Method & quality"],
  ["team", "Team introduction"],
] as const;

const emptyL = (): L => ({ en: "", ar: "" });

export function ContentEditor() {
  const toast = useToast();
  const hydrated = useSite((s) => s.hydrated);
  const content = useSite((s) => s.content);
  const setContent = useSite((s) => s.setContent);
  const [c, setC] = useState<SiteContent>(content);
  const [dirty, setDirty] = useState(false);
  useUnsavedGuard(dirty);

  useEffect(() => {
    if (!dirty) setC(content);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content, hydrated]);

  const up = (fn: (d: SiteContent) => SiteContent) => {
    setC(fn);
    setDirty(true);
  };

  const save = () => {
    setContent(() => c);
    setDirty(false);
    toast("Page content saved");
  };

  return (
    <>
      <PageTitle
        title="Page content"
        description="Wrap words in *asterisks* to set them in gold, for example: Have a drawing? *Let's take it to 1:1.*"
        actions={
          <>
            <Button icon={<ArrowCounterClockwise size={16} />} disabled={!dirty} onClick={() => { setC(content); setDirty(false); }}>
              Discard changes
            </Button>
            <Button tone="primary" icon={<FloppyDisk size={16} />} disabled={!dirty} onClick={save}>
              Save changes
            </Button>
          </>
        }
      />

      <nav aria-label="Sections" className="no-scrollbar sticky top-0 z-10 -mx-5 mb-6 flex gap-1 overflow-x-auto border-b border-white/10 bg-deep/95 px-5 py-2 backdrop-blur md:-mx-10 md:px-10">
        {sections.map(([id, label]) => (
          <a key={id} href={`#${id}`} className="shrink-0 px-3 py-2 text-sm text-gypsum/70 hover:text-ochre">
            {label}
          </a>
        ))}
      </nav>

      <div className="flex flex-col gap-6">
        <Card title="Home headline" description="Each line break starts a new line in the headline.">
          <div id="hero" className="flex scroll-mt-24 flex-col gap-4">
            <Bilingual label="Headline" value={c.hero.title} onChange={(v) => up((d) => ({ ...d, hero: { ...d.hero, title: v } }))} multiline rows={3} />
            <Bilingual label="Introduction" value={c.hero.sub} onChange={(v) => up((d) => ({ ...d, hero: { ...d.hero, sub: v } }))} multiline />
            <Bilingual label="Button" value={c.hero.cta} onChange={(v) => up((d) => ({ ...d, hero: { ...d.hero, cta: v } }))} />
            <ImageInput
              label="Opening image"
              help="The first frame of the home slideshow, before the featured projects. Use a large image (at least 1600 px tall)."
              value={c.hero.image ?? ""}
              onChange={(v) => up((d) => ({ ...d, hero: { ...d.hero, image: v } }))}
            />
          </div>
        </Card>

        <Card title="Studio">
          <div id="studio" className="flex scroll-mt-24 flex-col gap-4">
            <Bilingual label="Statement" value={c.about.title} onChange={(v) => up((d) => ({ ...d, about: { ...d.about, title: v } }))} multiline rows={2} />
            <ListEditor<L>
              items={c.about.body}
              onChange={(v) => up((d) => ({ ...d, about: { ...d.about, body: v } }))}
              create={emptyL}
              addLabel="Add paragraph"
              itemLabel={(_, i) => `Paragraph ${i + 1}`}
              render={(item, update) => <Bilingual label="Text" value={item} onChange={update} multiline rows={4} />}
            />
            <ImageInput label="Studio image" value={c.about.image} onChange={(v) => up((d) => ({ ...d, about: { ...d.about, image: v } }))} />
          </div>
        </Card>

        <Card title="Vision & mission" description="Leave a blank line between paragraphs.">
          <div id="vision" className="flex scroll-mt-24 flex-col gap-6">
            {(["vision", "mission"] as const).map((k) => (
              <div key={k} className="flex flex-col gap-4 border-t border-white/10 pt-4 first:border-0 first:pt-0">
                <p className="text-sm font-semibold capitalize">{k}</p>
                <Bilingual label="Title" value={c[k].title} onChange={(v) => up((d) => ({ ...d, [k]: { ...d[k], title: v } }))} multiline rows={2} />
                <Bilingual label="Text" value={c[k].body} onChange={(v) => up((d) => ({ ...d, [k]: { ...d[k], body: v } }))} multiline rows={10} />
                <ImageInput label="Image" value={c[k].image} onChange={(v) => up((d) => ({ ...d, [k]: { ...d[k], image: v } }))} />
              </div>
            ))}
          </div>
        </Card>

        <Card title="Values">
          <div id="values" className="scroll-mt-24">
            <ListEditor<Value>
              items={c.values}
              onChange={(v) => up((d) => ({ ...d, values: v }))}
              create={() => ({ key: `value-${Date.now()}`, title: emptyL(), body: emptyL() })}
              addLabel="Add value"
              itemLabel={(v) => v.title.en || "New value"}
              render={(v, update) => (
                <>
                  <Bilingual label="Name" value={v.title} onChange={(title) => update({ ...v, title })} />
                  <Bilingual label="Description" value={v.body} onChange={(body) => update({ ...v, body })} multiline />
                </>
              )}
            />
          </div>
        </Card>

        <Card title="Services">
          <div id="services" className="scroll-mt-24">
            <ListEditor<Service>
              items={c.services}
              onChange={(v) => up((d) => ({ ...d, services: v }))}
              create={() => ({ key: `service-${Date.now()}`, title: emptyL(), body: emptyL(), image: "/images/site/execution.jpg" })}
              addLabel="Add service"
              itemLabel={(s) => s.title.en || "New service"}
              render={(s, update) => (
                <>
                  <Bilingual label="Name" value={s.title} onChange={(title) => update({ ...s, title })} />
                  <Bilingual label="Description" value={s.body} onChange={(body) => update({ ...s, body })} multiline />
                  <ImageInput label="Image" value={s.image} onChange={(image) => update({ ...s, image })} />
                </>
              )}
            />
          </div>
        </Card>

        <Card title="Sectors">
          <div id="sectors" className="flex scroll-mt-24 flex-col gap-4">
            <Bilingual label="Title" value={c.sectorsIntro.title} onChange={(v) => up((d) => ({ ...d, sectorsIntro: { ...d.sectorsIntro, title: v } }))} />
            <Bilingual label="Introduction" value={c.sectorsIntro.body} onChange={(v) => up((d) => ({ ...d, sectorsIntro: { ...d.sectorsIntro, body: v } }))} multiline rows={4} />
            <ListEditor<SectorBlock>
              items={c.sectors}
              onChange={(v) => up((d) => ({ ...d, sectors: v }))}
              create={() => ({ key: "commercial", title: emptyL(), items: [], image: "/images/site/sector-commercial.jpg" })}
              addLabel="Add sector"
              itemLabel={(s) => s.title.en || "New sector"}
              render={(s, update) => (
                <>
                  <Bilingual label="Name" value={s.title} onChange={(title) => update({ ...s, title })} />
                  <ListEditor<L>
                    items={s.items}
                    onChange={(items) => update({ ...s, items })}
                    create={emptyL}
                    addLabel="Add type"
                    itemLabel={(it) => it.en || "New type"}
                    render={(it, u) => <Bilingual label="Type" value={it} onChange={u} />}
                  />
                  <ImageInput label="Image" value={s.image} onChange={(image) => update({ ...s, image })} />
                </>
              )}
            />
          </div>
        </Card>

        <Card title="Process" description="Also drives the six stages of the 3D build.">
          <div id="process" className="scroll-mt-24">
            <ListEditor<TitledText>
              items={c.process}
              onChange={(v) => up((d) => ({ ...d, process: v }))}
              create={() => ({ title: emptyL(), body: emptyL() })}
              addLabel="Add stage"
              itemLabel={(s) => s.title.en || "New stage"}
              render={(s, update) => (
                <>
                  <Bilingual label="Stage" value={s.title} onChange={(title) => update({ ...s, title })} />
                  <Bilingual label="Description" value={s.body} onChange={(body) => update({ ...s, body })} multiline />
                </>
              )}
            />
          </div>
        </Card>

        <Card title="Statement">
          <div id="statement" className="scroll-mt-24">
            <ListEditor<L>
              items={c.statement}
              onChange={(v) => up((d) => ({ ...d, statement: v }))}
              create={emptyL}
              addLabel="Add line"
              itemLabel={(l) => l.en || "New line"}
              render={(l, update) => <Bilingual label="Line" value={l} onChange={update} />}
            />
          </div>
        </Card>

        <Card title="Method & quality" description="Leave a blank line between paragraphs. On the services page the method's first paragraph opens the page and the rest follow it.">
          <div id="chapters" className="flex scroll-mt-24 flex-col gap-6">
            {(["methodology", "execution", "quality"] as const).map((k) => (
              <div key={k} className="flex flex-col gap-4 border-t border-white/10 pt-4 first:border-0 first:pt-0">
                <p className="text-sm font-semibold capitalize">{k}</p>
                <Bilingual label="Label" value={c[k].kicker} onChange={(v) => up((d) => ({ ...d, [k]: { ...d[k], kicker: v } }))} />
                <Bilingual label="Title" value={c[k].title} onChange={(v) => up((d) => ({ ...d, [k]: { ...d[k], title: v } }))} multiline rows={2} />
                <Bilingual label="Text" value={c[k].body} onChange={(v) => up((d) => ({ ...d, [k]: { ...d[k], body: v } }))} multiline rows={10} />
                <ImageInput label="Image" value={c[k].image} onChange={(v) => up((d) => ({ ...d, [k]: { ...d[k], image: v } }))} />
              </div>
            ))}
            <ListEditor<L>
              items={c.quality.points}
              onChange={(v) => up((d) => ({ ...d, quality: { ...d.quality, points: v } }))}
              create={emptyL}
              addLabel="Add quality check"
              itemLabel={(l) => l.en || "New check"}
              render={(l, update) => <Bilingual label="Check" value={l} onChange={update} />}
            />
          </div>
        </Card>

        <Card title="Team introduction">
          <div id="team" className="flex scroll-mt-24 flex-col gap-4">
            <Bilingual label="Title" value={c.teamIntro.title} onChange={(v) => up((d) => ({ ...d, teamIntro: { ...d.teamIntro, title: v } }))} multiline rows={2} />
            <Bilingual label="Text" value={c.teamIntro.body} onChange={(v) => up((d) => ({ ...d, teamIntro: { ...d.teamIntro, body: v } }))} multiline rows={5} />
          </div>
        </Card>
      </div>

      {dirty && (
        <div className="sticky bottom-4 z-20 mt-8 flex justify-end">
          <div className="chamfer flex items-center gap-3 bg-deep-3 p-2 ps-4 shadow-2xl ring-1 ring-white/10 [--chamfer:10px]">
            <span className="text-sm text-mist">Unsaved changes</span>
            <Button tone="primary" icon={<FloppyDisk size={16} />} onClick={save}>
              Save changes
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
