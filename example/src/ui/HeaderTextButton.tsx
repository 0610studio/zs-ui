import { StyleSheet } from 'react-native';
import { ZSButton, useHeaderButtonColors } from '@0610studio/zs-ui';

const HEIGHT = 40;

export default function HeaderTextButton({ title, onPress, disabled, testID = 'header-action' }: { title: string; onPress: () => void; disabled?: boolean; testID?: string }) {
  const { container } = useHeaderButtonColors();
  return <ZSButton title={title} variant="text" size="small" onPress={onPress} disabled={disabled} style={[styles.button, { backgroundColor: container }]} testID={testID} />;
}

const styles = StyleSheet.create({
  button: { minHeight: HEIGHT },
});
