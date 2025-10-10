export enum ApplicationStatus {
  DIKIRIM = 'Dikirim', // Corresponds to "Kirim CV"
  PROSES = 'Proses',
  TES_SELESAI = 'Tes Selesai', // Corresponds to "Selesai Tes"
  DITOLAK = 'Ditolak',
  TAWARAN = 'Tawaran',
  WISHLIST = 'Wishlist',
}

export interface Application {
  id: string;
  no: number;
  company: string;
  role: string;
  url:string;
  workSystem: string;
  location: string;
  platform: string;
  submissionDate: string; // Tanggal Submit
  status: ApplicationStatus; // Status Terbaru
  testDate?: string; // Tanggal Tes
  testStatus?: string; // Status Tes
  result?: string; // Hasil
  notes?: string; // Catatan
}
