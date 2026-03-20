import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleAuth } from 'google-auth-library';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ID = 'ecommerce-548ee';
const SA_KEY_PATH = path.resolve(__dirname, '..', 'serviceAccountKey.json');
const INDEXES_PATH = path.resolve(__dirname, '..', 'firestore.indexes.json');

async function deployIndexes() {
    const indexesConfig = JSON.parse(fs.readFileSync(INDEXES_PATH, 'utf8'));

    const auth = new GoogleAuth({
        keyFile: SA_KEY_PATH,
        scopes: ['https://www.googleapis.com/auth/cloud-platform', 'https://www.googleapis.com/auth/datastore'],
    });

    const client = await auth.getClient();
    const accessToken = (await client.getAccessToken()).token;

    const baseUrl = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/collectionGroups`;

    // First, list existing indexes to avoid duplicates
    console.log('Fetching existing indexes...');
    const listUrl = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/collectionGroups/-/indexes`;
    const listRes = await fetch(listUrl, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
    });

    let existingIndexes = [];
    if (listRes.ok) {
        const data = await listRes.json();
        existingIndexes = data.indexes || [];
    }

    // Helper to check if an index already exists
    function indexExists(newIndex) {
        return existingIndexes.some(existing => {
            if (!existing.fields) return false;
            const existingCollection = existing.name?.split('/collectionGroups/')[1]?.split('/')[0];
            if (existingCollection !== newIndex.collectionGroup) return false;
            if (existing.fields.length !== newIndex.fields.length) return false;
            return newIndex.fields.every((f, i) => {
                const ef = existing.fields[i];
                return ef.fieldPath === f.fieldPath &&
                    (ef.order === f.order || (!ef.order && !f.order));
            });
        });
    }

    let created = 0;
    let skipped = 0;

    for (const index of indexesConfig.indexes) {
        if (indexExists(index)) {
            console.log(`⏭  Index for ${index.collectionGroup} already exists, skipping`);
            skipped++;
            continue;
        }

        const url = `${baseUrl}/${index.collectionGroup}/indexes`;
        const body = {
            queryScope: index.queryScope || 'COLLECTION',
            fields: index.fields.map(f => ({
                fieldPath: f.fieldPath,
                order: f.order || undefined,
                arrayConfig: f.arrayConfig || undefined,
            })),
        };

        console.log(`Creating index for ${index.collectionGroup}: ${index.fields.map(f => f.fieldPath).join(', ')}...`);

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (response.ok) {
            const result = await response.json();
            console.log(`  ✅ Created (building): ${result.name}`);
            created++;
        } else {
            const error = await response.text();
            if (error.includes('already exists')) {
                console.log(`  ⏭  Already exists`);
                skipped++;
            } else {
                console.error(`  ❌ Failed: ${response.status} ${error}`);
            }
        }
    }

    console.log(`\nDone! Created: ${created}, Skipped: ${skipped}`);
    if (created > 0) {
        console.log('⚠️  New indexes may take a few minutes to build. Queries using them will work once building completes.');
    }
}

deployIndexes().catch((err) => {
    console.error('Index deployment failed:', err.message);
    process.exit(1);
});
