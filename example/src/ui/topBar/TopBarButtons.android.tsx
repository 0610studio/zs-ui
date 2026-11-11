import { Host } from '@expo/ui';
import { Button, FilledTonalButton, Icon, IconButton, Row, Text } from '@expo/ui/jetpack-compose';
import { useTheme } from '@0610studio/zs-ui';
import type { TopBarIconButtonProps, TopBarTextButtonProps } from './TopBarButtons';

export function TopBarIconButton({ label, androidIcon, onPress, testID }: TopBarIconButtonProps) {
  const { colors } = useTheme();
  return (
    <Host matchContents testID={testID}>
      <IconButton onClick={onPress}>
        <Icon source={androidIcon} tint={colors.text} size={24} contentDescription={label} />
      </IconButton>
    </Host>
  );
}

export function TopBarTextButton({ label, androidIcon, onPress, prominent, testID }: TopBarTextButtonProps) {
  const ButtonType = prominent ? Button : FilledTonalButton;
  return (
    <Host matchContents testID={testID}>
      <ButtonType onClick={onPress}>
        <Row horizontalArrangement={{ spacedBy: 8 }} verticalAlignment="center">
          <Icon source={androidIcon} size={18} />
          <Text>{label}</Text>
        </Row>
      </ButtonType>
    </Host>
  );
}
