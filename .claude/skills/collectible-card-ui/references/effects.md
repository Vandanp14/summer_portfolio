# Card Effect Recipes

The full holo/foil/tilt pipeline as copy-paste blocks. Every recipe reads the custom-property pipeline in step 1 — wire that once, then layer effects on top. Paste each block verbatim and tune only the documented knobs; the hexes, curves, and multipliers are calibrated, not suggestions. For rarity finishes as UX language see rarity-and-vocab.md; for card anatomy see card-anatomy.md.

## 1. The custom-property pipeline

JS never animates a layer. A single pointer handler writes properties onto the card element; every visual layer is pure CSS reading them. Write through a ref inside `requestAnimationFrame` — never React state (a re-render per `pointermove` is guaranteed jank).

```tsx
"use client";
import { useRef } from "react";

export function HoloCard({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const raf = useRef(0);

  const onMove = (e: React.PointerEvent) => {
    const el = ref.current!;
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;   // 0..1
      const py = (e.clientY - r.top) / r.height;
      const cx = px * 100 - 50, cy = py * 100 - 50; // offset from center
      el.style.setProperty("--pointer-x", `${px * 100}%`);
      el.style.setProperty("--pointer-y", `${py * 100}%`);
      el.style.setProperty("--background-x", `${px * 100}%`);
      el.style.setProperty("--background-y", `${py * 100}%`);
      el.style.setProperty("--rotate-x", `${-(cx / 3.5)}deg`); // damp → ~±14deg
      el.style.setProperty("--rotate-y", `${cy / 3.5}deg`);
      el.style.setProperty("--pointer-from-center",
        `${Math.min(1, Math.hypot(cx, cy) / 50)}`);
      el.style.setProperty("--card-opacity", "1");
      el.style.setProperty("will-change", "transform");
      el.dataset.tilting = "true";
    });
  };
  const onLeave = () => {
    const el = ref.current!;
    el.dataset.tilting = "false";                 // re-enables spring transition
    el.style.setProperty("--rotate-x", "0deg");
    el.style.setProperty("--rotate-y", "0deg");
    el.style.setProperty("--card-opacity", "0");
    el.style.removeProperty("will-change");
  };
  return (
    <div ref={ref} onPointerMove={onMove} onPointerLeave={onLeave} className="card-scene">
      <div className="card">{children}</div>
    </div>
  );
}
```

Gate attachment behind `matchMedia("(hover: hover) and (pointer: fine)")` so touch users never strand mid-tilt. The `--rotate-x`/`--rotate-y` names follow the poke-holo convention where the property drives the opposite axis (X-rotation from the horizontal offset).

## 2. 3D tilt with spring-back

The scene owns `perspective`; the card owns the rotation. Spring-back is a transition active only when *not* tracking, so movement is 1:1 while the return eases.

```css
.card-scene { perspective: 600px; }
.card {
  aspect-ratio: 5 / 7;
  transform: rotateY(var(--rotate-x, 0deg)) rotateX(var(--rotate-y, 0deg));
  transition: transform 400ms cubic-bezier(0.03, 0.98, 0.52, 0.99); /* --ease-card-spring */
  transform-style: preserve-3d;
  isolation: isolate;             /* light/dark blend safety — never omit */
  position: relative;
}
.card[data-tilting="true"] { transition: none; }   /* 1:1 while tracking */
```

Rotation stays ±12–14°. `isolation: isolate` contains blend layers to the card. Use on a hero card or the hovered card in a fanned hand — never a whole grid.

## 3. Rainbow shine (holo)

An absolutely-positioned child. The gradient's `background-position` moves *against* the pointer with a multiplier, so foil slides faster than the card tilts — how real refractor light-bands travel. `color-dodge` over card art; tamed by the filter so it reads as refractive, not neon.

```css
.card__shine {
  position: absolute; inset: 0; border-radius: inherit; pointer-events: none;
  background-image: repeating-linear-gradient(110deg,
    hsl(283 49% 60%), hsl(2 74% 59%), hsl(53 67% 53%), hsl(93 56% 52%),
    hsl(176 38% 50%), hsl(228 100% 77%), hsl(283 49% 60%));
  background-size: 400% 400%;
  background-position:
    calc(((50% - var(--background-x)) * 2.6) + 50%)
    calc(((50% - var(--background-y)) * 3.5) + 50%);
  mix-blend-mode: color-dodge;
  filter: brightness(.85) contrast(2.75) saturate(.65);
  opacity: var(--card-opacity);
}
```

This is the one continuously-repainting layer. Reserve it for a single hero/grail card.

## 4. Pointer-tracked glare

A radial hotspot pinned to the cursor. Blended with `overlay` — not `color-dodge` — because overlay both lightens and darkens, so it survives light theme. Over real card photos this layer alone is ~70% of the premium feel; the photo supplies the texture the blend needs.

