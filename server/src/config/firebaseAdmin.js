import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { env } from './env.js';

/**
 * The Admin SDK needs a service account key, not the public web config used
 * by the frontend — those are different credentials. Get one from:
 * Firebase Console → Project Settings → Service Accounts → Generate New Private Key.
 * See server/.env.example for exactly where to put it.
 */
function loadCredential() {
  if (env.firebaseServiceAccountJson) {
    return admin.credential.cert(JSON.parse(env.firebaseServiceAccountJson));
  }
  if (env.firebaseServiceAccountPath) {
    const json = JSON.parse(readFileSync(env.firebaseServiceAccountPath, 'utf8'));
    return admin.credential.cert(json);
  }
  throw new Error(
    'Missing Firebase Admin credentials. Set FIREBASE_SERVICE_ACCOUNT_PATH or ' +
    'FIREBASE_SERVICE_ACCOUNT_JSON in server/.env — see server/.env.example and ' +
    'server/README.md for how to generate and place the service account key.'
  );
}

if (!admin.apps.length) {
  admin.initializeApp({ credential: loadCredential() });
}

export const db = admin.firestore();

// Firestore normally talks over gRPC, which holds persistent native (HTTP/2)
// connections open in the background. `node --watch` (used for local dev)
// restarts this process on every code change by killing it outright — on
// Windows, killing a process with open gRPC handles can hit a fatal native
// crash (a libuv assertion failure) instead of exiting cleanly, which
// `--watch` then reports as "Failed running... waiting for file changes".
// Forcing plain HTTPS/REST instead of gRPC avoids holding those native
// handles open at all, so there's nothing left to crash on restart.
db.settings({ preferRest: true });

export const auth = admin.auth();
export const FieldValue = admin.firestore.FieldValue;
export default admin;
