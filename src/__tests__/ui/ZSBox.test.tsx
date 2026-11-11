import { render, screen } from '@testing-library/react-native';
import { StyleSheet, Text } from 'react-native';
import ZSBox from '../../ui/ZSBox';
import { getTestTheme } from '../utils/theme';

jest.mock('../../context/ThemeContext', () => require('../utils/theme').mockThemeModule());

const styleOf = (testID: string) => StyleSheet.flatten(screen.getByTestId(testID).props.style);

describe('ZSBox', () => {
  it('children 을 그린다', async () => {
    await render(
      <ZSBox>
        <Text>내용</Text>
      </ZSBox>,
    );
    expect(screen.getByText('내용')).toBeTruthy();
  });

  it('color 미지정이면 배경이 투명하고 그림자가 없다', async () => {
    await render(<ZSBox testID="view" />);
    expect(styleOf('view')).toEqual({});
  });

  it('backgroundColor 의 테마 색을 배경으로 쓴다', async () => {
    const { colors } = getTestTheme();
    await render(<ZSBox testID="view" backgroundColor="surface4" />);
    expect(styleOf('view').backgroundColor).toBe(colors.surface4);
  });

  it('테마 색 이름이 아니면 그대로 쓴다', async () => {
    await render(<ZSBox testID="view" backgroundColor="#abcdef" />);
    expect(styleOf('view').backgroundColor).toBe('#abcdef');
  });

  it('shadow 단계의 그림자를 붙인다', async () => {
    const { shadows } = getTestTheme();
    await render(<ZSBox testID="view" shadow="md" />);
    expect(styleOf('view').boxShadow).toEqual(shadows.md.boxShadow);
  });

  it('style 이 마지막에 적용된다', async () => {
    await render(<ZSBox testID="view" backgroundColor="primary" style={{ backgroundColor: 'red', padding: 4 }} />);
    expect(styleOf('view')).toMatchObject({ backgroundColor: 'red', padding: 4 });
  });
});
