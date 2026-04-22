import { createHash } from 'node:crypto';
import { getIngestSecret } from '../_lib/firebaseAdmin';

const APPLICATION_STATUS = {
  DIKIRIM: 'Dikirim',
  PROSES: 'Proses',
  TES_SELESAI: 'Tes Selesai',
  DITOLAK: 'Ditolak',
  TAWARAN: 'Tawaran',
  WISHLIST: 'Wishlist',
} as const;

type ApplicationStatus = (typeof APPLICATION_STATUS)[keyof typeof APPLICATION_STATUS];

type IngestPayload = {
  secret?: string;
  company?: string;
  position?: string;
  role?: string;
  location?: string;
  platform?: string;
  job_url?: string;
  url?: string;
  status?: string;
  notes?: string;
  applied_at?: string;
  submissionDate?: string;
  source?: string;
  email_type?: string;
  local_id?: string | number;
  source_key?: string;
  work_system?: string;
  workSystem?: string;
};

type FirestoreFields = Record<string, any>;

function normalizeText(value: unknown): string {
  return String(value || '').trim();
}

function normalizeStatus(value: unknown): ApplicationStatus {
  const raw = normalizeText(value).toLowerCase();

  if (!raw) return APPLICATION_STATUS.DIKIRIM;
  if (['applied', 'dikirim', 'sent', 'submitted'].includes(raw)) return APPLICATION_STATUS.DIKIRIM;
  if (['process', 'proses', 'interview', 'invitation', 'tes', 'test'].includes(raw)) return APPLICATION_STATUS.PROSES;
  if (['tes selesai', 'test done', 'test complete', 'tes_selesai'].includes(raw)) return APPLICATION_STATUS.TES_SELESAI;
  if (['offer', 'offered', 'tawaran'].includes(raw)) return APPLICATION_STATUS.TAWARAN;
  if (['rejected', 'rejection', 'ditolak'].includes(raw)) return APPLICATION_STATUS.DITOLAK;
  if (['wishlist'].includes(raw)) return APPLICATION_STATUS.WISHLIST;

  return APPLICATION_STATUS.DIKIRIM;
}

function toIsoDate(value: unknown): string {
  const raw = normalizeText(value);
  if (!raw) return new Date().toISOString();

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) {
    return new Date().toISOString();
  }
  return parsed.toISOString();
}

function parsePayload(body: unknown): IngestPayload {
  if (!body) return {};
  if (typeof body === 'string') {
    try {
      return JSON.parse(body);
    } catch {
      return {};
    }
  }
  return body as IngestPayload;
}

function readIncomingSecret(req: any, payload: IngestPayload): string {
  const authHeader = String(req.headers?.authorization || '');
  if (authHeader.toLowerCase().startsWith('bearer ')) {
    return authHeader.slice(7).trim();
  }
  return normalizeText(payload.secret);
}

function buildSourceKey(payload: IngestPayload): string {
  const explicit = normalizeText(payload.source_key);
  if (explicit) return explicit;

  const composite = [
    normalizeText(payload.local_id),
    normalizeText(payload.company),
    normalizeText(payload.position || payload.role),
    normalizeText(payload.applied_at || payload.submissionDate),
    normalizeText(payload.job_url || payload.url),
  ]
    .filter(Boolean)
    .join('|');

  return composite || `${Date.now()}`;
}

function getFirestoreConfig() {
  const projectId = normalizeText(process.env.VITE_FIREBASE_PROJECT_ID);
  const apiKey = normalizeText(process.env.VITE_FIREBASE_API_KEY);

  if (!projectId || !apiKey) {
    throw new Error('missing_firestore_client_env');
  }

  const documentsBase = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;
  return { projectId, apiKey, documentsBase };
}

async function firestoreFetchJson(url: string, init?: RequestInit) {
  const response = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  });

  const text = await response.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }

  if (!response.ok) {
    const message =
      data?.error?.message ||
      data?.error ||
      text ||
      `firestore_http_${response.status}`;
    throw new Error(message);
  }

  return data;
}

function encodeFirestoreValue(value: any): any {
  if (value === null || value === undefined || value === '') {
    return { nullValue: null };
  }
  if (typeof value === 'string') {
    return { stringValue: value };
  }
  if (typeof value === 'boolean') {
    return { booleanValue: value };
  }
  if (typeof value === 'number') {
    if (Number.isInteger(value)) {
      return { integerValue: String(value) };
    }
    return { doubleValue: value };
  }
  return { stringValue: String(value) };
}

