# Expressive Recipes — Playful / Celebration

Springy, celebratory motion for games, learning, commerce hype, and brand campaigns. These use the overshoot easings and springy configs from tokens.md (`--ease-out-back`, `--ease-in-back`, `bouncy`, `squishy`) — reserved for playful contexts only, never premium/finance/enterprise. Restrained recipes (scroll reveals, count-up, skeleton, spotlight card) live in recipes-core.md. The restraint rules at the bottom decide when expressive motion tips into noise.

## Seamless infinite marquee

A strip that glides forever with no seam; pauses on hover so it can be read.

```html
<div class="marquee"><div class="marquee__track">
  <ul class="marquee__group">…items…</ul>
  <ul class="marquee__group" aria-hidden="true">…same items…</ul>
</div></div>
```

```css
.marquee { overflow: clip; }
.marquee__track { display: flex; width: max-content; will-change: transform;
  animation: scroll-x var(--speed, 30s) linear infinite; }
.marquee__group { display: flex; gap: 3rem; padding-inline: 1.5rem; margin: 0; }
.marquee:hover .marquee__track { animation-play-state: paused; }
@keyframes scroll-x { to { transform: translateX(-50%); } }
@media (prefers-reduced-motion: reduce) {
  .marquee__track { animation: none; }  /* kill motion */
  .marquee { overflow-x: auto; }        /* let the user scroll it manually */
}
```

Duplicate the content once and translate by exactly −50%. Bind `--speed` to content length so px/sec stays constant. The `aria-hidden` copy keeps screen readers from reading items twice. This is an ambient loop (≥4s). Never more than one moving marquee per viewport.

## Squash-stretch button

Buttons that feel physical — they compress on press and spring back. The classic 3D button sinks its top face into a colored base.

```css
.btn3d {
  --shift: 4px;
  border: none; border-radius: 16px; background: var(--accent);
  box-shadow: 0 var(--shift) 0 var(--accent-dark);   /* the "thickness" */
  transform: translateY(0);
  transition: transform var(--t-micro) ease, box-shadow var(--t-micro) ease;
}
.btn3d:active {
  transform: translateY(var(--shift));               /* sink into the base */
  box-shadow: 0 0 0 var(--accent-dark);
}
```

Squishier overshoot on release, via spring:

```tsx
<motion.button whileTap={{ scale: 0.9 }}
  transition={{ type: "spring", stiffness: 400, damping: 15 }}>  {/* spring.bouncy */}
  Continue
</motion.button>
```

Squash-and-stretch keyframe (icon/mascot reacting) conserves volume: squash `scaleX(1.1) scaleY(0.9)`, stretch `scaleX(0.95) scaleY(1.08)`, settle to 1. Use on primary actions in playful/gamified products. Never on enterprise/finance/luxury (reads as a toy), on destructive actions ("Delete" is not delightful), or on high-frequency actions (the bounce tires).

## Three-beat celebration choreography

A meaningful celebration is a **3-beat sequence**, not a single pop. Total ~1000–1400ms: anticipation → burst → settle.

1. **Anticipation (0–120ms):** a tiny wind-up — the hero element dips/compresses (`scale: 0.9`, `--ease-in-back`). Sells the "charge."
2. **Burst (120–500ms):** the payoff fires at once — hero headline pops with `spring.bouncy` (`scale: 0.6 → 1`, overshoot), confetti emits, mascot plays its `celebrate` segment.
3. **Settle & report (500–1400ms):** supporting stats stagger in (`stagger.loose`, `--ease-out-expo`), numbers count up with `--ease-out-quart` over ~800ms, a single accent (badge shine) lands last.

```tsx
async function playCelebration() {
  if (reducedMotion) { showFinalState(); return; }   // static reward, no motion
  await animate(hero, { scale: [1, 0.9] }, { duration: .12, ease: [0.36, 0, 0.66, -0.56] });
  confetti({ particleCount: 120, spread: 70, origin: { y: .6 }, colors: BRAND });
  animate(hero, { scale: 1 }, spring.bouncy);
  animate(".stat", { y: [20, 0], opacity: [0, 1] },
          { delay: stagger(0.09), duration: .45, ease: [0.16, 1, 0.3, 1] });
  countUp(xpNode, xpValue, 800);                      // easeOutQuart
}
```

Fire once per genuine achievement; store a `celebrated` flag; never loop.

## Confetti restraint

Use a canvas library (`canvas-confetti`), never hundreds of DOM nodes.

```js
import confetti from "canvas-confetti";
function celebrate() {
  confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 },
             startVelocity: 45, gravity: 0.9, scalar: 0.9, colors: BRAND });
}
```

Confetti is for genuine, infrequent achievements only — completion, milestone, first purchase, order confirmed. Confetti for "saved settings" cheapens it; anything a user repeats many times per session must not celebrate. One celebration per meaningful accomplishment. Always gate behind reduced-motion — fall back to a static badge + subtle scale.

## Streak flame / mascot motion

An always-on idle plus a one-shot milestone burst. The idle must be subtle; the burst is the drama.

```tsx
// idle flicker (subtle, always-on ambient loop)
<motion.div
  animate={{ scale: [1, 1.06, 0.98, 1.04, 1], rotate: [0, 1.5, -1.5, 0] }}
  transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}>
  <FlameSVG count={streak} />
</motion.div>
```

On a milestone, run a one-shot: flame scales up with `spring.bouncy`, hue rotates (`filter: hue-rotate`), particles emit. Store `lastCelebrated` so it fires once per milestone, not every render. Ship mascots as Lottie with named segments (`idle`, `correct`, `wrong`, `celebrate`) and play a segment on state change; lazy-load below the fold (the player has a cost). Use for habit/streak loops, onboarding, empty/error states. Skip where the mascot obstructs the task or fires too often.

## Data-driven story motion

Parameterize motion by the data so identical code produces personalized energy — the bigger the value, the more intense the animation.

```tsx
const intensity = Math.min(value / max, 1);
<motion.div
  animate={{ scale: [0.8, 1], filter: [`saturate(0.5)`, `saturate(${1 + intensity})`] }}
  transition={{ duration: 0.6 + intensity * 0.6, ease: [0.16, 1, 0.3, 1] }} />
```

Full-screen story slides: `100svh` scroll-snap slides, IG-Stories progress bars, tap-to-advance plus auto-advance. Always allow manual control and pause-on-hold; auto-advance must never fight the reader's pace. Count-ups animate a DOM node via rAF (`easeOutQuart`), never per-frame React state on a big tree. Use for year-in-review, personalized reports, reveal beats. Never over-celebrate a dull or negative number.

## Restraint — when expressive tips into noise

- **One hero motion per view.** Competing animations are noise; make everything else calm.
- **Motion must mean something** — cause/effect, state, or reward. Decorative motion is the first cut.
- **Celebrate rarely.** Frequent celebration is inflation; it stops meaning anything.
- **Speed still applies.** Micro 120–200ms, transitions 200–450ms; only cinematic beats exceed ~600ms.
- **Never block content on animation.** Reveal-on-load text ≤700ms or skippable; never delay interactivity for confetti.
- **Reduced-motion is a real path**, not disable-only: static badge, final number, frozen loop.
- **Consistency reads as quality.** Reuse the tokens; ad-hoc per-component curves feel amateur even when each piece is fine.
