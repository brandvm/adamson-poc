# Adamson driver explode: Grok video brief

For the home page **video scrub** section: the video's playback follows the visitor's scroll, so it must be one smooth, continuous move with no cuts.
Scroll storyboard with the timing: open `storyboard-scroll.html` in a browser and scroll (it needs an internet connection for the font and animation library). Online copy: https://claude.ai/artifact/3jKHQc9KdKPg3cHacNYsga (ask the team for access).

## Keyframes in this folder

| File | Video time (8 s clip) | Moment |
|---|---|---|
| `01-face-on.png` | 0.0 s | Closed driver, face-on, centred |
| `02-three-quarter.png` | ~1.9 s | Closed, turned to the 3/4 view, centred |
| `03-plate-release.png` | ~3.2 s | Rear mounting plate slid back |
| `04-waveguide-forward.png` | ~5.0 s | Waveguide forward, all parts in a line, centred |
| `05-final-centred.png` | 7.4–8.0 s | Final pose, centred horizontally and vertically. Hold this to the end. |
| `ref-poster.png` | — | The real product render, for reference on materials and details. |

## How to make it seamless

Make the clip as **four short segments, each one starting from the last frame of the one before**, then join them:

1. In Grok Imagine, use **image-to-video** with the keyframe as the start image.
2. Generate the segment with the prompt below.
3. Export the **last frame** of the segment you keep, and use it (not the original PNG) as the start image of the next segment. This guarantees no jump at the joins.
4. Join the segments in order (Premiere, Resolve or CapCut), trim any frames where the motion stalls, and retime to 8 s total: 0–1.9 s, 1.9–3.2 s, 3.2–5.0 s, 5.0–7.4 s (settle, then glide to centre), then hold the last frame to 8.0 s.
5. Keep the background pure black. If Grok adds haze or a floor, grade the blacks to #000 in the edit.

**Every segment:** the product stays centred in the frame, horizontally and vertically, the whole time (the site puts text in the top-left corner early on and the bottom-right corner later, so keep those two corners empty). Locked camera (no pan, no zoom, no orbit), pure black background, the product only moves where the prompt says, no new parts, no text, no logos, no people, no particles or sparks, no camera shake. Slow, precise, ease-in and ease-out movement, like a premium engineering product film.

Paste this **style line** at the start of every prompt:

> Photorealistic studio product film of an Adamson compression driver (dark bronze anodised metal, gold woven mesh dome, polished spun-metal motor, small red connector). Pure black background, warm key light from upper left, soft rim light, locked-off camera, shallow but complete focus, 24–30 fps, smooth slow ease-in-out motion.

### Segment 1: turn (start: `01-face-on.png` → end looks like `02-three-quarter.png`)
> [style line] The assembled driver starts face-on, centred. It slowly rotates on its vertical axis, front swinging toward camera-left, about 70 degrees, until we see it in a three-quarter view with the side of the body receding to the right. The parts stay pressed together. The camera does not move. The product stays centred in frame throughout; keep the top-left corner empty black. 2 seconds.

### Segment 2: plate release (start: last frame of segment 1 → `03-plate-release.png`)
> [style line] Three-quarter view, no rotation. The rear flat mounting plate slides straight back along the driver's axis to the right, opening a clean gap behind the motor flange; light catches the plate's stepped round seat and milled pockets. The front housing and motor stay still. Mechanical, precise, no wobble. 1.5 seconds.

### Segment 3: waveguide forward (start: last frame of segment 2 → `04-waveguide-forward.png`)
> [style line] Three-quarter view, no rotation. The front eight-sided waveguide housing with its gold mesh dome glides forward along the axis toward camera-left, separating from the motor and revealing the motor's spun-metal face, centre cap and grooved coupling shaft. The motor eases very slightly left. The rear plate stays in place. The whole product stays centred in frame; keep the bottom-right corner empty black. 2 seconds.

### Segment 4: settle (start: last frame of segment 3 → `05-final-centred.png`)
> [style line] Three-quarter view, no rotation. The three parts make a final small, slow adjustment to equal spacing along one axis, and the whole open driver glides together, without changing its spacing or angle, until it sits exactly in the centre of the frame, both horizontally and vertically, with equal black space left and right. Housing on the left, motor in the middle, mounting plate on the right, like the reference image. Then hold perfectly still. 1.5 seconds of motion, then still.

If Grok won't centre it exactly, centre the final hold in the edit with a position keyframe (move the whole frame), easing over the last ~0.7 s of motion.

If Grok supports an **end frame** (start and end image), give each segment its start frame plus the next keyframe as the end frame; that gives the cleanest result.

## Delivery

- Desktop: 1920 × 1080, 8 s, 30 fps, no audio, pure black background.
- Mobile: 1080 × 1350 (4:5), same motion with the camera pulled back so all three parts fit.
- Export with every frame as a keyframe so scroll-seeking is smooth:
  `ffmpeg -i in.mov -c:v libx264 -g 1 -crf 20 -pix_fmt yuv420p -movflags +faststart -an out.mp4`
- Under 8 MB desktop, under 4 MB mobile. Upload in WordPress → Home → Video scrub (Video, Mobile video).
