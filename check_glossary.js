import { MongoClient } from 'mongodb';

const uri = 'mongodb://yaidev:Yai%40Dev2025@192.167.4.7:28425/sophy?authSource=admin';

async function run() {
  const client = await MongoClient.connect(uri);
  const db = client.db('sophy');
  const col = db.collection('glossaryterms');
  
  // Test: Can we find "大货" or similar Chinese text → English?
  const testTexts = ['大货', '面线', '加裁', '波浪', '衬骨', 'seam allowance'];
  
  for (const text of testTexts) {
    const matches = await col.find({
      verificationStatus: 'verified',
      $or: [
        { source: text },
        { source: { $regex: text, $options: 'i' } }
      ]
    }).limit(3).toArray();
    
    console.log(`"${text}" → ${matches.length} matches:`);
    matches.forEach(m => console.log(`  "${m.source}" → "${m.target}" (${m.sourceLang}→${m.targetLang})`));
  }
  
  // Check some reverse matches (English source → Chinese target)
  const enTerms = await col.find({
    verificationStatus: 'verified',
    sourceLang: 'en',
    targetLang: { $regex: /^zh/ }
  }).limit(5).toArray();
  console.log('\nSample en→zh verified:');
  enTerms.forEach(t => console.log(`  "${t.source}" → "${t.target}"`));

  await client.close();
}

run().catch(err => console.error('Error:', err.message));
