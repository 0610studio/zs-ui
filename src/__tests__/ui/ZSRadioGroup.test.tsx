import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Text } from 'react-native';
import ZSRadioGroup from '../../ui/ZSRadioGroup';

jest.mock('../../context/ThemeContext', () => {
  const paletteFn = require('../../theme/palette').default;
  const typographyFn = require('../../theme/typography').default;
  const palette = paletteFn({ mode: 'light' });
  const typography = typographyFn({ themeFonts: {} });
  return {
    ThemeProvider: ({ children }: any) => children,
    useTheme: () => ({ palette, typography }),
  };
});

jest.mock('../../ui/atoms/AnimatedWrapper', () => ({
  __esModule: true,
  default: ({ children }: any) => children,
}));

jest.mock('../../assets/SvgCheck', () => {
  const React = require('react');
  return {
    __esModule: true,
    SvgCheck: () => React.createElement('Text', {}, 'SvgCheck'),
  };
});

const mockOptions = [
  { index: '1', value: 'Option 1' },
  { index: '2', value: 'Option 2' },
  { index: '3', value: 'Option 3' },
];

describe('ZSRadioGroup', () => {
  it('options를 렌더한다', () => {
    const mockOnSelect = jest.fn();
    const { getByText } = render(
      <ZSRadioGroup options={mockOptions} value={mockOptions[0]} onSelect={mockOnSelect} />
    );

    expect(getByText('Option 1')).toBeTruthy();
    expect(getByText('Option 2')).toBeTruthy();
    expect(getByText('Option 3')).toBeTruthy();
  });

  it('선택된 옵션을 표시한다', () => {
    const mockOnSelect = jest.fn();
    const { getByText } = render(
      <ZSRadioGroup options={mockOptions} value={mockOptions[1]} onSelect={mockOnSelect} />
    );

    expect(getByText('Option 2')).toBeTruthy();
  });

  it('옵션 선택 시 onSelect를 호출한다', () => {
    const mockOnSelect = jest.fn();
    const { getByText } = render(
      <ZSRadioGroup options={mockOptions} value={mockOptions[0]} onSelect={mockOnSelect} />
    );

    fireEvent.press(getByText('Option 2'));
    expect(mockOnSelect).toHaveBeenCalledWith(mockOptions[1]);
  });

  it('disabled가 true일 때 onSelect를 호출하지 않는다', () => {
    const mockOnSelect = jest.fn();
    const { getByText } = render(
      <ZSRadioGroup 
        options={mockOptions} 
        value={mockOptions[0]} 
        onSelect={mockOnSelect} 
        disabled={true}
      />
    );

    fireEvent.press(getByText('Option 2'));
    expect(mockOnSelect).not.toHaveBeenCalled();
  });

  it('rowCount가 1일 때 fullWidth 레이아웃을 사용한다', () => {
    const mockOnSelect = jest.fn();
    const { getByText } = render(
      <ZSRadioGroup 
        options={mockOptions} 
        value={mockOptions[0]} 
        onSelect={mockOnSelect}
        rowCount={1}
      />
    );

    expect(getByText('Option 1')).toBeTruthy();
  });

  it('rowCount가 2일 때 2열 레이아웃을 사용한다', () => {
    const mockOnSelect = jest.fn();
    const { getByText } = render(
      <ZSRadioGroup 
        options={mockOptions} 
        value={mockOptions[0]} 
        onSelect={mockOnSelect}
        rowCount={2}
      />
    );

    expect(getByText('Option 1')).toBeTruthy();
    expect(getByText('Option 2')).toBeTruthy();
  });

  it('rowCount가 3일 때 3열 레이아웃을 사용한다', () => {
    const mockOnSelect = jest.fn();
    const { getByText } = render(
      <ZSRadioGroup 
        options={mockOptions} 
        value={mockOptions[0]} 
        onSelect={mockOnSelect}
        rowCount={3}
      />
    );

    expect(getByText('Option 1')).toBeTruthy();
    expect(getByText('Option 2')).toBeTruthy();
  });

  it('rowCount가 1일 때 선택된 옵션에 체크 아이콘을 표시한다', () => {
    const mockOnSelect = jest.fn();
    const { getByText } = render(
      <ZSRadioGroup 
        options={mockOptions} 
        value={mockOptions[0]} 
        onSelect={mockOnSelect}
        rowCount={1}
      />
    );

    expect(getByText('SvgCheck')).toBeTruthy();
  });

  it('rowCount가 1이 아닐 때 원형 체크박스를 표시한다', () => {
    const mockOnSelect = jest.fn();
    const { getByText } = render(
      <ZSRadioGroup 
        options={mockOptions} 
        value={mockOptions[0]} 
        onSelect={mockOnSelect}
        rowCount={2}
      />
    );

    expect(getByText('Option 1')).toBeTruthy();
  });

  it('value가 없을 때도 정상 작동한다', () => {
    const mockOnSelect = jest.fn();
    const { getByText } = render(
      <ZSRadioGroup
        options={mockOptions} 
        onSelect={mockOnSelect}
      />
    );

    expect(getByText('Option 1')).toBeTruthy();
  });
});