function decodeFirestoreValue(value: any): any {
  if (!value || typeof value !== 'object') return null;
  if ('stringValue' in value) return value.stringValue;
  if ('integerValue' in value) return Number(value.integerValue);
  if ('doubleValue' in value) return Number(value.doubleValue);
  if ('booleanValue' in value) return Boolean(value.booleanValue);
  if ('timestampValue' in value) return value.timestampValue;
  if ('nullValue' in value) return null;
  return null;
}

function decodeFirestoreFields(fields: FirestoreFields | undefined): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(fields || {})) {
    result[key] = decodeFirestoreValue(value);
  }
  return result;
}

function encodeFirestoreFields(data: Record<string, any>): FirestoreFields {
  const fields: FirestoreFields = {};
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined) continue;
    fields[key] = encodeFirestoreValue(value);
  }
  return fields;
}

async function getExistingDocument(docUrl: string, apiKey: string) {
  try {
    return await firestoreFetchJson(`${docUrl}?key=${apiKey}`);
  } catch (error: any) {
    const message = String(error?.message || error);
    if (message.includes('Requested entity was not found')) {
      return null;
    }
    throw error;
  }
}

async function getNextApplicationNumber(documentsBase: string, apiKey: string): Promise<number> {
  const data = await firestoreFetchJson(`${documentsBase}:runQuery?key=${apiKey}`, {
    method: 'POST',
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId: 'applications' }],
        orderBy: [{ field: { fieldPath: 'no' }, direction: 'DESCENDING' }],
        limit: 1,
      },
    }),
  });

  if (!Array.isArray(data) || data.length === 0 || !data[0]?.document?.fields?.no) {
    return 1;
  }

  const current = Number(decodeFirestoreValue(data[0].document.fields.no) || 0);
  return current + 1;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  }

  try {
    const expectedSecret = getIngestSecret();
    if (!expectedSecret) {
      return res.status(500).json({ ok: false, error: 'missing_server_secret' });
    }

    const payload = parsePayload(req.body);
    const incomingSecret = readIncomingSecret(req, payload);
    if (!incomingSecret || incomingSecret !== expectedSecret) {
      return res.status(401).json({ ok: false, error: 'unauthorized' });
    }

    const company = normalizeText(payload.company);
    const role = normalizeText(payload.position || payload.role);
    if (!company || !role) {
      return res.status(400).json({ ok: false, error: 'company_and_position_required' });
    }

    const { apiKey, documentsBase } = getFirestoreConfig();
    const sourceKey = buildSourceKey(payload);
    const docId = `bot_${createHash('sha1').update(sourceKey).digest('hex')}`;
    const docUrl = `${documentsBase}/applications/${docId}`;

    const existingDoc = await getExistingDocument(docUrl, apiKey);
    const existingData = decodeFirestoreFields(existingDoc?.fields);
    const nextNo = existingDoc
      ? Number(existingData.no || 0) || (await getNextApplicationNumber(documentsBase, apiKey))
      : await getNextApplicationNumber(documentsBase, apiKey);

    const submissionDate = toIsoDate(payload.applied_at || payload.submissionDate);
    const status = normalizeStatus(payload.status);

    const record = {
      no: nextNo,
      company,
      role,
      url: normalizeText(payload.job_url || payload.url),
      workSystem: normalizeText(payload.work_system || payload.workSystem) || 'On-site',
      location: normalizeText(payload.location),
      platform: normalizeText(payload.platform) || 'Email',
      submissionDate,
      status,
      notes: normalizeText(payload.notes),
      source: normalizeText(payload.source) || 'bot',
      sourceKey,
      emailType: normalizeText(payload.email_type),
      localId: normalizeText(payload.local_id),
      rawStatus: normalizeText(payload.status),
      syncedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdAt: existingData.createdAt || new Date().toISOString(),
      testDate: existingData.testDate || '',
      testStatus: existingData.testStatus || '',
      result: existingData.result || '',
    };

    const firestoreBody = {
      fields: encodeFirestoreFields({
        ...existingData,
        ...record,
      }),
    };

    await firestoreFetchJson(`${docUrl}?key=${apiKey}`, {
      method: 'PATCH',
      body: JSON.stringify(firestoreBody),
    });

    return res.status(existingDoc ? 200 : 201).json({
      ok: true,
      created: !existingDoc,
      id: docId,
      no: nextNo,
    });
  } catch (error: any) {
    return res.status(500).json({
      ok: false,
      error: error?.message || 'internal_error',
    });
  }
}
