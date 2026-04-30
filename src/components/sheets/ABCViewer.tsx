"use client";

import { useEffect, useRef } from "react";

interface Props {
  content: string;
  title?: string;
}

export default function ABCViewer({ content, title }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Dynamically import abcjs to avoid SSR issues
    import("abcjs").then((abcjs) => {
      if (!containerRef.current) return;
      abcjs.renderAbc(containerRef.current, content, {
        responsive: "resize",
        add_classes: true,
        selectionColor: "#4f63f5",
        paddingright: 0,
        paddingleft: 0,
      });
    });
  }, [content]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 md:p-8">
      {title && (
        <h2 className="font-display font-bold text-slate-900 text-xl mb-6">{title}</h2>
      )}
      <div ref={containerRef} className="abcjs-container w-full overflow-x-auto" />
    </div>
  );
}
