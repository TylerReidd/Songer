/**
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │  PHASE 1 SAMPLE DATA                                                 │
 * │  Everything in this file is fictional, in-memory sample content so   │
 * │  the UI can be built and reviewed before the database exists.        │
 * │  Phase 2 replaces `src/lib/data/index.ts` with Prisma-backed queries │
 * │  and this file becomes the database seed for demo accounts.          │
 * └─────────────────────────────────────────────────────────────────────┘
 */

import type {
  Idea,
  SectionType,
  Song,
  SongSection,
  SongVersion,
  SongWithSections,
  UserProfile,
} from "@/lib/domain/types";

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const NOW = Date.now();
const ago = (ms: number) => new Date(NOW - ms);

export const MOCK_USER: UserProfile = {
  id: "user_sample",
  email: "you@example.com",
  name: "Sam Rivera",
  lyricFont: "serif",
  createdAt: ago(120 * DAY),
};

interface SectionSeed {
  type: SectionType;
  customLabel?: string;
  content: string;
}

interface SongSeed extends Omit<Song, "ownerId" | "revision"> {
  sections: SectionSeed[];
}

function buildSong(seed: SongSeed): SongWithSections {
  const { sections, ...song } = seed;
  return {
    ...song,
    ownerId: MOCK_USER.id,
    revision: 1,
    sections: sections.map<SongSection>((section, index) => ({
      id: `${song.id}_sec_${index + 1}`,
      songId: song.id,
      type: section.type,
      customLabel: section.customLabel ?? null,
      content: section.content,
      position: index,
      createdAt: song.createdAt,
      updatedAt: song.updatedAt,
    })),
  };
}

