/** Lucide glyph from public/icons (fetched by taste-skill's icons.mjs), drawn in the current text colour. */
export function Icon({ name, className = "" }: { name: string; className?: string }) {
  return <span aria-hidden="true" className={`ic ${className}`} style={{ "--i": `url(/icons/ui-${name}.svg)` } as React.CSSProperties} />;
}
