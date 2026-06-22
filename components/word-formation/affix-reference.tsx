import { Badge } from "@/components/ui/badge";
import {
  PREFIXES,
  PREFIX_GROUPS,
  SUFFIXES,
  SUFFIX_GROUPS,
  type Affix,
} from "@/lib/word-formation";

function AffixCard({ affix }: { affix: Affix }) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="mb-1 flex flex-wrap items-center gap-2">
        <span className="font-mono text-base font-bold text-primary">
          {affix.label}
        </span>
        {affix.makes && (
          <Badge variant="secondary" className="text-[11px]">
            → {affix.makes}
          </Badge>
        )}
      </div>
      <p className="mb-2 text-sm text-muted-foreground">{affix.meaning}</p>
      <div className="flex flex-wrap gap-1.5">
        {affix.examples.map((ex) => (
          <span
            key={ex}
            className="rounded-md bg-muted px-2 py-0.5 text-xs text-foreground/80"
          >
            {ex}
          </span>
        ))}
      </div>
    </div>
  );
}

function AffixGroup({ title, affixes }: { title: string; affixes: Affix[] }) {
  if (affixes.length === 0) return null;
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h3>
      <div className="grid gap-3 sm:grid-cols-2">
        {affixes.map((affix) => (
          <AffixCard key={affix.id} affix={affix} />
        ))}
      </div>
    </div>
  );
}

export function AffixReference() {
  return (
    <div className="space-y-10">
      <section className="space-y-6">
        <h2 className="text-xl font-bold">Hậu tố (Suffixes)</h2>
        {SUFFIX_GROUPS.map((group) => (
          <AffixGroup
            key={group}
            title={group}
            affixes={SUFFIXES.filter((a) => a.group === group)}
          />
        ))}
      </section>

      <section className="space-y-6">
        <h2 className="text-xl font-bold">Tiền tố (Prefixes)</h2>
        {PREFIX_GROUPS.map((group) => (
          <AffixGroup
            key={group}
            title={group}
            affixes={PREFIXES.filter((a) => a.group === group)}
          />
        ))}
      </section>
    </div>
  );
}