export const MOCK_SONGS: SongWithSections[] = [
  buildSong({
    id: "song_porchlight",
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
    createdAt: ago(18 * DAY),
    updatedAt: ago(2 * HOUR),
    sections: [
      {
        type: "VERSE",
        content:
          "Left the porchlight on again\nlike you might come walking through the rain\nthe kettle's gone cold twice tonight\nand I keep setting out two plates",
      },
      {
        type: "PRE_CHORUS",
        content: "I know the road is long\nand the signal's never strong",
      },
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
  }),
  buildSong({
    id: "song_salt_and_static",
    title: "Salt and Static",
    status: "IDEA",
    key: "E minor",
    bpm: null,
    timeSignature: null,
    capo: null,
    tuning: null,
    notes: "",
    isFavorite: false,
    createdAt: ago(3 * DAY),
    updatedAt: ago(26 * HOUR),
    sections: [
      {
        type: "VERSE",
        content:
          "Radio's just salt and static\nsomewhere past the county line\nyou said the ocean sounds like that\nif you listen from behind",
      },
    ],
  }),
  buildSong({
    id: "song_slow_dancer",
    title: "Slow Dancer",
    status: "COMPLETE",
    key: "D major",
    bpm: 76,
    timeSignature: "6/8",
    capo: 0,
    tuning: "Standard",
    notes: "Recorded a rough demo on the phone. Final arrangement: piano, upright bass, brushes.",
    isFavorite: true,
    createdAt: ago(60 * DAY),
    updatedAt: ago(4 * DAY),
    sections: [
      {
        type: "INTRO",
        content: "(piano, four bars, let the last chord ring)",
      },
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
      {
        type: "OUTRO",
        content: "(repeat last line, fade on the piano)",
      },
    ],
  }),
  buildSong({
    id: "song_overpass",
    title: "Overpass",
    status: "IN_PROGRESS",
    key: "A minor",
    bpm: 128,
    timeSignature: "4/4",
    capo: null,
    tuning: "Drop D",
    notes: "Riff-driven. Think about a half-time feel in the bridge.",
    isFavorite: false,
    createdAt: ago(9 * DAY),
    updatedAt: ago(3 * DAY),
    sections: [
      {
        type: "INSTRUMENTAL",
        customLabel: "Riff",
        content: "(main riff x4, drums enter on the third pass)",
      },
      {
        type: "VERSE",
        content:
          "Headlights stitch the overpass\nred to white to red\nevery car a sentence\nI never got to say",
      },
      {
        type: "CHORUS",
        content: "Go on, go on\nnobody stops up here\ngo on, go on",
      },
    ],
  }),
  buildSong({
    id: "song_paper_boats",
    title: "Paper Boats",
    status: "IDEA",
    key: null,
    bpm: null,
    timeSignature: "3/4",
    capo: null,
    tuning: null,
    notes: "Waltz. Maybe a lullaby.",
    isFavorite: false,
    createdAt: ago(1 * DAY),
    updatedAt: ago(6 * HOUR),
    sections: [
      {
        type: "CHORUS",
        content: "Paper boats on the kitchen floor\nsailing nowhere, asking for more",
      },
    ],
  }),
  buildSong({
    id: "song_the_long_way",
    title: "The Long Way Home",
    status: "COMPLETE",
    key: "C major",
    bpm: 104,
    timeSignature: "4/4",
    capo: 3,
    tuning: "Standard",
    notes: "",
    isFavorite: false,
    createdAt: ago(95 * DAY),
    updatedAt: ago(40 * DAY),
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
  }),
  buildSong({
    id: "song_winter_coat",
    title: "Winter Coat",
    status: "ARCHIVED",
    key: "F major",
    bpm: 88,
    timeSignature: "4/4",
    capo: null,
    tuning: "Standard",
    notes: "Shelved. The chorus never landed.",
    isFavorite: false,
    createdAt: ago(200 * DAY),
    updatedAt: ago(150 * DAY),
    sections: [
      {
        type: "VERSE",
        content: "Found a ticket in my winter coat\nfor a show we never went to",
      },
    ],
  }),
  buildSong({
    id: "song_untitled",
    title: "Untitled",
    status: "IDEA",
    key: null,
    bpm: null,
    timeSignature: null,
    capo: null,
    tuning: null,
    notes: "",
    isFavorite: false,
    createdAt: ago(10 * 60 * 1000),
    updatedAt: ago(10 * 60 * 1000),
    sections: [],
  }),
];

export const MOCK_VERSIONS: SongVersion[] = [
  {
    id: "ver_porchlight_1",
    songId: "song_porchlight",
    name: "First full draft",
    kind: "MANUAL",
    createdAt: ago(12 * DAY),
    snapshot: {
      schemaVersion: 1,
      title: "Porch Light",
      status: "IN_PROGRESS",
      key: "G major",
      bpm: 96,
      timeSignature: "4/4",
      capo: 2,
      tuning: "Standard",
      notes: "",
      sections: [
        {
          type: "VERSE",
          customLabel: null,
          position: 0,
          content:
            "Left the porchlight on again\nin case you come in from the rain\nthe kettle's gone cold twice tonight\nI keep setting out two plates",
        },
        {
          type: "CHORUS",
          customLabel: null,
          position: 1,
          content: "I'll leave the light on\nfor whatever comes home",
        },
      ],
    },
  },
  {
    id: "ver_porchlight_2",
    songId: "song_porchlight",
    name: "Before rewriting verse two",
    kind: "MANUAL",
    createdAt: ago(5 * DAY),
    snapshot: {
      schemaVersion: 1,
      title: "Porchlight",
      status: "IN_PROGRESS",
      key: "G major",
      bpm: 92,
      timeSignature: "4/4",
      capo: 2,
      tuning: "Standard",
      notes: "Keep the verses sparse.",
      sections: [
        {
          type: "VERSE",
          customLabel: null,
          position: 0,
          content:
            "Left the porchlight on again\nlike you might come walking through the rain\nthe kettle's gone cold twice tonight\nand I keep setting out two plates",
        },
        {
          type: "CHORUS",
          customLabel: null,
          position: 1,
          content:
            "But I'll leave the light on\nfor whatever comes home\nmoths or memory or you\nI'll leave the light on",
        },
        {
          type: "VERSE",
          customLabel: null,
          position: 2,
          content: "Your coat is hanging by the door\nI don't know what I keep it for",
        },
      ],
    },
  },
  {
    id: "ver_porchlight_3",
    songId: "song_porchlight",
    name: "Recovery before restore",
    kind: "RECOVERY",
    createdAt: ago(5 * DAY + 2 * HOUR),
    snapshot: {
      schemaVersion: 1,
      title: "Porchlight",
      status: "IN_PROGRESS",
      key: "G major",
      bpm: 92,
      timeSignature: "4/4",
      capo: 2,
      tuning: "Standard",
      notes: "",
      sections: [],
    },
  },
  {
    id: "ver_slow_dancer_1",
    songId: "song_slow_dancer",
    name: "Final",
    kind: "MANUAL",
    createdAt: ago(4 * DAY),
    snapshot: {
      schemaVersion: 1,
      title: "Slow Dancer",
      status: "COMPLETE",
      key: "D major",
      bpm: 76,
      timeSignature: "6/8",
      capo: 0,
      tuning: "Standard",
      notes: "Recorded a rough demo on the phone.",
      sections: [],
    },
  },
];

export const MOCK_IDEAS: Idea[] = [
  {
    id: "idea_1",
    ownerId: MOCK_USER.id,
    title: null,
    content: "\"we were a weather system, not a storm\"",
    songId: null,
    createdAt: ago(5 * HOUR),
    updatedAt: ago(5 * HOUR),
  },
  {
    id: "idea_2",
    ownerId: MOCK_USER.id,
    title: "Title idea",
    content: "Glass Hours",
    songId: null,
    createdAt: ago(1 * DAY),
    updatedAt: ago(1 * DAY),
  },
  {
    id: "idea_3",
    ownerId: MOCK_USER.id,
    title: "Progression for the bridge",
    content: "Am – F – C – G, then hang on the G for two bars before the last chorus. Try it half-time.",
    songId: "song_porchlight",
    createdAt: ago(2 * DAY),
    updatedAt: ago(30 * HOUR),
  },
  {
    id: "idea_4",
    ownerId: MOCK_USER.id,
    title: null,
    content:
      "A song written from the point of view of the last streetlight on a road nobody drives anymore.",
    songId: null,
    createdAt: ago(4 * DAY),
    updatedAt: ago(4 * DAY),
  },
  {
    id: "idea_5",
    ownerId: MOCK_USER.id,
    title: "Production note",
    content: "Double the vocal only on the final chorus. Keep everything else single and close.",
    songId: "song_slow_dancer",
    createdAt: ago(8 * DAY),
    updatedAt: ago(8 * DAY),
  },
  {
    id: "idea_6",
    ownerId: MOCK_USER.id,
    title: null,
    content: "The way the dog waits by the window at 5:40 every day. Something about routine as devotion.",
    songId: null,
    createdAt: ago(12 * DAY),
    updatedAt: ago(12 * DAY),
  },
];
