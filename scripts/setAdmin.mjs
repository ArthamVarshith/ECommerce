/**
 * One-time script to set the admin custom claim on a Firebase user.
 *
 * Prerequisites:
 *   1. Download your service account key from Firebase Console →
 *      Project Settings → Service Accounts → "Generate new private key"
 *   2. Save it as `serviceAccountKey.json` in the project root
 *   3. Install firebase-admin: npm install firebase-admin --save-dev
 *
 * Usage:
 *   node scripts/setAdmin.mjs
 *
 * After running, sign out and sign back in to pick up the new claim.
 */

import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// ──────────────────────────────────────────────
// ⚠️  CHANGE THIS to your admin email address
// ──────────────────────────────────────────────
const ADMIN_EMAIL = "arthamvarshith@gmail.com";
// ──────────────────────────────────────────────

const __dirname = dirname(fileURLToPath(import.meta.url));
const keyPath = resolve(__dirname, "..", "serviceAccountKey.json");

let serviceAccount;
try {
    serviceAccount = JSON.parse(readFileSync(keyPath, "utf8"));
} catch {
    console.error(
        "❌ Could not find serviceAccountKey.json in the project root.\n" +
        "   Download it from Firebase Console → Project Settings → Service Accounts."
    );
    process.exit(1);
}

initializeApp({ credential: cert(serviceAccount) });

try {
    const user = await getAuth().getUserByEmail(ADMIN_EMAIL);
    await getAuth().setCustomUserClaims(user.uid, { role: "admin" });

    console.log(`\n✅ Admin role successfully set!`);
    console.log(`   Email : ${ADMIN_EMAIL}`);
    console.log(`   UID   : ${user.uid}`);
    console.log(`\n⚡ Sign out and sign back in to activate the admin role.\n`);
} catch (error) {
    console.error(`\n❌ Failed to set admin role for "${ADMIN_EMAIL}":`, error.message);
    process.exit(1);
}

process.exit(0);
