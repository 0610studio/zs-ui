import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { ZSRadioGroup, ZSContainer } from 'zs-ui';
import TitleCard from '../src/ui/TitleCard';
import type { RadioOption, Theme } from 'zs-ui';
import { useStyleSheetCreate } from 'zs-ui/model';

function ZSRadioGroupExample(): React.JSX.Element {
  const [responseType, setResponseType] = useState<RadioOption>();
  const styles = useStyleSheetCreate(createStyles);

  return (
    <ZSContainer edges={['bottom']} style={styles.container}>
      <TitleCard title='ZSRadioGroup'>
        <ZSRadioGroup
          options={[
            { value: '답변이 필요없어요.', index: 'none' },
            { value: '앱 알림으로 받고싶어요.', index: 'app' },
            { value: '이메일로 받고싶어요.', index: 'email' },
          ]}
          value={responseType}
          onSelect={setResponseType}
        />
      </TitleCard>

      <TitleCard title='ZSRadioGroup Grid'>
        <ZSRadioGroup
          options={[
            { value: '답변이 필요없어요.', index: 'none' },
            { value: '앱 알림으로 받고싶어요.', index: 'app' },
            { value: '이메일로 받고싶어요.', index: 'email' },
          ]}
          value={responseType}
          onSelect={setResponseType}
          rowCount={2}
        />
      </TitleCard>
    </ZSContainer>
  );
}

const createStyles = (palette: Theme) => StyleSheet.create({
  container: {
    gap: 30,
    paddingTop: 40,
    backgroundColor: palette.background.layer2,
    paddingHorizontal: 15,
    paddingBottom: 90,
  },
  buttonStyle: {
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
});

export default ZSRadioGroupExample;
