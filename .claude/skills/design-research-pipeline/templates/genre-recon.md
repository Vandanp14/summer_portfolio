# Genre Recon Template

Phase 1 artifact. Study the 2–4 best-in-class products in the target genre, tear each down
at heading granularity, then resolve everything into a ranked list of patterns you can
transfer. This is not a link roundup — it must end in a decision-grade "Top N ranked" list.
Fill every slot below; delete none of the headings. Save to `docs/research/<genre>-recon.md`.
The sibling that turns these patterns into a differentiation call is `brand-audit.md`.

Public exemplar sites are named for recognition (NYT Games, Wordle, Puzzmo, LinkedIn Games,
Apple, Linear, Stripe, Vercel, Nike, Duolingo, etc.) — study whichever fit the genre.

---

## Header block

- **Title:** `<Genre> UI Research (<Competitor A>, <Competitor B>, <Competitor C>)`
- **Researched:** date.
- **The stated problem, in one sentence.** Name the specific failure this research must solve
  (e.g. "the hub reads as an e-commerce product grid, not a games destination"). Every ranked
  pattern later is ranked *against this sentence*.
- **Sourcing note.** State which sites you fetched live, which blocked (WAF/403/TLS), and how
  you worked around it (article + case study + product knowledge). Mark anything you could not
  verify against a 2024-26 source as *(unverified)*.

---

## Per-competitor section (repeat once per competitor)

Give each competitor its own `## N. <Product> (<url>, <redesign year if any>)` block, with the
same sub-headings so sections are comparable side by side:

### Hub / page layout
One paragraph: the top-level structure and the *thesis* behind it (quote the designer/PM if a
source exists). What organizing metaphor does the page use?

### Tile / unit anatomy (top to bottom)
Numbered list of the repeating unit's parts, in visual order — the icon/art treatment, the
title face, the tagline formula (quote verbatim taglines), any date/byline, the CTA shape.
Note exact wording where it teaches a pattern.

### State & ritual mechanics
How the UI changes as the user engages — stateful units, streaks, numbered editions,
completion memorialization, daily reset time. This is usually where the transferable gold is.

### Score / social / onboarding
Sharing artifacts, leaderboards (and their scope), first-run tutorial behavior, assists.

**Takeaway (one bold sentence).** End every competitor block with a single distilled sentence
naming *why* this product reads the way it does.

---

## Briefly: adjacent players

One short `## Briefly:` block sweeping 2–4 smaller/adjacent references in a sentence each —
note only the one pattern each contributes. Omit any that surfaced nothing actionable (say so).

---

## Top N transferable patterns — ranked by impact (REQUIRED)

The mandatory ending. Title it literally: `# Top N Transferable Patterns for <project>` and add
the ranking basis: *"Ranked by impact on the stated problem: <that one sentence>."* Then a
numbered list, **most impactful first**, each entry:

- **A bold imperative title** naming the pattern ("Make every tile stateful: Play → Continue → Solved").
- 2–4 sentences: what the exemplar does, *why it works*, and a concrete, implementation-shaped
  suggestion for this project (name files/tokens/data shapes where you can) — so a downstream
  build agent can act on it without re-researching.

Rules for this list:
- **Rank by impact, not by the order you found them.** The #1 item must be the single biggest
  lever on the stated problem.
- **Every item must be transferable** — an abstract observation with no "so do X here" is a
  notes-dump entry and does not belong. Cut it or make it actionable.
- Aim for 8–12 patterns for a rich genre; fewer is fine if each is load-bearing.

---

## Sources

Bulleted list of every source with a live link, in the order they support the report. Include
the live-fetched hubs, the case studies/interviews, and any primary files inspected. A recon
without a Sources block has failed its contract.
