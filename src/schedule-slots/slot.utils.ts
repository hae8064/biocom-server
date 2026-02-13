export const SLOT_DURATION_MINUTES = 30;
export const KST_OFFSET = '+09:00';

/**
 * KST(한국 표준시) 문자열을 Date로 변환.
 * 타임존 없이 전달된 경우(예: 2025-02-15T09:00:00) KST로 해석.
 */
export function parseKstToDate(value: string): Date {
  const trimmed = value.trim();
  const hasOffset = /[+-]\d{2}:\d{2}$/.test(trimmed) || trimmed.endsWith('Z');
  const toParse = hasOffset ? trimmed : `${trimmed}${KST_OFFSET}`;
  const date = new Date(toParse);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`잘못된 날짜 형식입니다: ${value}`);
  }
  return date;
}

/** startAt으로부터 endAt 계산 (30분 후) */
export function computeEndAt(startAt: Date): Date {
  return new Date(startAt.getTime() + SLOT_DURATION_MINUTES * 60 * 1000);
}

/** Date를 KST ISO 문자열로 변환 - common/utils/date.utils에서 재export */
export { formatDateToKst } from '../common/utils/date.utils';

/** 30분 단위로 정렬되어 있는지 확인 (분이 0 또는 30, 초/밀리초 0) */
export function isAlignedTo30Min(date: Date): boolean {
  const minutes = date.getUTCMinutes();
  const seconds = date.getUTCSeconds();
  const ms = date.getUTCMilliseconds();
  return (minutes === 0 || minutes === 30) && seconds === 0 && ms === 0;
}

/** 두 시각의 차이가 정확히 30분인지 확인 */
export function isExactly30Minutes(start: Date, end: Date): boolean {
  const diffMs = end.getTime() - start.getTime();
  return diffMs === SLOT_DURATION_MINUTES * 60 * 1000;
}

export function validate30MinSlot(startAt: Date, endAt: Date): void {
  if (!isAlignedTo30Min(startAt)) {
    throw new Error(
      'startAt은 KST 기준 30분 단위(00분 또는 30분)로 설정해야 합니다. (예: 09:00, 09:30)',
    );
  }
  if (!isAlignedTo30Min(endAt)) {
    throw new Error(
      'endAt은 KST 기준 30분 단위(00분 또는 30분)로 설정해야 합니다.',
    );
  }
  if (!isExactly30Minutes(startAt, endAt)) {
    throw new Error(`슬롯은 정확히 ${SLOT_DURATION_MINUTES}분이어야 합니다.`);
  }
  if (endAt.getTime() <= startAt.getTime()) {
    throw new Error('endAt은 startAt보다 이후여야 합니다.');
  }
}
