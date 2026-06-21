# Block Design System

A visual language for drag-and-drop RL environment blocks, inspired by Scratch and physical building blocks. The goal is for blocks to look like things you *snap together*, not form fields you *fill out*.

---

## Core Metaphor

Each block is a **physical building piece** — it has weight, depth, and visible connection points. The design should communicate at a glance: what type of thing this is, where it connects to other things, and what state it's in. Color carries type identity; shape carries connectivity; depth carries hierarchy.

---

## Color System

Every block type owns a **color triad**:

- **`bg`** — the primary identity color. Used for the header, knobs, and any structural chrome.
- **`dark`** — a noticeably darker shade of the same hue. Used for the 3D drop-shadow that creates depth.
- **`light`** — a very desaturated, near-white tint of the same hue. Used for the editable body area.

The triad keeps the block visually unified: everything reads as *one thing* in one color, not a header glued to a card.

Block types should each occupy a distinct, clearly separated hue so they're identifiable at small sizes or when zoomed out. Avoid two types sharing a hue family.

---

## Block Anatomy

A standard block has three layers stacked vertically:

```
[ top socket knob ]    ← only on connectable blocks; same color as header
[ header bar      ]    ← colored, contains label + controls
[ body            ]    ← light tinted, contains input fields
[ bottom peg      ]    ← only on connectable blocks; same color as header
```

### Header
The header is the block's identity and its drag handle. It should be clearly distinct from the body — the full `bg` color, white text, compact height. It carries:
- A **grip indicator** (subtle, low-opacity) to signal draggability
- A **type label** in bold uppercase with a secondary title (e.g. block name or index)
- A **collapse chevron** — `›` when collapsed, `˅` when expanded — as the first interactive element
- A **delete control** at the far right, low-opacity until hovered

When collapsed, the header expands to show a one-line content preview inline (truncated, muted opacity) so the block communicates its content without taking up space.

### Body
The body is the editing surface. It uses the `light` color as background — a barely-there tint that visually connects to the header without competing with it. Input fields inside use white/semi-transparent backgrounds with very subtle borders. Field labels are tiny, uppercase, low-opacity.

### Depth
The 3D effect is a single box-shadow offset straight down (no blur, no spread) in the `dark` color. This creates the impression the block sits above the canvas surface. Shadows should be tight — a few pixels — not dramatic. The body itself has no shadow; only the overall block wrapper does.

---

## Connectable Blocks

Some blocks (those that form chains) have **knobs**:

- **Top socket** — a small raised bump of the `bg` color protruding above the block. Rounded at the top. This is the receiving end — what the block below connects into.
- **Bottom peg** — a mirror-image bump protruding below the block. Rounded at the bottom. This is the sending end — what locks into the socket of the block below.

The socket and peg should be the same width and use the same color as the block header. When two blocks snap together, the peg of the upper block fills the socket space of the lower block, creating a seamless joined appearance.

The top socket requires padding above the header so the socket occupies real layout space (and therefore affects measured block height for snap calculations). The bottom peg is absolutely positioned and does not contribute to layout height — this is what allows snap math to work cleanly.

Non-connectable blocks (configuration/environment blocks) have no knobs and appear as clean rectangles.

---

## The C-Block (Container)

A C-block wraps other blocks inside itself. It reads as a frame or group, not a list:

```
[ header — full width                     ]
[ left arm ]  [ inner mouth / slot area   ]
[ left arm ]  [ inner mouth / slot area   ]
[ bottom cap — full width                 ]
```

- The **left arm** is a narrow strip of the `bg` color connecting header to cap. It forms the left wall of the "C".
- The **mouth** is the open area where child blocks live. It uses the `light` color as background.
- The **bottom cap** is a short full-width bar of the `bg` color that closes the shape.
- The C-block itself has both a top socket and bottom peg, making it chainable like other connectable blocks.
- The mouth has a visible drop target (dashed border that activates on hover) and an inline "add" control.

Child blocks inside a C-block use the same block anatomy but inherit the space of the mouth — they don't have their own canvas coordinates. Each child has its own collapse/expand toggle.

---

## Palette Chips

Palette items are the compact draggable versions of blocks — header-only, no body. They use the same `bg`/`dark` color and the same label style, but are shorter and have no fields. They communicate: *this is what you'll get when you drag me out*.

The drag ghost (the image that follows the cursor while dragging) should match the chip style: a small pill in the block color, not the browser's default white rectangle. This is achieved by creating a hidden element, calling `setDragImage`, and removing it on the next animation frame.

---

## Canvas

The canvas is a pan/zoom surface with a subtle dot-grid background. The background should be slightly darker than the blocks so blocks read as objects sitting on a surface rather than content in a scrollable list.

**Z-indexing:** Blocks higher on screen (lower `y` value) receive higher z-index. This ensures that when blocks are connected vertically, the upper block's bottom peg overlaps the lower block's socket area correctly, rather than disappearing behind it.

**Snap behavior:** Connectable blocks should snap to each other when dragged within a threshold distance. Snap both vertically (aligning connection points) and horizontally (aligning left edges). Snap detection uses real DOM measurements (via `offsetHeight`) rather than estimated values, since block heights vary with content.

**Chain movement:** When a block is dragged, any blocks snapped below it should move with it as a unit. Compute the full chain at drag-start via BFS/DFS, then apply the same delta to all members in a single batched state update.

---

## Collapse / Expand

Every block supports two states:

- **Expanded (full):** Header + full body with all editable fields visible.
- **Collapsed (reduced):** Header only. The header text expands to show a one-line content summary inline — truncated prompt, field count, key values. The block still has its knobs and can be dragged and chained normally.

The toggle is a chevron in the header. The state is local to the component (not persisted to the data model), so serialization is unaffected.

---

## Interaction Principles

1. **Drag from the header**, not the body. Input fields in the body need mouse events for editing; the header is always safe to drag.
2. **Collapse before moving** — collapsed blocks are small, easy to reposition, and reveal the canvas structure underneath.
3. **Visual feedback precedes commitment** — snap targets should highlight before the user releases, drop zones should change appearance on hover. No surprises on drop.
4. **Palette chips and canvas blocks share identity** — same colors, same label style. A user should immediately recognize a dropped block as the thing they picked up from the palette.
