/**
 * Sample songwriting content for demo accounts and the local seed.
 * Everything here is fictional and written for Songbook. It is plain data:
 * no ids, no dates. `seedDemoContent` turns it into rows for a given user.
 */

import type { SectionType, SongStatus } from "@/lib/domain/types";

export interface DemoSection {
  type: SectionType;
  customLabel?: string;
  content: string;
}

export interface DemoVersion {
  name: string;
  /** Days before "now" the version was saved. */
  daysAgo: number;
  title?: string;
  sections: DemoSection[];
}

export interface DemoSong {
  title: string;
  status: SongStatus;
  key: string | null;
  bpm: number | null;
  timeSignature: string | null;
  capo: number | null;
  tuning: string | null;
  notes: string;
  isFavorite: boolean;
  /** Hours before "now" the song was last edited. */
  editedHoursAgo: number;
  sections: DemoSection[];
  versions?: DemoVersion[];
}

export interface DemoIdea {
  title: string | null;
  content: string;
  /** Title of the song to attach to, if any. */
  song?: string;
  hoursAgo: number;
}

export const DEMO_SONGS: DemoSong[] = [
  {
    title: "Porchlight",
    status: "IN_PROGRESS",
    key: "G major",
    bpm: 92,
    timeSignature: "4/4",
    capo: 2,
    tuning: "Standard",
    notes:
      "Keep the verses sparse: just the acoustic and a brushed snare. Let the chorus open up with the harmony on the second pass.\n\nStill unsure about the bridge lyric. Maybe it should be about leaving rather than staying.",
    isFavorite: true,
    editedHoursAgo: 2,
    sections: [
      {
        type: "VERSE",
        content:
          "Left the porchlight on again\nlike you might come walking through the rain\nthe kettle's gone cold twice tonight\nand I keep setting out two plates",
      },
      { type: "PRE_CHORUS", content: "I know the road is long\nand the signal's never strong" },
      {
        type: "CHORUS",
        content:
          "But I'll leave the light on\nfor whatever comes home\nmoths or memory or you\nI'll leave the light on",
      },
      {
        type: "VERSE",
        content:
          "Your coat's still hanging by the door\nI don't move it, don't know what it's for\nmaybe just to keep the shape of you\nin a house that's learning to be empty",
      },
      {
        type: "CHORUS",
        content:
          "So I'll leave the light on\nfor whatever comes home\nmoths or memory or you\nI'll leave the light on",
      },
      {
        type: "BRIDGE",
        content: "(unfinished)\n\nsomething about the car keys / the gravel / the sound of leaving",
      },
    ],
    versions: [
      {
        name: "First full draft",
        daysAgo: 12,
        title: "Porch Light",
        sections: [
          {
            type: "VERSE",
            content:
              "Left the porchlight on again\nin case you come in from the rain\nthe kettle's gone cold twice tonight\nI keep setting out two plates",
          },
          { type: "CHORUS", content: "I'll leave the light on\nfor whatever comes home" },
        ],
      },
      {
        name: "Before rewriting verse two",
        daysAgo: 5,
        sections: [
          {
            type: "VERSE",
            content:
              "Left the porchlight on again\nlike you might come walking through the rain\nthe kettle's gone cold twice tonight\nand I keep setting out two plates",
          },
          {
            type: "CHORUS",
            content:
              "But I'll leave the light on\nfor whatever comes home\nmoths or memory or you\nI'll leave the light on",
          },
          { type: "VERSE", content: "Your coat is hanging by the door\nI don't know what I keep it for" },
        ],
      },
    ],
  },
  {
    title: "Salt and Static",
    status: "IDEA",
    key: "E minor",
    bpm: null,
    timeSignature: null,
    capo: null,
    tuning: null,
    notes: "",
    isFavorite: false,
    editedHoursAgo: 26,
    sections: [
      {
        type: "VERSE",
        content:
          "Radio's just salt and static\nsomewhere past the county line\nyou said the ocean sounds like that\nif you listen from behind",
      },
    ],
  },
  {
    title: "Slow Dancer",
    status: "COMPLETE",
    key: "D major",
    bpm: 76,
    timeSignature: "6/8",
    capo: 0,
    tuning: "Standard",
    notes: "Recorded a rough demo on the phone. Final arrangement: piano, upright bass, brushes.",
    isFavorite: true,
    editedHoursAgo: 96,
    sections: [
      { type: "INTRO", content: "(piano, four bars, let the last chord ring)" },
      {
        type: "VERSE",
        content:
          "We were never good at fast\nnever caught the beat the first time through\nbut give us something slow enough\nand I could find my way to you",
      },
      {
        type: "CHORUS",
        content:
          "Slow dancer, hold the floor\nthe band can play one more\nnobody's counting, nobody's keeping score\nslow dancer, just a little more",
      },
      {
        type: "VERSE",
        content:
          "The lights came up an hour ago\nthe bartender's wiping down the chairs\nbut you've got your head against my chest\nlike neither one of us is there",
      },
      {
        type: "CHORUS",
        content:
          "Slow dancer, hold the floor\nthe band can play one more\nnobody's counting, nobody's keeping score\nslow dancer, just a little more",
      },
      { type: "OUTRO", content: "(repeat last line, fade on the piano)" },
    ],
    versions: [{ name: "Final", daysAgo: 4, sections: [] }],
  },
  {
    title: "Overpass",
    status: "IN_PROGRESS",
    key: "A minor",
    bpm: 128,
    timeSignature: "4/4",
    capo: null,
    tuning: "Drop D",
    notes: "Riff-driven. Think about a half-time feel in the bridge.",
    isFavorite: false,
    editedHoursAgo: 72,
    sections: [
      { type: "INSTRUMENTAL", customLabel: "Riff", content: "(main riff x4, drums enter on the third pass)" },
      {
        type: "VERSE",
        content: "Headlights stitch the overpass\nred to white to red\nevery car a sentence\nI never got to say",
      },
      { type: "CHORUS", content: "Go on, go on\nnobody stops up here\ngo on, go on" },
    ],
  },
  {
    title: "Paper Boats",
    status: "IDEA",
    key: null,
    bpm: null,
    timeSignature: "3/4",
    capo: null,
    tuning: null,
    notes: "Waltz. Maybe a lullaby.",
    isFavorite: false,
    editedHoursAgo: 6,
    sections: [
      { type: "CHORUS", content: "Paper boats on the kitchen floor\nsailing nowhere, asking for more" },
    ],
  },
  {
    title: "The Long Way Home",
    status: "COMPLETE",
    key: "C major",
    bpm: 104,
    timeSignature: "4/4",
    capo: 3,
    tuning: "Standard",
    notes: "",
    isFavorite: false,
    editedHoursAgo: 40 * 24,
    sections: [
      {
        type: "VERSE",
        content:
          "Took the long way home tonight\npast the water tower and the field\nwhere we used to lie and name the stars\nwrong, on purpose, every time",
      },
      {
        type: "CHORUS",
        content:
          "And it's the long way, the long way home\nI don't mind the miles, I don't mind alone\nit's the long way, the long way home",
      },
    ],
  },
  {
    title: "Winter Coat",
    status: "ARCHIVED",
    key: "F major",
    bpm: 88,
    timeSignature: "4/4",
    capo: null,
    tuning: "Standard",
    notes: "Shelved. The chorus never landed.",
    isFavorite: false,
    editedHoursAgo: 150 * 24,
    sections: [
      { type: "VERSE", content: "Found a ticket in my winter coat\nfor a show we never went to" },
    ],
  },
];

export const DEMO_IDEAS: DemoIdea[] = [
  { title: null, content: "\"we were a weather system, not a storm\"", hoursAgo: 5 },
  { title: "Title idea", content: "Glass Hours", hoursAgo: 24 },
  {
    title: "Progression for the bridge",
    content: "Am – F – C – G, then hang on the G for two bars before the last chorus. Try it half-time.",
    song: "Porchlight",
    hoursAgo: 30,
  },
  {
    title: null,
    content: "A song written from the point of view of the last streetlight on a road nobody drives anymore.",
    hoursAgo: 96,
  },
  {
    title: "Production note",
    content: "Double the vocal only on the final chorus. Keep everything else single and close.",
    song: "Slow Dancer",
    hoursAgo: 8 * 24,
  },
  {
    title: null,
    content: "The way the dog waits by the window at 5:40 every day. Something about routine as devotion.",
    hoursAgo: 12 * 24,
  },
];
