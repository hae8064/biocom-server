/**
 * Date를 KST(한국 표준시, UTC+9) ISO 문자열로 변환.
 * 모든 API 응답에서 날짜/시간을 한국 시간으로 통일할 때 사용.
 *
 * @param date 변환할 Date (내부적으로 UTC 기준)
 * @returns ISO 8601 형식 KST 문자열 (예: 2026-02-13T12:30:00+09:00)
 */
export function formatDateToKst(date: Date): string {
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) {
    throw new Error('유효하지 않은 Date입니다.');
  }
  // KST = UTC+9: UTC 시각에 9시간을 더한 후 UTC 컴포넌트를 읽으면 KST 값이 됨
  const kst = new Date(d.getTime() + 9 * 60 * 60 * 1000);
  const pad = (n: number) => n.toString().padStart(2, '0');
  const year = kst.getUTCFullYear();
  const month = pad(kst.getUTCMonth() + 1);
  const day = pad(kst.getUTCDate());
  const hour = pad(kst.getUTCHours());
  const minute = pad(kst.getUTCMinutes());
  const second = pad(kst.getUTCSeconds());
  return `${year}-${month}-${day}T${hour}:${minute}:${second}+09:00`;
}
