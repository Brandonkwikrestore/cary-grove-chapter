const admin = require('firebase-admin');
const https = require('https');
const SUPABASE_URL = 'https://tlcaeddeytsjgojyogjc.supabase.co';
const SUPABASE_SERVICE_KEY = process.argv[2];
if (!SUPABASE_SERVICE_KEY) { console.error('Usage: node migrate-to-supabase.js SERVICE_KEY'); process.exit(1); }
admin.initializeApp({ projectId: 'cary-grove-chapter' });
const db = admin.firestore();
function supabaseInsert(table, rows) {
  return new Promise((resolve, reject) => {
    if (!rows || rows.length === 0) { resolve([]); return; }
    const body = JSON.stringify(rows);
    const options = { hostname: 'tlcaeddeytsjgojyogjc.supabase.co', path: `/rest/v1/${table}`, method: 'POST', headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_SERVICE_KEY, 'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`, 'Prefer': 'return=minimal', 'Content-Length': Buffer.byteLength(body) } };
    const req = https.request(options, (res) => { let data = ''; res.on('data', d => data += d); res.on('end', () => { if (res.statusCode >= 200 && res.statusCode < 300) resolve(data); else reject(new Error(`${table}: ${res.statusCode} ${data}`)); }); });
    req.on('error', reject); req.write(body); req.end();
  });
}
function supabaseGet(path) {
  return new Promise((resolve, reject) => {
    const options = { hostname: 'tlcaeddeytsjgojyogjc.supabase.co', path, method: 'GET', headers: { 'apikey': SUPABASE_SERVICE_KEY, 'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}` } };
    const req = https.request(options, (res) => { let data = ''; res.on('data', d => data += d); res.on('end', () => resolve(JSON.parse(data))); });
    req.on('error', reject); req.end();
  });
}
function toDate(val) { if (!val) return null; if (typeof val === 'string') return val.substring(0,10); if (val._seconds) return new Date(val._seconds*1000).toISOString().substring(0,10); return null; }
function parseRecords(val) { if (!val) return []; if (Array.isArray(val)) return val; try { return JSON.parse(val); } catch(e) { return []; } }
async function migrate() {
  console.log('\n Starting migration...\n');
  const chapters = await supabaseGet('/rest/v1/chapters?slug=eq.cary-grove&select=id');
  if (!chapters || !chapters[0]) { console.error('Chapter not found'); process.exit(1); }
  const CID = chapters[0].id;
  console.log('Chapter ID:', CID);
  const collections = [
    ['members', async () => { const s = await db.collection('members').get(); return s.docs.map(d => { const r=d.data(); return { chapter_id:CID, name:r.name||'', specialty:r.specialty||'', company:r.company||'', email:r.email||'', phone:r.phone||'', active:true }; }); }],
    ['attendance', async () => { const s = await db.collection('attendance').get(); return s.docs.map(d => { const r=d.data(); return { chapter_id:CID, meeting_date:r.meetingDate||toDate(r.submittedAt)||new Date().toISOString().substring(0,10), logged_by:r.loggedBy||'', records:parseRecords(r.records), guests:parseRecords(r.guests) }; }); }],
    ['time_logs', async () => { const s = await db.collection('timeLogs').get(); return s.docs.map(d => { const r=d.data(); return { chapter_id:CID, meeting_date:r.meetingDate||new Date().toISOString().substring(0,10), logged_by:r.loggedBy||'', arrived_at:r.arrivedAt||'', called_to_order:r.calledToOrder||'', adjourned_at:r.adjournedAt||'', secs_per_member:r.secsPerMember||60, members_timed:r.membersTimed||'', quorum_met:r.quorumMet||'', notes:r.notes||'' }; }); }],
    ['referrals', async () => { const s = await db.collection('referrals').get(); return s.docs.map(d => { const r=d.data(); return { chapter_id:CID, type:r.type||'given', date:r.date||toDate(r.submittedAt)||new Date().toISOString().substring(0,10), logged_by:r.loggedBy||'', referred_to:r.referredTo||'', referred_by:r.referredBy||'', referred_person:r.referredPerson||'', referred_company:r.referredCompany||'', situation:r.situation||'', outcome:r.outcome||'Open' }; }); }],
    ['guests', async () => { const s = await db.collection('guests').get(); return s.docs.map(d => { const r=d.data(); return { chapter_id:CID, visit_date:r.visitDate||toDate(r.submittedAt)||new Date().toISOString().substring(0,10), logged_by:r.loggedBy||'', guest_name:r.guestName||'?', company:r.company||'', email:r.email||'', phone:r.phone||'', membership_interest:r.membershipInterest||'', outcome:r.outcome||'In pipeline' }; }); }],
    ['cross_chapter_visits', async () => { const s = await db.collection('crossChapterVisits').get(); return s.docs.map(d => { const r=d.data(); return { chapter_id:CID, visit_date:r.visitDate||new Date().toISOString().substring(0,10), logged_by:r.loggedBy||'', chapter_name:r.chapterName||'', commercial_rating:r.commercialRating||'', referral_received:r.referralReceived||'Not yet' }; }); }],
    ['one_on_ones', async () => { const s = await db.collection('oneOnOnes').get(); return s.docs.map(d => { const r=d.data(); return { chapter_id:CID, date:r.date||new Date().toISOString().substring(0,10), logged_by:r.loggedBy||'', met_with:r.metWith||'', specialty:r.specialty||'', location:r.location||'', key_takeaway:r.keyTakeaway||'', referral_trigger:r.referralTrigger||'', referral_opportunities:r.referralOpportunities||'', follow_up:r.followUp||'' }; }); }],
  ];
  for (const [table, fn] of collections) {
    const rows = await fn();
    if (rows.length) await supabaseInsert(table, rows);
    console.log(`  ${table}: ${rows.length} rows`);
  }
  console.log('\n Migration complete!\n');
}
migrate().catch(e => { console.error('Failed:', e.message); process.exit(1); });
