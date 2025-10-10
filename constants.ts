
import { ApplicationStatus } from './types';

export const STATUS_COLORS: Record<ApplicationStatus, { base: string; background: string }> = {
  [ApplicationStatus.WISHLIST]: { base: 'text-gray-600 bg-gray-200 dark:text-gray-300 dark:bg-gray-700', background: 'bg-gray-100' },
  [ApplicationStatus.DIKIRIM]: { base: 'text-blue-600 bg-blue-200 dark:text-blue-300 dark:bg-blue-700', background: 'bg-blue-100' },
  [ApplicationStatus.PROSES]: { base: 'text-yellow-600 bg-yellow-200 dark:text-yellow-300 dark:bg-yellow-700', background: 'bg-yellow-100' },
  [ApplicationStatus.TES_SELESAI]: { base: 'text-purple-600 bg-purple-200 dark:text-purple-300 dark:bg-purple-700', background: 'bg-purple-100' },
  [ApplicationStatus.TAWARAN]: { base: 'text-green-600 bg-green-200 dark:text-green-300 dark:bg-green-700', background: 'bg-green-100' },
  [ApplicationStatus.DITOLAK]: { base: 'text-red-600 bg-red-200 dark:text-red-300 dark:bg-red-700', background: 'bg-red-100' },
};
