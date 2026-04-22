import { createHash } from 'node:crypto';
import { getAdminDb, getIngestSecret } from '../_lib/firebaseAdmin';
import { ApplicationStatus } from '../../types';

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

function normalizeText(value: unknown): string {
  return String(value || '').trim();
}

function normalizeStatus(value: unknown): ApplicationStatus {
  const raw = normalizeText(value).toLowerCase();

  if (!raw) return ApplicationStatus.DIKIRIM;
  if (['applied', 'dikirim', 'sent', 'submitted'].includes(raw)) return ApplicationStatus.DIKIRIM;
  if (['process', 'proses', 'interview', 'invitation', 'tes', 'test'].includes(raw)) return ApplicationStatus.PROSES;
  if (['tes selesai', 'test done', 'test complete', 'tes_selesai'].includes(raw)) return ApplicationStatus.TES_SELESAI;
  if (['offer', 'offered', 'tawaran'].includes(raw)) return ApplicationStatus.TAWARAN;
  if (['rejected', 'rejection', 'ditolak'].includes(raw)) return ApplicationStatus.DITOLAK;
  if (['wishlist'].includes(raw)) return ApplicationStatus.WISHLIST;

  return ApplicationStatus.DIKIRIM;
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

async function getNextApplicationNumber(): Promise<number> {
  const snap = await adminDb.collection('applications').orderBy('no', 'desc').limit(1).get();
  if (snap.empty) return 1;

  const current = Number(snap.docs[0].data()?.no || 0);
  return current + 1;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  }

  try {
    const adminDb = getAdminDb();
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

    const sourceKey = buildSourceKey(payload);
    const docId = `bot_${createHash('sha1').update(sourceKey).digest('hex')}`;
    const docRef = adminDb.collection('applications').doc(docId);
    const existingSnap = await docRef.get();
    const existingData = existingSnap.exists ? existingSnap.data() || {} : {};
    const nextNo = existingSnap.exists ? Number(existingData.no || 0) || await getNextApplicationNumber() : await getNextApplicationNumber();

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
    };

    await docRef.set(
      {
        ...existingData,
        ...record,
        createdAt: existingData.createdAt || new Date().toISOString(),
      },
      { merge: true },
    );

    return res.status(existingSnap.exists ? 200 : 201).json({
      ok: true,
      created: !existingSnap.exists,
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
