import { createClient } from '@supabase/supabase-js'

const url = process.env.SUPABASE_URL
const anon = process.env.SUPABASE_ANON_KEY

const supabase = createClient(url, anon, { auth: { persistSession: false } })

const email = `test-${Date.now()}@example.com`
const password = 'testpass123'
const name = 'Test User'

console.log('== 1. signUp ==')
const { data: su, error: suErr } = await supabase.auth.signUp({ email, password, options: { data: { name, mobile: '9876543210' } } })
console.log('error:', suErr?.message || 'none')
console.log('session returned:', !!su?.session, '| user id:', su?.user?.id)

await new Promise(r => setTimeout(r, 800))

console.log('== 2. trigger-created profile ==')
const { data: prof, error: profErr } = await supabase.from('profiles').select('*').eq('id', su.user.id).single()
console.log('error:', profErr?.message || 'none')
console.log('row:', prof ? JSON.stringify({ name: prof.name, email: prof.email, stream: prof.stream, subjects: prof.subjects }) : 'MISSING')

console.log('== 3. upsert full profile ==')
const { error: upErr } = await supabase.from('profiles').upsert({
  id: su.user.id, name, email, mobile: '9876543210', stream: 'Commerce',
  subjects: ['English', 'Economics', 'Accountancy'], dream_college: 'SRCC',
  target_percentile: 85, exam_date: '2027-05-15',
})
console.log('error:', upErr?.message || 'none')

console.log('== 4. read back ==')
const { data: prof2 } = await supabase.from('profiles').select('*').eq('id', su.user.id).single()
console.log('row:', prof2 ? JSON.stringify({ name: prof2.name, stream: prof2.stream, dream: prof2.dream_college, target: prof2.target_percentile }) : 'MISSING')

console.log('== 5. signOut + signIn ==')
await supabase.auth.signOut()
const { data: si, error: siErr } = await supabase.auth.signInWithPassword({ email, password })
console.log('signIn error:', siErr?.message || 'none', '| session:', !!si?.session, '| user id:', si?.user?.id)

console.log('== 6. wrong password (should fail) ==')
const { error: badErr } = await supabase.auth.signInWithPassword({ email, password: 'wrongpass' })
console.log('error:', badErr?.message || 'none')

console.log('TEST_EMAIL=' + email)
console.log('TEST_UID=' + su.user.id)