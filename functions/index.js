const { onCall } = require('firebase-functions/v2/https');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

initializeApp();
const db = getFirestore();

function ts() { return new Date().toISOString(); }

// ── ATTENDANCE ────────────────────────────────────────────────
exports.submitAttendance = onCall({ region: 'us-central1' }, async (request) => {
  try {
    const d = request.data;
    const ref = await db.collection('attendance').add({
      meetingDate: d.meetingDate || '',
      loggedBy:    d.loggedBy   || '',
      records:     d.records    || '[]',
      guests:      d.guests     || '[]',
      submittedAt: ts(),
    });
    return { success: true, id: ref.id };
  } catch(e) { return { success: false, error: e.message }; }
});

// ── TIME LOG ──────────────────────────────────────────────────
exports.submitTimeLog = onCall({ region: 'us-central1' }, async (request) => {
  try {
    const d = request.data;
    const ref = await db.collection('timeLogs').add({
      meetingDate:   d.meetingDate   || '',
      loggedBy:      d.loggedBy      || '',
      arrivedAt:     d.arrivedAt     || '',
      calledToOrder: d.calledToOrder || '',
      adjournedAt:   d.adjournedAt   || '',
      secsPerMember: d.secsPerMember || 60,
      membersTimed:  d.membersTimed  || '',
      quorumMet:     d.quorumMet     || '',
      notes:         d.notes         || '',
      submittedAt:   ts(),
    });
    return { success: true, id: ref.id };
  } catch(e) { return { success: false, error: e.message }; }
});

// ── REFERRAL GIVEN ────────────────────────────────────────────
exports.submitReferralGiven = onCall({ region: 'us-central1' }, async (request) => {
  try {
    const d = request.data;
    const ref = await db.collection('referrals').add({
      type:            'given',
      date:            d.date            || '',
      loggedBy:        d.loggedBy        || '',
      referredTo:      d.referredTo      || '',
      referredPerson:  d.referredPerson  || '',
      referredCompany: d.referredCompany || '',
      situation:       d.situation       || '',
      followUpDate:    d.followUpDate    || '',
      outcome:         d.outcome         || 'Open',
      submittedAt:     ts(),
    });
    return { success: true, id: ref.id };
  } catch(e) { return { success: false, error: e.message }; }
});

// ── REFERRAL RECEIVED ─────────────────────────────────────────
exports.submitReferralReceived = onCall({ region: 'us-central1' }, async (request) => {
  try {
    const d = request.data;
    const ref = await db.collection('referrals').add({
      type:            'received',
      date:            d.date            || '',
      loggedBy:        d.loggedBy        || '',
      referredBy:      d.referredBy      || '',
      referredPerson:  d.referredPerson  || '',
      referredCompany: d.referredCompany || '',
      situation:       d.situation       || '',
      followedUp:      d.followedUp      || '',
      outcome:         d.outcome         || 'Open',
      submittedAt:     ts(),
    });
    return { success: true, id: ref.id };
  } catch(e) { return { success: false, error: e.message }; }
});

// ── GUEST VISIT ───────────────────────────────────────────────
exports.submitGuestVisit = onCall({ region: 'us-central1' }, async (request) => {
  try {
    const d = request.data;
    const ref = await db.collection('guests').add({
      visitDate:            d.visitDate            || '',
      loggedBy:             d.loggedBy             || '',
      guestName:            d.guestName            || '',
      company:              d.company              || '',
      title:                d.title                || '',
      email:                d.email                || '',
      phone:                d.phone                || '',
      secondVisitDate:      d.secondVisitDate      || '',
      membershipInterest:   d.membershipInterest   || '',
      followUp:             d.followUp             || '',
      referredToMembership: d.referredToMembership || '',
      outcome:              d.outcome              || 'In pipeline',
      submittedAt:          ts(),
    });
    return { success: true, id: ref.id };
  } catch(e) { return { success: false, error: e.message }; }
});

// ── CROSS-CHAPTER ─────────────────────────────────────────────
exports.submitCrossChapter = onCall({ region: 'us-central1' }, async (request) => {
  try {
    const d = request.data;
    const ref = await db.collection('crossChapterVisits').add({
      visitDate:         d.visitDate         || '',
      loggedBy:          d.loggedBy          || '',
      chapterName:       d.chapterName       || '',
      chapterContact:    d.chapterContact    || '',
      membersPresent:    d.membersPresent    || '',
      commercialRating:  d.commercialRating  || '',
      newConnections:    d.newConnections    || '',
      referralPotential: d.referralPotential || '',
      bestPractice:      d.bestPractice      || '',
      followUp:          d.followUp          || '',
      referralReceived:  d.referralReceived  || 'Not yet',
      submittedAt:       ts(),
    });
    return { success: true, id: ref.id };
  } catch(e) { return { success: false, error: e.message }; }
});

// ── ONE-ON-ONE ────────────────────────────────────────────────
exports.submitOneOnOne = onCall({ region: 'us-central1' }, async (request) => {
  try {
    const d = request.data;
    const ref = await db.collection('oneOnOnes').add({
      date:                  d.date                  || '',
      loggedBy:              d.loggedBy              || '',
      metWith:               d.metWith               || '',
      specialty:             d.specialty             || '',
      location:              d.location              || '',
      keyTakeaway:           d.keyTakeaway           || '',
      referralTrigger:       d.referralTrigger       || '',
      referralOpportunities: d.referralOpportunities || '',
      followUp:              d.followUp              || '',
      submittedAt:           ts(),
    });
    return { success: true, id: ref.id };
  } catch(e) { return { success: false, error: e.message }; }
});

// ── GET MEMBERS ───────────────────────────────────────────────
exports.getMembers = onCall({ region: 'us-central1' }, async (request) => {
  try {
    const snap = await db.collection('members').orderBy('name').get();
    return JSON.stringify(snap.docs.map(d => d.data()));
  } catch(e) { return JSON.stringify([]); }
});
