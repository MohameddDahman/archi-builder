import { Fragment } from "react";

/**
 * Renders editor-friendly markup: *words* become the italic ochre accent,
 * and line breaks are kept. The admin uses the same convention.
 */
export function Rich({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <>
      {lines.map((line, li) => (
        <Fragment key={li}>
          {line.split(/(\*[^*]+\*)/g).map((part, i) =>
            part.startsWith("*") && part.endsWith("*") && part.length > 2 ? (
              <em key={i}>{part.slice(1, -1)}</em>
            ) : (
              <Fragment key={i}>{part}</Fragment>
            ),
          )}
          {li < lines.length - 1 && <br />}
        </Fragment>
      ))}
    </>
  );
}

/** Strips the markup for plain-text contexts (aria-labels, metadata). */
export const plain = (text: string) => text.replace(/\*/g, "").replace(/\n/g, " ");
