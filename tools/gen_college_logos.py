import json, os, re
from PIL import Image

ROOT = '/root/cuetpro-learning-dashboard'
LOGODIR = os.path.join(ROOT, 'public/college-logos')
found = json.load(open('/tmp/college_logos_found.json'))

ok, suspects = {}, {}
for college, info in found.items():
    path = os.path.join(LOGODIR, info['file'])
    if not os.path.exists(path):
        continue
    try:
        im = Image.open(path).convert('RGBA')
    except Exception:
        suspects[college] = 'unreadable'
        continue
    w, h = im.size
    ar = w / h if h else 99
    if ar > 2.1 or ar < 0.42:
        suspects[college] = f'aspect {w}x{h}'
        continue
    # normalise: square canvas, contain, 72px
    side = max(w, h)
    canvas = Image.new('RGBA', (side, side), (255, 255, 255, 0))
    canvas.paste(im, ((side - w) // 2, (side - h) // 2), im)
    canvas = canvas.resize((72, 72), Image.LANCZOS)
    out = info['file'].replace('.png', '.png')
    canvas.save(os.path.join(LOGODIR, out))
    ok[college] = {**info, 'size': '72x72'}

print('kept:', len(ok))
print('suspect (excluded):', json.dumps(suspects, indent=1))

# ---- map: keys = exact duData college names (with aliases) ----
raw = json.load(open(os.path.join(ROOT, 'src/data/DU_cutoffs_seats_2026.json')))
data_names = sorted({r['college'] for r in raw if r.get('college')})

def norm(s):
    s = s.lower().replace('&', 'and').replace('(w)', '')
    s = re.sub(r'\b(college|delhi|university|of|for|women|the|applied|sciences)\b', '', s)
    return re.sub(r'[^a-z0-9]', '', s)

entries = {}
for college, info in ok.items():
    entries[college] = info['file']
for dn in data_names:
    if dn in entries:
        continue
    n = norm(dn)
    for college, info in ok.items():
        m = norm(college)
        if m and n and (m == n or m in n or n in m):
            entries[dn] = info['file']
            break

lines = [f"  {json.dumps(k)}: '/college-logos/{v}'," for k, v in sorted(entries.items())]
js = f"""/* Real DU college logos — sourced from each college's official site / Wikimedia Commons and
   normalised to 72x72 PNGs in public/college-logos (see tools/gen_college_logos.py).
   Keys are the exact college names used in duData offerings; abbreviations alias onto them. */
export const COLLEGE_LOGOS = {{
{chr(10).join(lines)}
}}

const norm = s => (s || '').toLowerCase().replace(/&/g, 'and').replace(/\\(w\\)/g, '')
  .replace(/\\b(college|delhi|university|of|for|women|the)\\b/g, '').replace(/[^a-z0-9]/g, '')

/* fuzzy lookup so labels like "SRCC" or "Miranda House (W)" resolve to their logo */
export function logoFor(name) {{
  if (!name) return null
  if (COLLEGE_LOGOS[name]) return COLLEGE_LOGOS[name]
  const t = norm(name)
  if (!t) return null
  for (const [k, v] of Object.entries(COLLEGE_LOGOS)) {{
    const nk = norm(k)
    if (nk && (nk === t || nk.includes(t) || t.includes(nk))) return v
  }}
  return null
}}
"""
open(os.path.join(ROOT, 'src/data/collegeLogos.js'), 'w').write(js)
print('\nmap entries:', len(entries), '| duData names covered:', sum(1 for d in data_names if d in entries), '/', len(data_names))
