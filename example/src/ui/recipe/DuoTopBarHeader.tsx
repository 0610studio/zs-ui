import { StyleSheet, View } from 'react-native';
import { Stack, router } from 'expo-router';
import { Button, Host, Menu } from '@expo/ui/swift-ui';
import { buttonStyle, controlSize, disabled as disabledModifier, labelStyle, tint } from '@expo/ui/swift-ui/modifiers';
import { ZSText, ZSTopBar, useTheme } from '@0610studio/zs-ui';
import type { ScreenHeaderProps } from '../ScreenHeader';

const goBack = () => (router.canGoBack() ? router.back() : router.replace('/'));

const glass = (color: string) => [labelStyle('iconOnly'), buttonStyle('glass'), controlSize('regular'), tint(color)];

export default function DuoTopBarHeader({ title, background, hideTitle = false, action, menu, notice }: ScreenHeaderProps) {
  const { colors, mode, toggleTheme } = useTheme();
  const nextModeLabel = mode === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환';

  return (
    <>
      <Stack.Screen options={{ title, headerShown: false }} />
      <ZSTopBar style={{ backgroundColor: background ?? colors.background }} contentStyle={styles.row} testID="duo-top-bar">
        <Host matchContents ignoreSafeArea="container" testID="duo-top-bar-back">
          <Button label="뒤로" systemImage="chevron.left" onPress={goBack} modifiers={glass(colors.text)} />
        </Host>
        <View style={styles.title}>
          {hideTitle ? null : (
            <ZSText variant="subtitle1" emphasized numberOfLines={1} accessibilityRole="header">
              {title}
            </ZSText>
          )}
        </View>
        {action ? (
          <Host matchContents ignoreSafeArea="container" testID="header-action">
            <Button
              label={action.title}
              onPress={action.onPress}
              modifiers={[labelStyle('titleOnly'), buttonStyle('glassProminent'), controlSize('regular'), tint(colors.primary), disabledModifier(!!action.disabled)]}
            />
          </Host>
        ) : null}
        {menu ? (
          <Host matchContents ignoreSafeArea="container" testID="duo-top-bar-menu">
            <Menu label={menu.accessibilityLabel} systemImage="ellipsis" modifiers={glass(colors.text)}>
              {menu.items.map((item) => (
                <Button key={item.key} label={item.title} systemImage={item.icon as never} role={item.destructive ? 'destructive' : 'default'} onPress={item.onPress} />
              ))}
            </Menu>
          </Host>
        ) : null}
        {notice ? (
          <Host matchContents ignoreSafeArea="container" testID="duo-top-bar-notice">
            <Button label={notice.accessibilityLabel} systemImage="exclamationmark.triangle" onPress={notice.onPress} modifiers={glass(colors.text)} />
          </Host>
        ) : null}
        <Host matchContents ignoreSafeArea="container" testID="duo-top-bar-theme">
          <Button label={nextModeLabel} systemImage={mode === 'dark' ? 'moon.fill' : 'sun.max.fill'} onPress={toggleTheme} modifiers={glass(colors.text)} />
        </Host>
      </ZSTopBar>
    </>
  );
}

const styles = StyleSheet.create({
  row: { gap: 8 },
  title: { flex: 1, minWidth: 0 },
});
