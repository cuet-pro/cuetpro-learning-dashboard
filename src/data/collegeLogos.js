/* Real DU college logos — sourced from each college's official site / Wikimedia Commons and
   normalised to 72x72 PNGs in public/college-logos (see tools/gen_college_logos.py).
   Keys are the exact college names used in duData offerings; abbreviations alias onto them. */
export const COLLEGE_LOGOS = {
  "Acharya Narendra Dev College": '/college-logos/acharya-narendra-dev-college.png',
  "Atma Ram Sanatan Dharma College": '/college-logos/atma-ram-sanatan-dharma-college.png',
  "Bhaskaracharya College of Applied Sciences": '/college-logos/bhaskaracharya-college-of-applied-sciences.png',
  "College of Vocational Studies": '/college-logos/college-of-vocational-studies.png',
  "Daulat Ram College": '/college-logos/daulat-ram-college.png',
  "Daulat Ram College (W)": '/college-logos/daulat-ram-college.png',
  "Dyal Singh College": '/college-logos/dyal-singh-college.png',
  "Dyal Singh College (Evening)": '/college-logos/dyal-singh-college.png',
  "Hansraj College": '/college-logos/hansraj-college.png',
  "Hindu College": '/college-logos/hindu-college-delhi.png',
  "Hindu College, Delhi": '/college-logos/hindu-college-delhi.png',
  "Kirori Mal College": '/college-logos/kirori-mal-college.png',
  "Lady Irwin College": '/college-logos/lady-irwin-college.png',
  "Lady Irwin College (W)": '/college-logos/lady-irwin-college.png',
  "Lady Shri Ram College": '/college-logos/lady-shri-ram-college.png',
  "Lady Shri Ram College for Women (W)": '/college-logos/lady-shri-ram-college.png',
  "Maharaja Agrasen College": '/college-logos/maharaja-agrasen-college.png',
  "Miranda House": '/college-logos/miranda-house.png',
  "Miranda House (W)": '/college-logos/miranda-house.png',
  "Rajdhani College": '/college-logos/rajdhani-college.png',
  "Satyawati College": '/college-logos/satyawati-college.png',
  "Satyawati College (Evening)": '/college-logos/satyawati-college.png',
  "Shaheed Bhagat Singh College": '/college-logos/shaheed-bhagat-singh-college.png',
  "Shaheed Bhagat Singh College (Evening)": '/college-logos/shaheed-bhagat-singh-college.png',
  "Shaheed Sukhdev College Business Studies": '/college-logos/shaheed-sukhdev-college-of-business-studies.png',
  "Shaheed Sukhdev College of Business Studies": '/college-logos/shaheed-sukhdev-college-of-business-studies.png',
  "Shivaji College": '/college-logos/shivaji-college.png',
  "Shri Ram College of Commerce": '/college-logos/shri-ram-college-of-commerce.png',
  "Sri Guru Gobind Singh College of Commerce": '/college-logos/sri-guru-gobind-singh-college-of-commerce.png',
  "St. Stephen's College": '/college-logos/st-stephen-s-college.png',
  "Swami Shardhanand College": '/college-logos/swami-shardhanand-college.png',
  "Swami Shraddhanand College": '/college-logos/swami-shraddhanand-college.png',
  "Vivekananda College": '/college-logos/vivekananda-college.png',
  "Vivekananda College (W)": '/college-logos/vivekananda-college.png',
  "Zakir Husain Delhi College": '/college-logos/zakir-husain-delhi-college.png',
  "Zakir Husain Delhi College (Evening)": '/college-logos/zakir-husain-delhi-college.png',
}

const norm = s => (s || '').toLowerCase().replace(/&/g, 'and').replace(/\(w\)/g, '')
  .replace(/\b(college|delhi|university|of|for|women|the)\b/g, '').replace(/[^a-z0-9]/g, '')

/* fuzzy lookup so labels like "SRCC" or "Miranda House (W)" resolve to their logo */
export function logoFor(name) {
  if (!name) return null
  if (COLLEGE_LOGOS[name]) return COLLEGE_LOGOS[name]
  const t = norm(name)
  if (!t) return null
  for (const [k, v] of Object.entries(COLLEGE_LOGOS)) {
    const nk = norm(k)
    if (nk && (nk === t || nk.includes(t) || t.includes(nk))) return v
  }
  return null
}
