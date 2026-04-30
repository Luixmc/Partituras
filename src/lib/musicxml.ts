export type MusicSection = {
  id?: string;
  name: string;
  chords: string;
  melody: string;
  lyrics?: string;
};

type ParsedNote = {
  step: string;
  alter?: number;
  octave: number;
  duration: number;
  type: "quarter" | "half" | "whole";
};

const FIFTHS_BY_KEY: Record<string, number> = {
  C: 0,
  G: 1,
  D: 2,
  A: 3,
  E: 4,
  B: 5,
  "F#": 6,
  "C#": 7,
  F: -1,
  Bb: -2,
  Eb: -3,
  Ab: -4,
  Db: -5,
  Gb: -6,
  Cb: -7,
  Am: 0,
  Em: 1,
  Bm: 2,
  "F#m": 3,
  "C#m": 4,
  "G#m": 5,
  "D#m": 6,
  "A#m": 7,
  Dm: -1,
  Gm: -2,
  Cm: -3,
  Fm: -4,
  Bbm: -5,
  Ebm: -6,
  Abm: -7,
};

const TYPE_BY_DURATION: Record<number, ParsedNote["type"]> = {
  1: "quarter",
  2: "half",
  4: "whole",
};

function xml(value: string | number | null | undefined) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function normalizeMusicKey(keySignature: string | null | undefined) {
  const key = (keySignature || "C").trim();
  if (!key) return "C";
  return key.replace(/\s+major/i, "").replace(/\s+minor/i, "m");
}

function parseTimeSignature(timeSignature: string | null | undefined) {
  const [beats = "4", beatType = "4"] = (timeSignature || "4/4").split("/");
  return {
    beats: Number.parseInt(beats, 10) || 4,
    beatType: Number.parseInt(beatType, 10) || 4,
  };
}

function parseMeasures(line: string) {
  return line
    .split("|")
    .map((measure) => measure.trim())
    .filter(Boolean);
}

function parseChordLine(line: string) {
  return line
    .split("|")
    .flatMap((bar) => bar.trim().split(/\s+/).filter(Boolean))
    .filter(Boolean);
}

