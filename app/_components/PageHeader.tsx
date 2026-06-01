export function PageHeader({
  eyebrow,
  title,
  lead,
  aside,
}: {
  eyebrow: string;
  title: string;
  lead?: string;
  aside?: React.ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-6 border-b border-rule pb-6">
      <div className="max-w-2xl">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="font-display mt-3 text-[2rem] uppercase leading-[1.05] tracking-tight">
          {title}
        </h1>
        {lead && (
          <p className="mt-4 text-[15px] leading-relaxed text-fg-muted">
            {lead}
          </p>
        )}
      </div>
      {aside && <div className="shrink-0">{aside}</div>}
    </header>
  );
}

export function SectionHead({
  eyebrow,
  title,
  trailing,
}: {
  eyebrow: string;
  title: string;
  trailing?: React.ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-4 border-b border-rule pb-3">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="font-display mt-1.5 text-xl uppercase leading-none">
          {title}
        </h2>
      </div>
      {trailing && (
        <div className="shrink-0 text-sm text-fg-muted">{trailing}</div>
      )}
    </div>
  );
}
