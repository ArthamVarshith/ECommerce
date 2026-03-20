/**
 * Deploy Firestore security rules using the Firebase Admin SDK.
 *
 * Usage: node scripts/deployRules.mjs
 */

import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const keyPath = resolve(__dirname, "..", "serviceAccountKey.json");
const rulesPath = resolve(__dirname, "..", "firestore.rules");

let serviceAccount;
try {
    serviceAccount = JSON.parse(readFileSync(keyPath, "utf8"));
} catch {
    console.error("❌ serviceAccountKey.json not found.");
    process.exit(1);
}

const projectId = serviceAccount.project_id;
const rules = readFileSync(rulesPath, "utf8");

console.log(`\n🔒 Deploying Firestore security rules to project: ${projectId}\n`);

// Use REST API with the service account credentials
import { GoogleAuth } from "google-auth-library";

const auth = new GoogleAuth({
    credentials: serviceAccount,
    scopes: ["https://www.googleapis.com/auth/cloud-platform"],
});

const client = await auth.getClient();
const token = await client.getAccessToken();

const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery`;

// Deploy rules via Firebase Rules API
const rulesUrl = `https://firebaserules.googleapis.com/v1/projects/${projectId}/rulesets`;

const response = await fetch(rulesUrl, {
    method: "POST",
    headers: {
        Authorization: `Bearer ${token.token}`,
        "Content-Type": "application/json",
    },
    body: JSON.stringify({
        source: {
            files: [
                {
                    name: "firestore.rules",
                    content: rules,
                },
            ],
        },
    }),
});

if (!response.ok) {
    const error = await response.text();
    console.error("❌ Failed to create ruleset:", error);
    process.exit(1);
}

const ruleset = await response.json();
console.log(`✓ Ruleset created: ${ruleset.name}`);

// Release the ruleset
const releaseUrl = `https://firebaserules.googleapis.com/v1/projects/${projectId}/releases`;
const releaseResponse = await fetch(releaseUrl, {
    method: "POST",
    headers: {
        Authorization: `Bearer ${token.token}`,
        "Content-Type": "application/json",
    },
    body: JSON.stringify({
        name: `projects/${projectId}/releases/cloud.firestore`,
        rulesetName: ruleset.name,
    }),
});

// If release already exists, update it
if (releaseResponse.status === 409) {
    const patchUrl = `https://firebaserules.googleapis.com/v1/projects/${projectId}/releases/cloud.firestore`;
    const patchResponse = await fetch(patchUrl, {
        method: "PATCH",
        headers: {
            Authorization: `Bearer ${token.token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            release: {
                name: `projects/${projectId}/releases/cloud.firestore`,
                rulesetName: ruleset.name,
            },
        }),
    });

    if (!patchResponse.ok) {
        const error = await patchResponse.text();
        console.error("❌ Failed to update release:", error);
        process.exit(1);
    }
    console.log("✓ Rules released (updated existing)");
} else if (!releaseResponse.ok) {
    const error = await releaseResponse.text();
    console.error("❌ Failed to release ruleset:", error);
    process.exit(1);
} else {
    console.log("✓ Rules released");
}

console.log("\n✅ Firestore security rules deployed successfully!\n");
process.exit(0);
