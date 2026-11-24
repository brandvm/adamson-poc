# Prompting Codex for photoreal product images

What made the first round look like CGI, and what fixes it:

| Looks fake | Ask for instead |
|---|---|
| "render", "3D", "high detail" | Name a real photo shoot: camera, lens, aperture, lighting setup |
| Perfectly clean, smooth metal | Real finishes: anodising grain, machining marks, brushed and spun lines, softened edges, faint dust |
| Even, glowing light everywhere | One key light, one rim light and a fill card; real falloff into black |
| Gold mesh that glows from inside | Mesh lit from outside: separate wires, tiny gaps, its own shadows |
| Details that change between frames | Copy exact counts from the reference ("6 bolt holes, no more") and attach the previous frame |
| Plastic-looking bronze | Hard anodised aluminium in dark bronze, satin and not glossy, with crisp reflections only on the chamfers |

Steps that help:
1. **Attach references.** Always attach the real render (`ref-poster.png`), and for each frame after the first, attach the frame before it. Say "match these exactly" and "do not redesign".
2. **One photo, one moment.** Describe only what the camera sees in this frame.
3. **Photography words.** Name a product shot made with a medium-format camera and a 100–120 mm macro lens at f/11, a strip softbox as the key, a rim light, black flags, and a seamless black background.
4. **Negative list.** Ask for no CGI look, bloom, glow, lens flare, dirt-free plastic surfaces, extra parts, warped or doubled holes, text, logos or reflections of the studio.
5. **Framing and output.** Ask for 16:9 at the largest size the tool allows, with the product centred, and for a PNG to be saved at the given path.

Template (fill in THIS FRAME):

```
Use your image generation tool to create ONE photograph (not a 3D render look) and save it as PNG at: <path>.
Attached: ref-poster.png = the real product, plus <previous frame> = the frame just before this one. Match the product exactly; do not redesign anything.

Product: Adamson compression driver, three parts on one axis.
- Front waveguide housing: thick 8-sided ring with rounded corners, hard-anodised aluminium in dark satin bronze, a square mounting tab on the left side, exactly 6 bolt holes in the front face, a stepped inner lip, holding a dome of fine gold woven wire mesh.
- Motor: polished bronze-steel cylinder, front face spun metal with fine concentric turning marks and a small flat centre cap, chamfered edge, wider rear flange with small socket screws, a short grooved steel coupling shaft on the front, and a small red signal connector with a knurled steel barrel on its side.
- Rear mounting plate: flat 8-sided plate with rounded corners, darker bronze, a large round opening with a stepped seat, a ring of small threaded holes, and two long milled pockets on one side.

Photography: studio product photograph taken with a medium-format camera, 120 mm macro lens, f/11, everything sharp. Key light: a large strip softbox from upper left. Rim light from back right outlining the edges. A small fill card in front. Black flags so the light falls off naturally into a seamless pure black (#000) background. No floor and no shadow catcher.
Materials must read as real: fine anodising grain, crisp machined chamfers catching thin highlights, concentric turning marks, separate gold mesh wires with tiny gaps between them, very slight edge wear, no fingerprints.
Avoid: CGI or plastic look, bloom, glow, haze, lens flare, over-smoothed surfaces, warped or extra holes, extra parts, text, logos, people, reflections of the studio.
Framing: 16:9 landscape, largest size available, product centred horizontally and vertically, nothing cropped, top-left and bottom-right corners empty black.

THIS FRAME: <pose and what has moved>
```
