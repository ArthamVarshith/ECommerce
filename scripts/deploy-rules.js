/**
 * Deploy Firestore security rules using the Firebase REST API
 * with the service account key.
 */
const fs = require('fs');
const path = require('path');
const { GoogleAuth } = require('google-auth-library');

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

    // Use the Firestore REST API to deploy rules
    const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents:runQuery`;

    // Actually, we need to use the Firebase Rules API
    const rulesUrl = `https://firebaserules.googleapis.com/v1/projects/${PROJECT_ID}/rulesets`;

    // Step 1: Create a new ruleset
    const createResponse = await fetch(rulesUrl, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            source: {
                files: [
                    {
                        name: 'firestore.rules',
                        content: rulesContent,
                    },
                ],
            },
        }),
    });

    if (!createResponse.ok) {
        const error = await createResponse.text();
        console.error('Failed to create ruleset:', error);
        process.exit(1);
    }

    const ruleset = await createResponse.json();
    console.log('Created ruleset:', ruleset.name);

    // Step 2: Release the ruleset to Firestore
    const releaseUrl = `https://firebaserules.googleapis.com/v1/projects/${PROJECT_ID}/releases`;
    const releaseName = `projects/${PROJECT_ID}/releases/cloud.firestore`;

    // Try to update existing release first
    const updateUrl = `https://firebaserules.googleapis.com/v1/${releaseName}`;
    const updateResponse = await fetch(updateUrl, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            release: {
                name: releaseName,
                rulesetName: ruleset.name,
            },
            updateMask: 'rulesetName',
        }),
    });

    if (updateResponse.ok) {
        console.log('✅ Firestore rules deployed successfully!');
        return;
    }

    // If update fails, try creating a new release
    const createReleaseResponse = await fetch(releaseUrl, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            name: releaseName,
            rulesetName: ruleset.name,
        }),
    });

    if (!createReleaseResponse.ok) {
        const error = await createReleaseResponse.text();
        console.error('Failed to release ruleset:', error);
        process.exit(1);
    }

    console.log('✅ Firestore rules deployed successfully!');
}

deployRules().catch((err) => {
    console.error('Deployment failed:', err.message);
    process.exit(1);
});
