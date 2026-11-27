# MEATSPACE website

Static site: plain HTML/CSS/JS, no build step. Hosted on GitHub Pages from `main`.
Edit a file, commit, push, and the site updates in about a minute.

## Where things are

| What | File |
|---|---|
| Steam link, full video, sign-up form, socials | `config.js` (the only file you need for links) |
| Page structure and all text | `index.html` |
| Look | `styles.css` (colours are at the top, under `:root`) |
| Scroll motion, video player, form | `main.js` (GSAP + ScrollTrigger + Lenis, loaded from jsDelivr) |

The layout and scroll motion are ported from the Pepito site (umano-style): loader, top-edge blur,
pill nav that turns into progress dots over the cards, hero that insets and tilts on scroll,
word-by-word blur reveal, one pinned section where the cards scroll sideways and the last one zooms to
fill the screen, parallax gallery, FAQ, and a footer the page lifts off.

## Video

- **Hero**: plays the full demo muted on loop (same two files as below, so the play button starts instantly).
  Poster frame: `assets/video/hero-poster.webp`.
- **Full video** (play button, opens full screen with sound), 1080p, two files named in `config.js` and in the hero `<video>` in `index.html`:
  `assets/video/meatspace-demo-av1.mp4` (`demoVideo`, AV1, played by Chrome/Edge/Firefox/newer Safari) and
  `assets/video/meatspace-demo-h264.mp4` (`demoVideoFallback`, H.264 at 30 fps, for everything else).
  GitHub refuses files over 100 MB, so re-encode big sources first:

```
ffmpeg -i SOURCE.mp4 -c:v libsvtav1 -preset 5 -crf 36 -maxrate 4500k -bufsize 9000k -pix_fmt yuv420p10le -g 240 -c:a aac -b:a 160k -movflags +faststart assets/video/meatspace-demo-av1.mp4
ffmpeg -i SOURCE.mp4 -vf fps=30 -c:v libx264 -preset slow -crf 23 -maxrate 5M -bufsize 10M -profile:v high -pix_fmt yuv420p -g 60 -c:a aac -b:a 160k -movflags +faststart assets/video/meatspace-demo-h264.mp4
```

## Swapping placeholder art

- **Feature cards**: replace the files in `assets/img/cards/` (1600 x 900 JPG; keep the names or edit `index.html`).
  `explore.jpg` is a real in-game shot and `world.jpg` is the Visit Meatspace poster. The rest are placeholders.
- **Gallery** ("Postcards from Meatspace"): `assets/img/gallery/g-1..6.webp`, stills from the intro. Any aspect
  ratio works (masonry columns).

## Early-access sign-ups

The form posts straight to a mailing-list provider, which stores the emails and sends the welcome mail.
Recommended: **Kit** (kit.com), free up to 10,000 subscribers.

1. Create a Kit account, then **Grow > Landing Pages & Forms > New form > Inline**.
2. Open the form's **Embed > HTML** and copy the number in `app.kit.com/forms/NUMBER/subscriptions`.
3. In `config.js` set `signup.action` to `https://app.kit.com/forms/NUMBER/subscriptions` (`emailField` is already `email_address`).
4. In the form's **Settings > Incentive**, paste the email from `WELCOME_EMAIL.md`. That's the mail people get, including the wishlist reminder.
5. Subscribers are listed under **Grow > Subscribers** and can be exported to CSV.

Until `signup.action` is set, the form says sign-ups aren't connected and stores nothing.

## Run locally

```
python -m http.server 8765
```
then open http://127.0.0.1:8765
