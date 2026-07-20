# Game Page Rituals

Everything on a single game's page that converts an arcade toy into a daily game: the
pre-game splash, the first-run how-to, the in-game chrome, the finish moment (stats modal +
share), the win/lose overlay grammar, and coming-soon stubs. Hub-side patterns live in
hub-patterns.md. Read this file when building or auditing one game page.

## Pre-game splash (Wordle's title screen)

The splash converts "loading a webpage" into "sitting down to today's puzzle." Order, top
to bottom:

1. **Game logo / key art** — the game's own mark, not the site masthead.
2. **One-line promise** — the experience, not instructions ("Merge matching cards. Chase
   the grail." not "Use arrow keys…").
3. **State-dependent button** — the dominant pill. First visit / not started → **"Play"**;
   returning mid-run → **"Continue"**; already finished today → skip the splash and land on
   the board with the stats modal open.
4. **Metadata line** — date + edition number + an editor/curator credit equivalent
   ("Today's set: …"). Date + number + a human touch are the three cheapest signals that
   this is a fresh, made-by-a-person daily artifact.

## How-to-play first-run modal

First visit only: after Play, auto-open a **3-panel rules summary** — "Goal / Moves /
Scoring" — each with a small visual example, closed by an X top-right. Set
`<app>:<game>:seen-howto` so it never auto-opens again; keep a persistent **"?" icon in the
game header** to reopen it forever. New players get a scaffolded first run (practice level
or gentle hint), never a failed daily. Hints cost score, never shame (Puzzmo's rule).

## In-game chrome

One minimal header row: wordmark left; a right-side icon cluster — **hint · stats · settings
· help(?)**. No footer, no sidebar competing with the board. Label every icon-only action
(the Wordle critique's one knock: an icon whose function isn't discoverable). Goal statement
goes *above* the board; detailed rules go *below*.

## Win / lose overlay grammar

Overlay the board (not a page navigation), dim it, center the message, buttons below:

- **Win** → "You win!" (themed: "Grail pulled!") with **Keep going** (primary) + **New game**.
  "Keep going" — endless mode past the goal — celebrates the win *without ending the
  session*.
- **Loss** → "Game over!" with **Try again** + **See stats**.

Route **both** endings into the stats modal. Three-beat celebration timing and confetti
gating belong to motion-craft; celebrate genuine achievements only, never every merge.

## The finish moment — post-game stats modal

The single modal that makes the daily game. Exact layout that works (NYT lineage):

1. **Title** — "Statistics" or a themed equivalent ("Today's Result").
2. **Four stat tiles in a row** — `Played · Win %· Current Streak · Max Streak`. For a
   score game, swap the second tile: `Played · Best Tile · Current Streak · Max Streak`.
3. **Distribution bar chart** — one row per outcome bucket, **today's row highlighted in the
   game's accent**, everything else gray. This is the emotional core: your result placed
   inside your own history.
4. **Split footer** — left: **"Next edition in HH:MM:SS"** (the countdown from SKILL.md);
   right: a big primary **Share** button.

**Personal-trend framing only.** With no backend you cannot compute global percentiles —
good, because pervasive competitive comparison demotivates ("bummed to see I'm in the bottom
20%"). Surface deltas against yourself: "New personal best!", "Best run this week", "3 days
in a row", a tiny sparkline of recent scores.

## localStorage stats schema (copy-paste)

One stats key per game plus a resume-state key. Streak uses local-day math (SKILL.md rule).

```ts
// key: `<app>:<game>:stats`
type GameStats = {
  gamesPlayed: number;
  gamesWon: number;                 // omit for pure score games; derive Win% = won/played
  bestScore: number;
  bestTile: number;                 // score games: highest tier index ever reached
  currentStreak: number;            // consecutive local days played; missed day OR loss -> 0
  maxStreak: number;
  distribution: Record<number, number>; // outcome bucket -> count (e.g. {1:0,2:3,...,6:1})
  lastPlayedISO: string;            // "2026-07-08"
  lastWonISO: string;
};

// key: `<app>:<game>:state`  — so a refresh resumes mid-game
type GameState = { board: number[][]; score: number; dayId: string };

const daysBetween = (a: string, b: string) =>
  Math.round((new Date(b + "T00:00").getTime() - new Date(a + "T00:00").getTime()) / 86_400_000);

function recordFinish(s: GameStats, r: { won: boolean; score: number; bucket: number; today: string }): GameStats {
  const missed = s.lastPlayedISO && daysBetween(s.lastPlayedISO, r.today) > 1;
  const currentStreak = !r.won || missed ? (r.won ? 1 : 0) : s.currentStreak + 1;
  return {
    ...s,
    gamesPlayed: s.gamesPlayed + 1,
    gamesWon: s.gamesWon + (r.won ? 1 : 0),
    bestScore: Math.max(s.bestScore, r.score),
    currentStreak,
    maxStreak: Math.max(s.maxStreak, currentStreak),
    distribution: { ...s.distribution, [r.bucket]: (s.distribution[r.bucket] ?? 0) + 1 },
    lastPlayedISO: r.today,
    lastWonISO: r.won ? r.today : s.lastWonISO,
  };
}
```

## Share artifact (the growth loop)

Spoiler-free, edition-stamped, and carrying a "Play this" link inside it (~40% of players
arrive via a shared link — the artifact is an acquisition surface). Two formulas:

- **Emoji-grid** (Wordle lineage, for grid-story games): header `Name + number + score/max`,
  then a grid showing the *shape of the struggle* without revealing answers. Adaptations:
  one row per guess with difficulty-colored squares; a `💡` per hint used (makes hint-free
  the flex and hint-taking socially safe).
- **Score/time** (LinkedIn Queens formula, for arcade/score games with no grid-story):
  `Name #N | result + quality tag`, one emoji trace line, a link. The trace is a spoiler-free
  ladder — one square per tier reached, capped at your best.

```txt
Daily Cards · No. 128
Best pull: Autograph · Score 24,816
⬜🟦🟨🟥🟩🟪  ·  🔥 5-day streak
example.games/play
```

Delivery: `navigator.share()` on mobile; `navigator.clipboard.writeText()` + a "Copied
results" toast on desktop. Never leak the day's answer in the trace.

## Coming-soon stubs that build anticipation

Give a stub the real game's splash skeleton **minus Play**: finished-looking key art (never
a gray box) on the game's hue field, the name, a one-line hook in the same tagline register,
a **concrete release window** ("Coming August 2026" beats "Coming soon" — concrete dates
hold momentum, per Steam data), and one low-friction **"Notify me"** that flips to **"You're
on the list ✓"** and stores `<app>:notify:<game>` (collect email later). Optionally add a
15-second looping mechanic tease or a "one free move" micro-demo — anything that moves makes
the stub feel alive (Netflix teases with trailers + a "Remind Me" bell). Signal three
things: similarity ("you'll like this if you like X"), one unique hook, and quality. Close
the loop — the live game's stats modal can cross-promote the stub, and the stub links back
to today's playable game.
