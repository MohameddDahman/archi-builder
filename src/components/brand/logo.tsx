import { MARK_PATHS, WORD_PATHS } from "./paths";

type Props = {
  className?: string;
  /** Colour of the wordmark; the mark stays ochre. */
  tone?: "green" | "light" | "ink" | "gold";
  title?: string;
};

const wordFill = { green: "#055245", light: "#efebe4", ink: "#0a0a0a", gold: "#d9a52a" };

export function Logo({ className, tone = "green", title = "Archi Builder" }: Props) {
  return (
    <svg viewBox="34 676 300 96" className={className} role="img" aria-label={title}>
      {MARK_PATHS.map((p, i) => (
        <path key={`m${i}`} transform={p.t} d={p.d} fill="#e0ab26" />
      ))}
      {WORD_PATHS.map((p, i) => (
        <path
          key={`w${i}`}
          transform={p.t}
          d={p.d}
          fill={wordFill[tone]}
          style={{ transition: "fill .4s" }}
        />
      ))}
    </svg>
  );
}

/** The "1:1" mark on its own. Paths are ordered so they can be drawn in sequence. */
export function Mark({ className, color = "#e0ab26" }: { className?: string; color?: string }) {
  return (
    <svg viewBox="34 676 56 96" className={className} aria-hidden="true">
      {MARK_PATHS.map((p, i) => (
        <path key={i} data-mark-part={i} transform={p.t} d={p.d} fill={color} />
      ))}
    </svg>
  );
}
