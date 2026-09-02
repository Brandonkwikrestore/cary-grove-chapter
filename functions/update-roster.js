const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

initializeApp({ projectId: 'cary-grove-chapter' });
const db = getFirestore();
const members = db.collection('members');

const ADDITIONS = [
  { name: 'Roman Corrado', specialty: 'Electrical', company: 'Corrado Electric LLC' },
  { name: 'Jackson Ramboldt', specialty: 'Auto Repair', company: 'Tuffy Tire & Auto Service' },
];

const DENNIS_TITLE = 'Small Business Banking Officer';

const REMOVALS = ['Theresa Lustig', 'Jim Heim', 'Sean Fergus'];

async function findByName(name) {
  const snap = await members.where('name', '==', name).get();
  return snap.docs;
}

async function run() {
  // Verify Scot Bemus and Dennis Grabowski before doing anything else.
  const scotDocs = await findByName('Scot Bemus');
  console.log(`Scot Bemus: ${scotDocs.length} doc(s) found`);

  const dennisDocs = await findByName('Dennis Grabowski');
  console.log(`Dennis Grabowski: ${dennisDocs.length} doc(s) found`);

  // Additions — skip if a doc with that name already exists.
  for (const member of ADDITIONS) {
    const existing = await findByName(member.name);
    if (existing.length) {
      console.log(`Skip add ${member.name} — already exists (${existing.length} doc(s))`);
      continue;
    }
    const ref = await members.add(member);
    console.log(`Added ${member.name} — doc ID: ${ref.id}`);
  }

  // Update Dennis Grabowski's title/role field.
  if (dennisDocs.length) {
    for (const doc of dennisDocs) {
      await doc.ref.update({ title: DENNIS_TITLE });
      console.log(`Updated ${doc.id} — title: ${DENNIS_TITLE}`);
    }
  } else {
    console.log('Dennis Grabowski not found — no title update applied. Create the doc first.');
  }

  // Deletions.
  for (const name of REMOVALS) {
    const docs = await findByName(name);
    if (!docs.length) {
      console.log(`Skip delete ${name} — no doc found`);
      continue;
    }
    for (const doc of docs) {
      await doc.ref.delete();
      console.log(`Deleted ${name} — doc ID: ${doc.id}`);
    }
  }

  console.log('Roster update complete.');
}

run().catch((e) => {
  console.error('Roster update failed:', e.message);
  process.exit(1);
});
