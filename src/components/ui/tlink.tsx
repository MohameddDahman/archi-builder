"use client";

import Link from "next/link";
import { forwardRef } from "react";
import { useTransitionNav } from "@/components/providers/transition";
import { useLocale } from "@/components/providers/locale";

type Props = Omit<React.ComponentProps<typeof Link>, "href"> & {
  /** Locale-free path, e.g. "/projects". Prefixed automatically. */
  to: string;
};

/** Internal link that plays the rawshan transition before navigating. */
export const TLink = forwardRef<HTMLAnchorElement, Props>(function TLink(
  { to, onClick, children, ...rest },
  ref,
) {
  const { navigate } = useTransitionNav();
  const { to: localize } = useLocale();
  const href = localize(to);
  return (
    <Link
      ref={ref}
      href={href}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        e.preventDefault();
        navigate(href);
      }}
      {...rest}
    >
      {children}
    </Link>
  );
});
