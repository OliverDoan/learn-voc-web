"use client";

import { useState } from "react";
import { AffixReference } from "@/components/word-formation/affix-reference";
import { AffixGrouping } from "@/components/word-formation/affix-grouping";

type Tab = "reference" | "grouping";

export function WordFormationView() {
  const [tab, setTab] = useState<Tab>("reference");

  return (
    <div className="space-y-6">
      <div className="inline-flex rounded-lg border p-0.5">
        <button
          type="button"
          onClick={() => setTab("reference")}
          className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
            tab === "reference" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
          }`}
        >
          Tra cứu affix
        </button>
        <button
          type="button"
          onClick={() => setTab("grouping")}
          className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
            tab === "grouping" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
          }`}
        >
          Từ vựng theo cấu tạo
        </button>
      </div>

      {tab === "reference" ? <AffixReference /> : <AffixGrouping />}
    </div>
  );
}
