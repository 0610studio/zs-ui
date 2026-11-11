import type { ImageSourcePropType } from 'react-native';
import { Button, Host, type ButtonProps } from '@expo/ui/swift-ui';
import { buttonStyle, controlSize, labelStyle, tint } from '@expo/ui/swift-ui/modifiers';
import { useTheme } from '@0610studio/zs-ui';

type SFSymbol = NonNullable<ButtonProps['systemImage']>;

export interface TopBarIconButtonProps {
  label: string;
  symbol: SFSymbol;
  androidIcon: ImageSourcePropType;
  onPress: () => void;
  testID?: string;
}

export function TopBarIconButton({ label, symbol, onPress, testID }: TopBarIconButtonProps) {
  const { colors } = useTheme();
  return (
    <Host matchContents ignoreSafeArea="container" testID={testID}>
      <Button
        label={label}
        systemImage={symbol}
        onPress={onPress}
        modifiers={[labelStyle('iconOnly'), buttonStyle('glass'), controlSize('regular'), tint(colors.text)]}
      />
    </Host>
  );
}

export interface TopBarTextButtonProps extends TopBarIconButtonProps {
  prominent?: boolean;
}

export function TopBarTextButton({ label, symbol, onPress, prominent, testID }: TopBarTextButtonProps) {
  const { colors } = useTheme();
  return (
    <Host matchContents ignoreSafeArea="container" testID={testID}>
      <Button
        label={label}
        systemImage={symbol}
        onPress={onPress}
        modifiers={[
          labelStyle('titleAndIcon'),
          buttonStyle(prominent ? 'glassProminent' : 'glass'),
          controlSize('regular'),
          tint(prominent ? colors.primary : colors.text),
        ]}
      />
    </Host>
  );
}
