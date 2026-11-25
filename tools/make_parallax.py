"""Generates the placeholder parallax layers (assets/img/parallax/layer-N.svg).

Each layer is 2400 x 1350, bottom-anchored, transparent above its silhouette.
To use real art: export each depth as a PNG of the same size with transparency,
drop it in assets/img/parallax/ and point the <img> in index.html at it.
"""
import math, random, os
W, H = 2400, 1350
OUT = os.path.join(os.path.dirname(__file__), "..", "assets", "img", "parallax")
random.seed(7)

def svg(body, extra=""):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" preserveAspectRatio="xMidYMax slice">{extra}{body}</svg>'

def hills(base, amp, freq, phase, col, step=20):
    pts = []
    for x in range(-20, W + 40, step):
        y = base - amp * (0.55 * math.sin(x * freq + phase) + 0.3 * math.sin(x * freq * 2.3 + phase * 1.7) + 0.15 * math.sin(x * freq * 5.1))
        pts.append(f"{x},{y:.0f}")
    return f'<path fill="{col}" d="M-20,{H} L{" L".join(pts)} L{W+40},{H} Z"/>'

def skyline(base, hmin, hmax, wmin, wmax, col, antenna=0.15, gap=(0, 14), seed=1):
    r = random.Random(seed); x = -30; d = []
    while x < W + 30:
        w = r.randint(wmin, wmax); h = r.randint(hmin, hmax); top = base - h
        d.append(f"M{x},{H} V{top} H{x+w} V{H} Z")
        if r.random() < 0.25:  # setback tower
            iw = int(w * 0.55); ix = x + (w - iw) // 2; ih = r.randint(20, int(h * 0.35) + 21)
            d.append(f"M{ix},{top+2} V{top-ih} H{ix+iw} V{top+2} Z")
            top -= ih
        if r.random() < antenna:
            ax = x + w // 2; d.append(f"M{ax-2},{top+2} V{top-r.randint(30,90)} H{ax+2} V{top+2} Z")
        x += w + r.randint(*gap)
    return f'<path fill="{col}" d="{" ".join(d)}"/>'

def walker(cx, ground, s, col):
    # big two-legged machine, placeholder silhouette
    def P(pts): return "M" + " L".join(f"{cx+x*s:.0f},{ground-y*s:.0f}" for x, y in pts) + " Z"
    body = P([(-120,560),(140,560),(170,640),(150,720),(-90,730),(-150,650)])
    eye = f'<circle cx="{cx+95*s:.0f}" cy="{ground-650*s:.0f}" r="{16*s:.0f}" fill="#ffe7c2"/>'
    hip = P([(-70,560),(70,560),(55,520),(-55,520)])
    legL = P([(-60,525),(-25,525),(-80,280),(-30,10),(-110,0),(-150,10),(-115,280)])
    legR = P([(25,525),(60,525),(130,300),(110,10),(170,0),(210,10),(165,300)])
    ant = P([(-40,730),(-34,730),(-30,800),(-36,800)])
    gun = P([(150,640),(260,630),(262,612),(150,618)])
    return f'<path fill="{col}" d="{body} {hip} {legL} {legR} {ant} {gun}"/>{eye}'

def drone(x, y, s, col):
    return (f'<g fill="{col}" transform="translate({x},{y}) scale({s})">'
            f'<rect x="-30" y="-8" width="60" height="16" rx="6"/><rect x="-46" y="-14" width="34" height="4"/>'
            f'<rect x="12" y="-14" width="34" height="4"/><circle cx="18" cy="2" r="3" fill="#ffe7c2"/></g>')

def pylon(x, ground, h, col):
    d = f"M{x-18},{ground} L{x-3},{ground-h} L{x+3},{ground-h} L{x+18},{ground} Z M{x-34},{ground-h+30} H{x+34} V{ground-h+38} H{x-34} Z M{x-26},{ground-h+80} H{x+26} V{ground-h+86} H{x-26} Z"
    return f'<path fill="{col}" d="{d}"/>'

def wires(xs, ground, h, col, sag=60):
    out = []
    for a, b in zip(xs, xs[1:]):
        for off in (30, 80):
            y = ground - h + off; mx = (a + b) / 2
            out.append(f'<path d="M{a},{y} Q{mx},{y+sag} {b},{y}" stroke="{col}" stroke-width="3" fill="none"/>')
    return "".join(out)

def grass(base, col, seed=3):
    r = random.Random(seed); d = [f"M-20,{H} L-20,{base}"]
    x = -20
    while x < W + 20:
        h = r.randint(10, 70); w = r.randint(6, 16)
        d.append(f"L{x+w/2:.0f},{base-h} L{x+w},{base+r.randint(-4,4)}")
        x += w
    d.append(f"L{W+20},{H} Z")
    return f'<path fill="{col}" d="{" ".join(d)}"/>'

def crew(xs, ground, col):
    # four co-op players, tiny silhouettes standing on the near ridge
    out = []
    for i, x in enumerate(xs):
        s = 1.0 + 0.06 * (i % 2)
        out.append(f'<g fill="{col}" transform="translate({x},{ground}) scale({s})">'
                   f'<rect x="-11" y="-92" width="22" height="22" rx="10"/>'      # helmet
                   f'<path d="M-18,-70 H18 L22,-30 H-22 Z"/>'                    # torso
                   f'<rect x="-30" y="-74" width="16" height="34" rx="3"/>'        # backpack
                   f'<path d="M-16,-30 H-2 L-4,0 H-18 Z M2,-30 H16 L18,0 H4 Z"/>'  # legs
                   + (f'<rect x="16" y="-62" width="44" height="5" transform="rotate(-24 16 -62)"/>' if i % 2 == 0 else
                      f'<rect x="14" y="-60" width="8" height="40" transform="rotate(18 14 -60)"/>') +
                   '</g>')
    return "".join(out)

C = ["#f8c9a0", "#f4a576", "#eb8554", "#d45e31", "#a9401f", "#6a2714", "#141210"]

layers = {
 1: hills(1020, 140, 0.0018, 0.6, C[1]) ,
 2: skyline(1090, 120, 420, 50, 140, C[2], antenna=0.3, seed=11) + "".join(drone(x, y, s, C[2]) for x, y, s in [(420, 330, 1.1), (1560, 250, 0.9), (1900, 420, 0.7)]),
 3: walker(1720, 1200, 0.95, C[3]) + skyline(1210, 60, 260, 70, 190, C[3], antenna=0.2, gap=(30, 120), seed=5),
 4: hills(1180, 70, 0.0026, 2.1, C[4]) + "".join(pylon(x, 1170, 260, C[4]) for x in (180, 820, 1460, 2100)) + wires([180, 820, 1460, 2100], 1170, 260, C[4]),
 5: hills(1250, 60, 0.0034, 4.0, C[5]) + grass(1235, C[5]),
 6: hills(1330, 35, 0.0021, 1.2, C[6]) + crew([1010, 1110, 1215, 1310], 1300, C[6]) + f'<rect x="-20" y="1320" width="{W+40}" height="40" fill="{C[6]}"/>',
}
for n, body in layers.items():
    open(os.path.join(OUT, f"layer-{n}.svg"), "w").write(svg(body))
print("wrote", len(layers), "layers")
