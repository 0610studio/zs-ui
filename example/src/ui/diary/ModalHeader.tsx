import { Platform } from 'react-native';
import { Stack } from 'expo-router';
import { useHeaderButtonColors } from '@0610studio/zs-ui';
import HeaderTextButton from '../HeaderTextButton';

type Props = {
  title: string;
  leading: { kind: 'close' | 'back'; onPress: () => void };
  action?: { title: string; onPress: () => void; disabled?: boolean; testID?: string };
};

export default function ModalHeader({ title, leading, action }: Props) {
  const ios = Platform.OS === 'ios';
  const headerButton = useHeaderButtonColors();
  return (
    <>
      <Stack.Screen options={{ title }} />
      {ios ? (
        <Stack.Toolbar placement="left">
          <Stack.Toolbar.Button icon={leading.kind === 'close' ? 'xmark' : 'chevron.left'} accessibilityLabel={leading.kind === 'close' ? '닫기' : '뒤로'} onPress={leading.onPress}>
            {leading.kind === 'close' ? '닫기' : '뒤로'}
          </Stack.Toolbar.Button>
        </Stack.Toolbar>
      ) : null}
      {action ? (
        <Stack.Toolbar placement="right" buttonContainerColor={ios ? undefined : headerButton.container}>
          {ios ? (
            <Stack.Toolbar.Button onPress={action.onPress} disabled={action.disabled} accessibilityLabel={action.title}>
              {action.title}
            </Stack.Toolbar.Button>
          ) : (
            <Stack.Toolbar.View>
              <HeaderTextButton title={action.title} onPress={action.onPress} disabled={action.disabled} testID={action.testID ?? 'header-action'} />
            </Stack.Toolbar.View>
          )}
        </Stack.Toolbar>
      ) : null}
    </>
  );
}
