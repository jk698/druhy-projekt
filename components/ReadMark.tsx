"use client";

import { useEffect } from "react";

const KEY = "biz.read";

export function ReadMark({ slug }: { slug: string }) {
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      const arr = raw ? (JSON.parse(raw) as string[]) : [];
      const set = new Set(Array.isArray(arr) ? arr : []);
      if (!set.has(slug)) {
        set.add(slug);
        window.localStorage.setItem(KEY, JSON.stringify(Array.from(set)));
        window.dispatchEvent(new CustomEvent("biz:read-changed"));
      }
    } catch {
      /* ignore */
    }
  }, [slug]);
  return null;
}
