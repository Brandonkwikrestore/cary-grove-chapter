const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

initializeApp({ projectId: 'cary-grove-chapter' });
const db = getFirestore();

async function addMember() {
  const ref = await db.collection('members').add({
    name: 'Scot Bemus',
    specialty: 'Signs & Marketing',
    company: 'FastSigns',
    email: 'scot.bemus@fastsigns.com',
    phone: '779-220-4053',
  });
  console.log('Added Scot Bemus — doc ID:', ref.id);
}

addMember().catch(console.error);