function parseNote(token: string): ParsedNote | null {
  const match = token.trim().match(/^([_=^]?)([A-Ga-g])([',]*)(\d*)$/);
  if (!match) return null;

  const [, accidental, rawStep, octaveMarks, durationText] = match;
  const isLower = rawStep === rawStep.toLowerCase();
  let octave = isLower ? 5 : 4;

  for (const mark of octaveMarks) {
    octave += mark === "'" ? 1 : -1;
  }

  const duration = Number.parseInt(durationText || "1", 10);
  const normalizedDuration = duration === 4 ? 4 : duration === 2 ? 2 : 1;
  const alter = accidental === "^" ? 1 : accidental === "_" ? -1 : undefined;

  return {
    step: rawStep.toUpperCase(),
    alter,
    octave,
    duration: normalizedDuration,
    type: TYPE_BY_DURATION[normalizedDuration],
  };
}

function parseHarmony(chord: string) {
  const cleaned = chord.trim();
  const match = cleaned.match(/^([A-G])(#|b)?(.*)$/);
  if (!match) return null;

  const [, rootStep, accidental, suffix] = match;
  const lowerSuffix = suffix.toLowerCase();
  const kind = lowerSuffix.startsWith("m") && !lowerSuffix.startsWith("maj") ? "minor" : "major";
  const text = cleaned.replace(/\s+/g, "");

  return {
    rootStep,
    alter: accidental === "#" ? 1 : accidental === "b" ? -1 : undefined,
    kind,
    text,
  };
}

function harmonyXml(chord?: string) {
  if (!chord) return "";
  const harmony = parseHarmony(chord);
  if (!harmony) return "";

  return [
    "<harmony>",
    `  <root><root-step>${harmony.rootStep}</root-step>${
      harmony.alter ? `<root-alter>${harmony.alter}</root-alter>` : ""
    }</root>`,
    `  <kind text="${xml(harmony.text)}">${harmony.kind}</kind>`,
    "</harmony>",
  ].join("\n");
}

function noteXml(note: ParsedNote, lyric?: string) {
  const noteLabel = `${note.step}${note.alter === 1 ? "#" : note.alter === -1 ? "b" : ""}`;

  return [
    "<note>",
    "  <pitch>",
    `    <step>${note.step}</step>`,
    note.alter ? `    <alter>${note.alter}</alter>` : "",
    `    <octave>${note.octave}</octave>`,
    "  </pitch>",
    `  <duration>${note.duration}</duration>`,
    `  <type>${note.type}</type>`,
    "  <stem>none</stem>",
    "  <notehead>none</notehead>",
    lyric
      ? `  <lyric><syllabic>single</syllabic><text>${xml(lyric)}</text></lyric>`
      : "",
    `<notations><technical><fingering>${xml(noteLabel)}</fingering></technical></notations>`,
    "</note>",
  ]
    .filter(Boolean)
    .join("\n");
}

function restXml(duration = 1) {
  return [
    "<note>",
    "  <rest/>",
    `  <duration>${duration}</duration>`,
    `  <type>${TYPE_BY_DURATION[duration] ?? "quarter"}</type>`,
    "</note>",
  ].join("\n");
}

function splitLyricLine(line: string | undefined) {
  return (line || "").trim().split(/\s+/).filter(Boolean);
}

function sectionMeasures(section: MusicSection) {
  const chordLines = section.chords.split(/\r?\n/).filter((line) => line.trim());
  const melodyLines = section.melody.split(/\r?\n/).filter((line) => line.trim());
  const lyricLines = (section.lyrics || "").split(/\r?\n/);
  const rowCount = Math.max(chordLines.length, melodyLines.length, lyricLines.length, 1);

  return Array.from({ length: rowCount }).flatMap((_, lineIndex) => {
    const chords = parseChordLine(chordLines[lineIndex] ?? "");
    const melodyMeasures = parseMeasures(melodyLines[lineIndex] ?? "");
    const lyricTokens = splitLyricLine(lyricLines[lineIndex]);
    let lyricIndex = 0;
    const measureCount = Math.max(chords.length, melodyMeasures.length, 1);

    return Array.from({ length: measureCount }).map((__, measureIndex) => {
      const notes = (melodyMeasures[measureIndex] || "")
        .split(/\s+/)
        .map(parseNote)
        .filter((note): note is ParsedNote => Boolean(note));

      return {
        sectionName: measureIndex === 0 ? section.name : null,
        chord: chords[measureIndex],
        notes: notes.length > 0 ? notes : null,
        lyrics: notes.map(() => lyricTokens[lyricIndex++] || ""),
      };
    });
  });
}

export function buildMusicXml({
  title,
  composer,
  keySignature,
  timeSignature,
  sections,
}: {
  title: string;
  composer?: string | null;
  keySignature?: string | null;
  timeSignature?: string | null;
  sections: MusicSection[];
}) {
  const key = normalizeMusicKey(keySignature);
  const time = parseTimeSignature(timeSignature);
  const measures = sections.flatMap(sectionMeasures);

  const measureXml = measures
    .map((measure, index) => {
      const attributes =
        index === 0
          ? [
              "<attributes>",
              "  <divisions>1</divisions>",
              `  <key><fifths>${FIFTHS_BY_KEY[key] ?? 0}</fifths></key>`,
              `  <time><beats>${time.beats}</beats><beat-type>${time.beatType}</beat-type></time>`,
              "  <clef><sign>G</sign><line>2</line></clef>",
              "</attributes>",
            ].join("\n")
          : "";
      const direction = measure.sectionName
        ? `<direction placement="above"><direction-type><words font-weight="bold">${xml(
            measure.sectionName
          )}</words></direction-type></direction>`
        : "";
      const notes = measure.notes
        ? measure.notes
            .map((note, noteIndex) => noteXml(note, measure.lyrics[noteIndex]))
            .join("\n")
        : restXml(4);

      return [
        `<measure number="${index + 1}">`,
        attributes,
        direction,
        harmonyXml(measure.chord),
        notes,
        "</measure>",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 3.1 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">
<score-partwise version="3.1">
  <work><work-title>${xml(title || "Nueva cancion")}</work-title></work>
  <identification>
    <creator type="composer">${xml(composer || "Repertorio iglesia")}</creator>
  </identification>
  <part-list>
    <score-part id="P1">
      <part-name>Voz</part-name>
    </score-part>
  </part-list>
  <part id="P1">
${measureXml}
  </part>
</score-partwise>`;
}
