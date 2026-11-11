import type { MediaItem } from './common';

export type PoopeeKind = 'urine' | 'feces' | 'shape';

export interface PoopeeOption {
  code: string;
  label: string;
  description: string;
}

export interface PoopeeKindMeta {
  title: string;
  addLabel: string;
  options: readonly PoopeeOption[];
}

export const POOPEE_KINDS: readonly PoopeeKind[] = ['urine', 'feces', 'shape'];

export const POOPEE: Record<PoopeeKind, PoopeeKindMeta> = {
  urine: {
    title: '소변 색',
    addLabel: '소변 기록 추가',
    options: [
      { code: '투명한 노랑', label: '투명한 노랑', description: '건강한 일반 소변' },
      { code: '진노란색', label: '진노란색', description: '수분 섭취가 다소 부족하여 나타날 수 있는 색상입니다.' },
      { code: '주황색', label: '주황색', description: '나트륨 섭취가 과다할 때 나타날 수 있으며, 간이나 담즙 이상 가능성이 있습니다.' },
      { code: '분홍색', label: '분홍색', description: '혈뇨의 일종으로 신장질환 또는 염증 가능성이 있습니다.' },
      { code: '붉은색', label: '붉은색', description: '혈뇨로 요로감염, 신부전 등이 원인이 될 수 있습니다.' },
      { code: '진한 갈색', label: '진한 갈색', description: '사구체 질환이 있을 때 나타날 수 있습니다.' },
      { code: '검은색', label: '검은색', description: '신증후군, 선천성 신장 기형, 요로 기형 등의 원인일 수 있습니다.' },
      { code: '푸른색', label: '푸른색', description: '섭취한 음식의 색소로 인해 나타날 수 있으며, 지속될 경우 병원 검사를 권장합니다.' },
    ],
  },
  feces: {
    title: '대변 색',
    addLabel: '대변 기록 추가',
    options: [
      { code: '초콜릿색', label: '초콜릿색', description: '정상적인 건강한 대변 색상입니다.' },
      { code: '녹색', label: '녹색', description: '소화가 덜 된 경우 나타날 수 있으며, 빠른 장 통과가 원인일 수 있습니다.' },
      { code: '노란색', label: '노란색', description: '지방 흡수 장애나 장내 세균 이상이 있을 때 나타날 수 있습니다.' },
      { code: '피 섞인 변', label: '피 섞인 변', description: '출혈로 인해 나타날 수 있으며, 즉각적인 정밀 검사를 권장합니다.' },
      { code: '검은색', label: '검은색', description: '위장 출혈로 인해 나타날 수 있는 색상입니다.' },
      { code: '보라색', label: '보라색', description: '희귀한 사례로 음식 색소나 특정 질환과 관련이 있을 수 있습니다.' },
    ],
  },
  shape: {
    title: '대변모양',
    addLabel: '대변 모양 추가',
    options: [
      { code: '정상변1', label: '정상변1', description: '단단한 정상변 모양' },
      { code: '정상변2', label: '정상변2', description: '단단한 정상변 모양' },
      { code: '설사1', label: '설사1', description: '물이 많은 설사변 모양' },
      { code: '설사2', label: '설사2', description: '물이 많은 설사변 모양' },
      { code: '설사3', label: '설사3', description: '물이 많은 설사변 모양' },
      { code: '설사4', label: '설사4', description: '물이 많은 설사변 모양' },
      { code: '건조1', label: '건조1', description: '건조하고 갈라지는변 모양' },
    ],
  },
};

export const findPoopeeOption = (kind: PoopeeKind, code: string | null): PoopeeOption | undefined =>
  code === null ? undefined : POOPEE[kind].options.find((option) => option.code === code);

export interface PoopeeValues {
  urine: string | null;
  feces: string | null;
  shape: string | null;
  media: MediaItem[];
}

export const EMPTY_POOPEE: PoopeeValues = { urine: null, feces: null, shape: null, media: [] };
