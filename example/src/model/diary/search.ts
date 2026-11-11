import { ABNORMAL_SYMPTOMS, OTHER_SYMPTOM, type DiaryOption } from './abnormal';
import { BEHAVIOR_TEXT, behaviorOptions, otherBehaviorCode } from './behavior';
import { MEDICAL_CUSTOM_CODE, MEDICAL_SUBJECTS, MEDICAL_TEXT } from './medical';

export type SearchKind = 'symptom' | 'medical' | 'behavior';

export interface SearchSource {
  title: string;
  items: DiaryOption[];
  emptyDescription: string;
  fallback: { code: string; buttonLabel: string };
  custom?: { code: string; label: string; hint: string; fallbackName: string };
}

export const SEARCH_SOURCES: Record<SearchKind, SearchSource> = {
  symptom: {
    title: '이상 증상',
    items: ABNORMAL_SYMPTOMS,
    emptyDescription: '검색어를 변경하거나 기타 증상으로 등록해주세요.',
    fallback: { code: OTHER_SYMPTOM, buttonLabel: '"기타 증상"으로 등록' },
  },
  medical: {
    title: MEDICAL_TEXT.subject,
    items: MEDICAL_SUBJECTS,
    emptyDescription: '검색어를 변경하거나 기타 (직접입력)로 등록해주세요.',
    fallback: { code: MEDICAL_CUSTOM_CODE, buttonLabel: '"기타 (직접입력)"로 등록' },
    custom: { code: MEDICAL_CUSTOM_CODE, label: MEDICAL_TEXT.subject, hint: MEDICAL_TEXT.customHint, fallbackName: MEDICAL_TEXT.customFallback },
  },
  behavior: {
    title: BEHAVIOR_TEXT.behavior,
    items: behaviorOptions(),
    emptyDescription: BEHAVIOR_TEXT.searchEmptyDescription,
    fallback: { code: otherBehaviorCode(), buttonLabel: BEHAVIOR_TEXT.searchFallback },
  },
};

export const encodePicked = (source: SearchSource, code: string, name: string): string => (source.custom ? JSON.stringify({ code, name }) : code);

export const SEARCH_TEXT = {
  input: '검색어 입력',
  emptyTitle: '검색된 정보가 없어요.',
};

const normalize = (text: string) => text.replace(/\s/g, '').toLowerCase();
export const filterOptions = (items: DiaryOption[], query: string): DiaryOption[] => {
  const keyword = normalize(query);
  return keyword ? items.filter((item) => normalize(item.label).includes(keyword)) : items;
};
