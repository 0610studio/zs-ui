import { Z_INDEX_VALUE } from '../../model/utils';

describe('Z_INDEX_VALUE', () => {
  it('키보드 위 포털 < 스낵바 < 진행 표시 순으로 쌓는다', () => {
    expect(Z_INDEX_VALUE.ABOVE_KEYBOARD).toBeLessThan(Z_INDEX_VALUE.SNACKBAR);
    expect(Z_INDEX_VALUE.SNACKBAR).toBeLessThan(Z_INDEX_VALUE.LOADING);
  });
});
