# ============================================
# rewrite_msgs.py — เขียนข้อความ commit ทั้ง history ใหม่เป็นภาษาอังกฤษ
#   GitHub เอา "ข้อความ commit ล่าสุดที่แตะไฟล์" มาโชว์ข้างชื่อไฟล์ในหน้า repo
#   ของเดิมเป็นไทยหมด → หน้า repo เลยดูเป็นภาษาไทยทั้งหน้า
#
# ใช้ผ่าน git filter-branch (map ด้วย hash เดิมจาก $GIT_COMMIT — ตรงตัว ไม่พลาด):
#   git filter-branch -f --msg-filter "python scratchpad/rewrite_msgs.py" -- --all
# ★ รันแล้วต้อง force push ทั้ง branch และ tag
# ============================================
import io
import os
import sys

TRAILER_5 = 'Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>'
TRAILER_48 = 'Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>'

MSG = {
'fe5fca79526b15fb2f75483ecc6a1ca1a7d0ff09': f"""Untrack docs/intro-kinetic-* (swept in by an over-eager git add -A)

The files stay on disk, they are just no longer tracked. Added to .gitignore
so it cannot happen again.

{TRAILER_5}""",

'7d0b8d1c875bca840a8ec933af12f0fc0e46c542': f"""Collapse the READMEs into one English file and flatten the repo root

- One README.md in English; README.ja.md and README.th.md removed
  Dropped the "Why it's built this way" and "How this was built" sections
  and trimmed the remaining prose: 133 -> 88 lines
  The 職務経歴書 structure is now a single line under Features
  The note about working with Claude stays in the Resume Mode colophon
- Repo root is down to six files: .gitignore .nojekyll CLAUDE.md LICENSE
  README.md index.html
  - CHANGELOG.md moved to docs/
  - Python/ moved to tools/legacy/; dropped its duplicate serve.py
  - Removed an unused PDF that nothing referenced
- Updated the Python/gen_room.py paths referenced in comments across
  renderer.js, map.js, gen_room_v2.py and fix_enc.py

{TRAILER_5}""",

'acad6392751594b89472eaeecb594761e57c1a60': f"""Clean up the repo root, add direct CV links, generate a social preview

- Removed duplicate PDFs from the root; they were byte-identical to the ones
  in assets/, which is where the site loads them from. The point is not the
  file size: the PDFs are still behind the site content, so a copy sitting at
  the root risks someone opening an older version of the CV
- Removed a leftover screenshot from a feature that was cut; moved Icon.png
  to assets/favicon-source.png
- All three READMEs: direct CV download links under the badges, so a recruiter
  does not have to play the game first
- tools/gh_media.py: new `social` mode producing a 1280x640 preview image
  (GitHub has no API for uploading it — Settings -> Social preview)

{TRAILER_5}""",

'6d7633be9e726dc2b1e0efb8ad53b9c0e41cea7a': f"""Colophon: say plainly that Claude was the main coding partner

It previously read "I wrote all of this myself", which contradicted the
authorship section just added to the README. Now consistent across the site
and GitHub, in all three languages, and clear that the design direction,
testing and every decision were the author's.

{TRAILER_5}""",

'25a6e49f89724b6459e12b8b891d3373c2d423cf': f"""README: add an authorship section — Claude as the main pair-programmer

Spells out what belongs to whom: concept and art direction, every design
decision, the writing in three languages and its fact-checking, and the
testing and bug reports are the author's; Claude turned those calls into code
and tracked down causes. Added in all three languages.

{TRAILER_5}""",

'ce836628a9eb6b00b288b8d80f0df0c272c62640': f"""CLAUDE.md: drop the profile README — it duplicated the site README

{TRAILER_5}""",

'1bb231dd7546bfb72f07795c9483b0ff59d62d10': f"""CLAUDE.md: record the GitHub work and the screen-recording pitfall

{TRAILER_5}""",

'847f2e51ee9ba5368de1ea820f8da1f085ec504e': f"""Rebuild the README with media captured from the game, add LICENSE

- README.md (EN) as the main file, plus README.ja.md and README.th.md with a
  language switcher. Lead point: the Japanese resume follows real 職務経歴書
  section order rather than being a translation of the English CV
- tools/gh_media.py drives headless Edge over CDP to capture the media from
  the running game: title banner, five stills, and a clip of walking up to a
  cabinet and opening a panel
  Hit a known trap in this project: opening a panel dropped the tab out of
  foreground, so document.hidden went true, main.js set running=false, the
  rAF loop stopped and the screencast produced no further frames. Fixed by
  pinning document.hidden to false and calling bringToFront every 0.4s
  The clip is animated WebP, not GIF: the camera pans constantly so every
  pixel changes every frame and a 256-colour GIF will not compress
  (600px/9fps still came to 4.8MB, while WebP at 720px/12fps is 1.4MB)
- LICENSE split in two: MIT for the code, all rights reserved for the writing,
  artwork and personal content, with the music and company logos called out as
  not covered
- CHANGELOG.md summarising v1.0.0

{TRAILER_5}""",

'41b5ae82f7f3af39b7f1ad36c2bb5e3383cc7d56': f"""Event zone: add the "bridge into Thai game events" pitch and a brochure

- A one-line brief plus three levels of detail (contacts for large events such
  as TGS, advising on mid-size and small ones, running fan events through an
  organiser) in all three languages, phrased as capability without overclaiming
- Download button for assets/tgs26-brochure.pdf in the event panel, all three
  languages

{TRAILER_48}""",

'f49a548d08f2b39a1ba2987a3e240df6a10a74e2': 'Update README.md',

'87fee3e3565e7b61ce9ef3596e3920bca05190e8': f"""Remove the unused ishikari-lore.mp3 (6.5MB, nothing referenced it)

The track actually in use is assets/audio/303pm-sharou.mp3. If it is ever
wanted back it can be downloaded again from incompetech.com (CC BY 4.0).

{TRAILER_48}""",

'f81efcd6f4708ce49bbb826a9ae8082a3c9fa44b': f"""Bring the CLAUDE.md status section in line with what actually shipped

- Removed stale claims: "still defaults to v1" (it is v3), "not yet in git",
  "mobile untested", and an idea that had already been built
- Summarised milestones M1-M15 and listed the four items genuinely outstanding
- Added the standard sequence to follow for any further change
  (test -> commit -> push -> live check)

{TRAILER_48}""",

'7588805738e19ff4180c171d357affc7a8a84326': f"""Use absolute URLs for og:image/og:url/canonical, add a live-site test

- LinkedIn does not resolve a relative og:image path, so the share card came
  out with no image
- Added scratchpad/live.py, which tests the real domain rather than localhost
  (all three languages, images that fail to load, JS errors)

{TRAILER_48}""",

'db6b3d42b22e3022b4aebec75abf9e7c6bd33e35': f"""One through-line across every zone, plus visa criteria and a PDF guide

- Resume Mode summary: added the core pitch — a one-person team covering the
  whole pipeline into the Thai market — and the point that Japanese-to-Thai is
  a hard pair to staff, since it removes the detour through English
- HR info box: added the 技術・人文知識・国際業務 visa line in all three languages
- Added docs/resume-pdf-updates-2026-07.md with ready-to-paste text for all
  three PDFs, since this machine has no PDF library to edit them directly

{TRAILER_48}""",

'e22f355fa2eda7c3329536b531d0ef62db65c803': f"""Make the content match reality, and show HR where to see the translations

- Esports: state plainly that every pro team beat us, and that the Top 4 finish
  was at high-school level
- Sticky Rice: added the real per-title workflow (Thai naming, font choice,
  marketing plan, translation on a spreadsheet with glossary control, media
  partners, launch marketing)
- DIGITAL HEARTS: noted that the work was remote into the client's closed
  environment using their own tooling, which cannot be named under NDA
- Skills: dropped the vague "CAT tools" claim in favour of what is actually done
- Added a line telling HR exactly how to see the translations: open the Steam
  page and switch the store language to Thai

{TRAILER_48}""",

'4e222f23afd1d1ddf8b9b4de570e586b568331ad': f"""Add the pro teams faced in Dota 2 (Team Finite, Baby Build House)

{TRAILER_48}""",

'eb5c93b036eabb82069fdfb38789f347514475b4': f"""Fix the control bugs, correct the network zone, drop the player shadow

- The progress counter now hides at every screen size while an overlay is open;
  it used to sit on top of the Resume close button in the same corner
- Removed the shadow under the player for good
- Network zone: JTECS corrected to JETRO, and "partner" replaced with wording
  that does not claim a partnership, in all three languages
- Event zone: added a Book Expo Thailand card using the official key visual
- Right-clicking a panel now closes it without immediately reopening; the old
  behaviour closed on the dark scene and the following contextmenu reopened it
- Keyboard and mouse no longer fight: pressing a movement key or grabbing the
  stick clears the click destination, and held.clear() on click is gone, which
  was dropping keys that were genuinely still held
- Added scratchpad/controls.py as the regression test for this set

{TRAILER_48}""",

'71114fb648ab95dc37bae3762f9c56d3f1986786': f"""Pre-deploy polish: metadata, onboarding, resume header, 職務経歴書 structure

Content
- Added the three months working in Tokyo (Tokyo Internship, Zeal Team in
  Hamamatsucho, living near Takanawa Gateway) in all three languages, which
  answers the relocation question Japanese HR tends to have
- Willing-to-relocate chip, and stats for the freelance zone
- Resume Mode: three-line summary, an info box for HR, contact buttons at the
  top, and a last-updated date

Structure
- resume.groups moved into content.js so the Japanese version can follow real
  職務経歴書 section order
- title/description/OG/twitter card written into the served HTML, since crawlers
  do not run JS, plus a 1200x630 share image

UX
- Six-second how-to-play hint, a CTA card once every zone has been visited, and
  a shadow showing there is more content below
- Focus trap in panels, a print stylesheet for Resume Mode, and click-to-walk
  that steps around one level of obstruction
- Player shadow angled to the light, smaller logo cards, and a brand strip that
  shows it can be scrolled

{TRAILER_48}""",

'23c8d65': f"""Add the pre-deploy polish spec

{TRAILER_48}""",

'e800476': f"""Click-to-walk, right-click, panel pop animation, quieter SFX

- Sound effects down by a third, applied once in tone()/noise()
- Separated the contact zone from the other-work zone; they were 6px apart, so
  their interact ranges overlapped
- Left click walks, clicking an object walks there and opens its panel, right
  click replaces the browser context menu
- Ripple at the click point, and panels that pop in and out, both respecting
  reduced-motion
- Added scratchpad/clickmove.py as the regression test for this control scheme

{TRAILER_48}""",

'9133d3b': f"""Interactive game resume — first commit

A top-down game resume (HTML + Canvas 2D + vanilla JS, no build step) aimed at
localization, LQA, publishing and PR & marketing roles at Japanese game studios.

- Full i18n in Thai, English and Japanese; every string comes from
  js/data/content.js with nothing hardcoded
- 14 content zones in the studio room, plus Resume Mode as a plain scrolling
  HTML accessibility fallback
- Room, title scene, slides and logos generated by Python scripts in tools/,
  every seed fixed
- Touch support from 360px wide, reduced-motion respected, renderer.draw around
  1.3ms per frame

{TRAILER_48}""",
}

# เผื่อ hash สั้น: ทำ map จาก prefix ให้ด้วย
BY_PREFIX = {k[:7]: v for k, v in MSG.items()}

old = sys.stdin.read()
sha = os.environ.get('GIT_COMMIT', '')
new = MSG.get(sha) or BY_PREFIX.get(sha[:7])
out = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', newline='')
out.write(new if new else old)   # ไม่เจอ = ปล่อยของเดิมไว้ ดีกว่าทำหาย
out.flush()