```css
.card__glare {
  position: absolute; inset: 0; border-radius: inherit; pointer-events: none;
  background-image: radial-gradient(farthest-corner circle
    at var(--pointer-x) var(--pointer-y),
    hsla(0,0%,100%,.8) 10%, hsla(0,0%,100%,.65) 20%, hsla(0,0%,0%,.5) 90%);
  mix-blend-mode: overlay;
  opacity: var(--card-opacity);   /* fade in on hover, out on leave */
}
```

## 5. Glitter texture (no image assets)

Real holo shows the rainbow only through bright speckles. An inline SVG `feTurbulence` noise data-URI replaces `glitter.png` with zero network cost; `color-dodge` gates the rainbow to the bright noise.

```css
.card__glitter {
  position: absolute; inset: 0; border-radius: inherit; pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  mix-blend-mode: color-dodge;
  opacity: calc(var(--pointer-from-center) * .6);
}
```

Stack order over card art: art → `.card__shine` → `.card__glitter` → `.card__glare`. Only the grail tier needs all four; most cards need glare alone.

## 6. Static rarity finishes

Zero runtime cost, identical in light and dark, convincing without animation — the default for tiles and non-hero cards. See rarity-and-vocab.md for which tier gets which finish. Add `background-size: 200%` + a `background-position` shift on hover only if you want cheap animation later.

```css
.foil-refractor {  /* desaturated rainbow over silver, soft-light — chromium, not sticker */
  background:
    linear-gradient(115deg, hsl(0 45% 78%), hsl(60 45% 80%), hsl(120 35% 78%),
                    hsl(180 40% 78%), hsl(240 45% 80%), hsl(300 40% 78%)),
    linear-gradient(180deg, #e8e8e8, #b0b0b0 40%, #f5f5f5 55%, #9a9a9a);
  background-blend-mode: soft-light, normal;
}
.foil-gold {       /* off-center near-white stop IS the foil illusion */
  background: linear-gradient(105deg, #8a6d1f 0%, #d4af37 30%, #f9e7a0 47%, #fffbe6 50%,
                              #f9e7a0 53%, #d4af37 70%, #8a6d1f 100%);
  color: #3b2f0b;  /* dark text on gold, both themes */
}
.foil-relic {      /* matte black + gold rim via double-background border trick */
  background:
    linear-gradient(160deg, #0b0b0b, #1c1c1c 46%, #303030 50%, #1c1c1c 54%, #0b0b0b) padding-box,
    linear-gradient(120deg, #6d5a24, #d4af37, #6d5a24) border-box;
  border: 1px solid transparent; color: #f2f2f2;
}
```

The low saturation on refractor is what separates "chromium refractor" from "unicorn sticker." The near-white stop off-center in gold is the specular highlight. The relic rim uses `padding-box`/`border-box` so no extra element is needed.

## 7. Sheen sweep (hover or one-shot)

A diagonal band that translates corner-to-corner. Transform-only, no JS — safe across a whole grid, unlike animated foil. The hard bright core reads as foil rather than plastic. Oversize with `inset: -50%` so the band clears the corners.

```css
.sheen { position: relative; overflow: hidden; }
.sheen::after {
  content: ""; position: absolute; inset: -50%; pointer-events: none;
  background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,.18) 46%,
    rgba(255,255,255,.42) 50%, rgba(255,255,255,.18) 54%, transparent 60%);
  transform: translateX(-100%);
  transition: transform .6s ease;
}
.sheen:hover::after { transform: translateX(100%); }

@media (prefers-reduced-motion: reduce) {
  .sheen::after { transition: none; transform: translateX(-100%); }
}
```

White works on both themes because it is low-alpha and additive. If it feels hot on light surfaces, drop the `.42` core to `.28` under `:root` and keep `.42` under `.dark`.

The "new pull!" celebration is this same sheen run **once** on a `.reveal` class instead of on hover — add the class when the card flips face-up. Gate it behind reduced-motion so it never fires for vestibular-sensitive users.

```css
@keyframes sheen-sweep { to { transform: translateX(100%); } }
.sheen.reveal::after {
  animation: sheen-sweep .6s ease 1 forwards;   /* one-shot, not looped */
}
@media (prefers-reduced-motion: reduce) {
  .sheen.reveal::after { animation: none; transform: translateX(-100%); }
}
```

## 8. Performance and accessibility gates

- **Compositor-only for anything continuous:** tilt (`transform`), sheen (`transform`), glare (`opacity`) are GPU-cheap. Animated `background-position` (recipe 3) repaints per frame — one hero card only.
- **`will-change: transform`** set on `pointerenter`, removed on leave (the handler in recipe 1 does this). Blanket `will-change` across a grid wastes GPU memory.
- **`isolation: isolate`** on every card using `mix-blend-mode` — the light/dark safety mechanism, and it contains the paint area.
- **Reduced motion** kills tilt, sheen, and celebration keyframes but keeps static foil and glare-at-rest; gate the JS handler itself, not just the CSS.
- **Touch:** gate hover CSS behind `@media (hover: hover) and (pointer: fine)` and the handler behind `matchMedia`. If `motion-craft` is present, defer its 60fps and spring-token rules; this file only covers the card-specific budget.
