import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import ModalBackground from '../../overlay/ui/ModalBackground';

describe('ModalBackground', () => {
  it('children을 렌더링한다', () => {
    const { getByText } = render(
      <ModalBackground position="center" modalBgColor={'rgba(0,0,0,0.5)'}>
        <Text>inner-text</Text>
      </ModalBackground>
    );
    getByText('inner-text');
  });
});



