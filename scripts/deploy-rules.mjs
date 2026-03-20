import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleAuth } from 'google-auth-library';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ID = 'ecommerce-548ee';
const SA_KEY_PATH = path.resolve(__dirname, '..', 'serviceAccountKey.json');
const RULES_PATH = path.resolve(__dirname, '..', 'firestore.rules');

async function deployRules() {
    const rulesContent = fs.readFileSync(RULES_PATH, 'utf8');

    const auth = new GoogleAuth({
        keyFile: SA_KEY_PATH,
        scopes: ['https://www.googleapis.com/auth/cloud-platform', 'https://www.googleapis.com/auth/firebase'],
    });

    const client = await auth.getClient();
    const accessToken = (await client.getAccessToken()).token;

    const rulesUrl = `https://firebaserules.googleapis.com/v1/projects/${PROJECT_ID}/rulesets`;

    // Step 1: Create a new ruleset
    console.log('Creating ruleset...');
    const createResponse = await fetch(rulesUrl, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            source: {
                files: [{ name: 'firestore.rules', content: rulesContent }],
            },
        }),
    });

    if (!createResponse.ok) {
        const error = await createResponse.text();
        console.error('Failed to create ruleset:', createResponse.status, error);
        process.exit(1);
    }

    const ruleset = await createResponse.json();
    console.log('Created ruleset:', ruleset.name);

    // Step 2: Release to Firestore
    const releaseName = `projects/${PROJECT_ID}/releases/cloud.firestore`;
    const updateUrl = `https://firebaserules.googleapis.com/v1/${releaseName}`;

    console.log('Deploying to Firestore...');
    const updateResponse = await fetch(updateUrl, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            release: { name: releaseName, rulesetName: ruleset.name },
            updateMask: 'rulesetName',
        }),
    });

    if (updateResponse.ok) {
        console.log('✅ Firestore rules deployed successfully!');
        return;
    }

    // Fallback: create new release
    const releaseUrl = `https://firebaserules.googleapis.com/v1/projects/${PROJECT_ID}/releases`;
    const createReleaseResponse = await fetch(releaseUrl, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: releaseName, rulesetName: ruleset.name }),
    });

    if (!createReleaseResponse.ok) {
        const error = await createReleaseResponse.text();
        console.error('Failed to release:', createReleaseResponse.status, error);
        process.exit(1);
    }

    console.log('✅ Firestore rules deployed successfully!');
}

deployRules().catch((err) => {
    console.error('Deployment failed:', err.message);
    process.exit(1);
});
