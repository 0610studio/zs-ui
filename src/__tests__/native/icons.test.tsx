import { render } from '@testing-library/react-native';
import { nth, queryAllByHostType } from '../utils/hostQueries';
import { ICON_MIN_RENDERED_STROKE, ICON_STROKE_WIDTH, ICON_VIEW_BOX, iconStrokeWidth } from '../../assets/iconStroke';
import { SvgCheck } from '../../assets/SvgCheck';
import { SvgChevron } from '../../assets/SvgChevron';
import SvgExclamation from '../../assets/SvgExclamation';
import { SvgX } from '../../assets/SvgX';

const strokes = () => queryAllByHostType('View').filter((node) => node.props.stroke !== undefined);

describe('내장 아이콘', () => {
  it.each([
    ['체크', <SvgCheck size={18} color="#111111" />, 18],
    ['화살표', <SvgChevron direction="left" size={24} color="#111111" />, 24],
    ['느낌표', <SvgExclamation size={20} backgroundColor="#ff0000" exclamationColor="#111111" />, 20],
    ['닫기', <SvgX size={24} color="#111111" />, 24],
  ] as const)('%s는 같은 격자와 크기별 획을 사용한다', async (_name, icon, size) => {
    await render(icon);
    expect(queryAllByHostType('View').map((node) => node.props.viewBox).filter(Boolean)).toEqual([ICON_VIEW_BOX]);
    expect(strokes().length).toBeGreaterThan(0);
    strokes().forEach((node) => expect(node.props.strokeWidth).toBe(iconStrokeWidth(size)));
  });

  it('작은 아이콘도 최소 굵기를 유지하고 큰 아이콘은 비례해 커진다', () => {
    const rendered = (size: number) => (size / 24) * iconStrokeWidth(size);
    [10, 14, 16, 18, 20].forEach((size) => expect(rendered(size)).toBeCloseTo(ICON_MIN_RENDERED_STROKE, 5));
    expect(rendered(24)).toBeCloseTo(1.8, 5);
    expect(rendered(32)).toBeCloseTo(2.4, 5);
    expect(iconStrokeWidth(0)).toBe(ICON_STROKE_WIDTH);
    expect(iconStrokeWidth(Number.NaN)).toBe(ICON_STROKE_WIDTH);
  });

  it('지정한 획 굵기는 숫자·문자열 모두 그대로 전달한다', async () => {
    await render(<SvgCheck strokeWidth="2.4" />);
    expect(nth(strokes(), 0).props.strokeWidth).toBe('2.4');
    await render(<SvgCheck strokeWidth={1.5} />);
    strokes().forEach((node) => expect(node.props.strokeWidth).toBe(1.5));
  });
});
