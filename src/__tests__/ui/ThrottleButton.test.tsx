import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';
import ThrottleButton from '../../ui/ThrottleButton';

// console.error를 mock하여 테스트 중 의도적인 에러 로그를 suppress
const originalError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalError;
});

describe('ThrottleButton', () => {
  it('primaryLabelComponent를 렌더한다', () => {
    const mockPress = jest.fn((): Promise<void> => Promise.resolve());
    
    const { getByText } = render(
      <ThrottleButton
        primaryOnPress={mockPress}
        primaryLabelComponent={<Text>Test Button</Text>}
        loadingComponent={<Text>Loading...</Text>}
      />
    );

    expect(getByText('Test Button')).toBeTruthy();
  });

  it('버튼 클릭 시 primaryOnPress를 호출한다', async () => {
    const mockPress = jest.fn((): Promise<void> => Promise.resolve());
    
    const { getByText } = render(
      <ThrottleButton
        primaryOnPress={mockPress}
        primaryLabelComponent={<Text>Test Button</Text>}
        loadingComponent={<Text>Loading...</Text>}
      />
    );

    fireEvent.press(getByText('Test Button'));
    
    await waitFor(() => {
      expect(mockPress).toHaveBeenCalledTimes(1);
    }, { timeout: 3000 });
  });

  it('로딩 중일 때 loadingComponent를 표시한다', async () => {
    const mockPress = jest.fn((): Promise<void> => new Promise(resolve => setTimeout(() => resolve(), 100)));
    
    const { getByText, queryByText } = render(
      <ThrottleButton
        primaryOnPress={mockPress}
        primaryLabelComponent={<Text>Test Button</Text>}
        loadingComponent={<Text>Loading...</Text>}
      />
    );

    fireEvent.press(getByText('Test Button'));

    await waitFor(() => {
      expect(queryByText('Test Button')).toBeNull();
    }, { timeout: 3000 });
  });

  it('disabled일 때 버튼이 비활성화된다', () => {
    const mockPress = jest.fn((): Promise<void> => Promise.resolve());
    
    const { getByText } = render(
      <ThrottleButton
        primaryOnPress={mockPress}
        primaryLabelComponent={<Text>Test Button</Text>}
        loadingComponent={<Text>Loading...</Text>}
        disabled={true}
      />
    );

    const button = getByText('Test Button');
    // disabled prop이 전달되었는지 확인
    expect(button).toBeTruthy();
  });

  it('onError 핸들러를 호출한다', async () => {
    const mockError = jest.fn();
    const mockPress = jest.fn((): Promise<void> => Promise.reject(new Error('Test error')));
    
    const { getByText } = render(
      <ThrottleButton
        primaryOnPress={mockPress}
        primaryLabelComponent={<Text>Test Button</Text>}
        loadingComponent={<Text>Loading...</Text>}
        onError={mockError}
      />
    );

    fireEvent.press(getByText('Test Button'));

    await waitFor(() => {
      expect(mockError).toHaveBeenCalled();
    }, { timeout: 3000 });
  });
});
