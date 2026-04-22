import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

type ServiceAccount = {
  projectId: string;
  clientEmail: string;
  privateKey: string;
};

function readServiceAccountFromEnv(): ServiceAccount {
  const rawJson = process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON?.trim();
  if (rawJson) {
    const parsed = JSON.parse(rawJson);
    return {
      projectId: parsed.project_id || parsed.projectId,
      clientEmail: parsed.client_email || parsed.clientEmail,
      privateKey: String(parsed.private_key || parsed.privateKey || '').replace(/\\n/g, '\n'),
    };
  }

  return {
    projectId: String(process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID || ''),
    clientEmail: String(process.env.FIREBASE_ADMIN_CLIENT_EMAIL || ''),
    privateKey: String(process.env.FIREBASE_ADMIN_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
  };
}

function validateServiceAccount(serviceAccount: ServiceAccount) {
  const missing = [
    !serviceAccount.projectId && 'FIREBASE_ADMIN_PROJECT_ID',
    !serviceAccount.clientEmail && 'FIREBASE_ADMIN_CLIENT_EMAIL',
    !serviceAccount.privateKey && 'FIREBASE_ADMIN_PRIVATE_KEY',
  ].filter(Boolean);

  if (missing.length > 0) {
    throw new Error(`Firebase Admin env belum lengkap: ${missing.join(', ')}`);
  }
}

function getAdminApp() {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const serviceAccount = readServiceAccountFromEnv();
  validateServiceAccount(serviceAccount);

  return initializeApp({
    credential: cert(serviceAccount),
  });
}

export const adminDb = getFirestore(getAdminApp());

export function getIngestSecret(): string {
  return String(process.env.TRACK_INGEST_SECRET || '').trim();
}
