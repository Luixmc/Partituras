"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  content: string;
  title?: string;
};

export default function MusicXmlViewer({ content, title }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const osmdRef = useRef<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function renderScore() {
      if (!containerRef.current || !content.trim()) return;

      setError(null);
      containerRef.current.innerHTML = "";

      try {
        const { OpenSheetMusicDisplay } = await import("opensheetmusicdisplay");
        if (cancelled || !containerRef.current) return;

        const osmd = new OpenSheetMusicDisplay(containerRef.current, {
          autoResize: true,
          drawTitle: false,
          drawComposer: false,
          drawingParameters: "compacttight",
          renderSingleHorizontalStaffline: false,
        });

        osmdRef.current = osmd;
        await osmd.load(content);
        if (!cancelled) {
          osmd.render();
          customizeRenderedScore(containerRef.current, content);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "No se pudo renderizar el MusicXML"
          );
        }
      }
    }

    renderScore();

    return () => {
      cancelled = true;
    };
  }, [content]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 md:p-8">
      {title && (
        <h2 className="font-display mb-6 text-xl font-bold text-slate-900">
          {title}
        </h2>
      )}
      {error && (
        <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      )}
      <div
        ref={containerRef}
        className="musicxml-container min-h-[240px] w-full overflow-x-auto"
      />
    </div>
  );
}

type StaffGroup = {
  top: number;
  bottom: number;
  spacing: number;
};

type ParsedPitch = {
  step: string;
  alter: number | undefined;
  octave: number;
  label: string;
};

type MeasureLabels = {
  labels: string[];
};

function customizeRenderedScore(container: HTMLDivElement, musicXml: string) {
  const svg = container.querySelector("svg");
  if (!svg) return;

  const staffLines = findStaffLines(svg);
  const staffGroups = groupStaffLines(staffLines.map((line) => line.y));
  removeRenderedNoteLabels(svg);
  drawCenteredNoteLabels(svg, staffGroups, parseLabelledMeasures(musicXml));
  staffLines.forEach((line) => line.element.setAttribute("opacity", "0.22"));
}

function findStaffLines(svg: SVGSVGElement) {
  const lines: Array<{ element: SVGElement; y: number }> = [];
  const elements = Array.from(svg.querySelectorAll("line,path")) as SVGElement[];

  elements.forEach((element) => {
    const box = getSvgBox(element);
    if (!box) return;

    if (box.width > 120 && box.height <= 1.5) {
      lines.push({ element, y: box.y + box.height / 2 });
    }
  });

  return lines;
}

function getSvgBox(element: SVGElement) {
  try {
    const box = (element as SVGGraphicsElement).getBBox();
    return {
      x: box.x,
      y: box.y,
      width: box.width,
      height: box.height,
    };
  } catch {
    return null;
  }
}

function groupStaffLines(yValues: number[]): StaffGroup[] {
  const uniqueY = Array.from(
    new Set(yValues.map((value) => Math.round(value * 10) / 10))
  ).sort((a, b) => a - b);
  const groups: StaffGroup[] = [];

  for (let index = 0; index <= uniqueY.length - 5; index += 5) {
    const group = uniqueY.slice(index, index + 5);
    const spacing = (group[4] - group[0]) / 4;
    if (spacing > 3 && spacing < 25) {
      groups.push({
        top: group[0],
        bottom: group[4],
        spacing,
      });
    }
  }

  return groups;
}

function parseLabelledMeasures(musicXml: string): MeasureLabels[] {
  const doc = new DOMParser().parseFromString(musicXml, "application/xml");
  return Array.from(doc.querySelectorAll("measure"))
    .map((measure) => {
      const labels = Array.from(measure.querySelectorAll("note"))
        .map((note) => {
          const step = note.querySelector("pitch > step")?.textContent?.trim();
          if (!step) return null;

          const alterText = note.querySelector("pitch > alter")?.textContent?.trim();
          const alter = alterText ? Number.parseInt(alterText, 10) : undefined;

          return (
            note.querySelector("notations technical fingering")?.textContent?.trim() ||
            `${step}${alter === 1 ? "#" : alter === -1 ? "b" : ""}`
          );
        })
        .filter((label): label is string => Boolean(label));

      return { labels };
    })
    .filter((measure) => measure.labels.length > 0);
}

function removeRenderedNoteLabels(svg: SVGSVGElement) {
  const texts = Array.from(svg.querySelectorAll("text")) as SVGTextElement[];

  texts.forEach((text) => {
    const label = text.textContent?.trim() || "";
    if (!/^[A-G](#|b)?$/.test(label)) return;
    text.remove();
  });
}

function drawCenteredNoteLabels(
  svg: SVGSVGElement,
  staffGroups: StaffGroup[],
  measures: MeasureLabels[]
) {
  const cells = findMeasureCells(svg, staffGroups);
  const count = Math.min(cells.length, measures.length);

  for (let index = 0; index < count; index += 1) {
    const cell = cells[index];
    const centerY = cell.staff.top + (cell.staff.bottom - cell.staff.top) / 2;
    const labels = measures[index].labels;

    labels.forEach((labelText, labelIndex) => {
      const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
      label.textContent = labelText;
      label.setAttribute(
        "x",
        String(cell.left + ((labelIndex + 1) * cell.width) / (labels.length + 1))
      );
      label.setAttribute("y", String(centerY));
      label.setAttribute("text-anchor", "middle");
      label.setAttribute("dominant-baseline", "middle");
      label.setAttribute("font-size", "15");
      label.setAttribute("font-weight", "800");
      label.setAttribute("fill", "#0f172a");
      label.setAttribute("paint-order", "stroke");
      label.setAttribute("stroke", "white");
      label.setAttribute("stroke-width", "3");
      svg.appendChild(label);
    });
  }
}

function findMeasureCells(svg: SVGSVGElement, staffGroups: StaffGroup[]) {
  const elements = Array.from(svg.querySelectorAll("line,path,rect")) as SVGElement[];
  const cells: Array<{ left: number; width: number; staff: StaffGroup }> = [];

  staffGroups.forEach((staff) => {
    const staffHeight = staff.bottom - staff.top;
    const barXs = elements
      .map((element) => {
        const box = getSvgBox(element);
        if (!box) return null;

        const overlapsStaff = box.y <= staff.bottom + 4 && box.y + box.height >= staff.top - 4;
        const isVertical = box.width <= 3 && box.height >= staffHeight * 0.65;

        return overlapsStaff && isVertical ? box.x + box.width / 2 : null;
      })
      .filter((x): x is number => x !== null)
      .sort((a, b) => a - b)
      .filter((x, index, all) => index === 0 || Math.abs(x - all[index - 1]) > 8);

    for (let index = 0; index < barXs.length - 1; index += 1) {
      const left = barXs[index];
      const right = barXs[index + 1];
      if (right - left > 20) {
        cells.push({ left, width: right - left, staff });
      }
    }
  });

  return cells;
}
