import { useMemo, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { NativeTabs } from 'expo-router/native-tabs';
import { ZSButton, ZSTabNavigator, ZSText, useTheme } from '@0610studio/zs-ui';
import { ZSTabsBadgeContext } from '../../../src/ui/lab/ZSTabsBadgeContext';
import ScreenHeader from '../../../src/ui/ScreenHeader';

const HISTORY_ICON = require('../../../assets/icons/history.png');
export default function LabZSTabsLayout() {
  const { colors } = useTheme();
  const [unread, setUnread] = useState(3);
  const [mutedTabs, setMutedTabs] = useState(false);
  const value = useMemo(() => ({ unread, setUnread, mutedTabs, setMutedTabs }), [unread, mutedTabs]);
  const unselectedColor = mutedTabs ? 'textSecondary' : undefined;

  return (
    <ZSTabsBadgeContext.Provider value={value}>
      <ScreenHeader title="ZSTabNavigator" background={colors.surface1} />
      <ZSTabNavigator
        unselectedIconColor={unselectedColor}
        unselectedLabelColor={unselectedColor}
        ios={{
          minimizeBehavior: 'onScrollDown',
          prominent: 'compose',
          bottomAccessory: <UnreadAccessory unread={unread} onReadAll={() => setUnread(0)} />,
        }}
      >
        <ZSTabNavigator.Screen name="index" options={{ title: '기록', icon: { src: HISTORY_ICON } }} />
        <ZSTabNavigator.Screen
          name="chat"
          options={{ title: '채팅', icon: { sf: 'bubble.left.and.bubble.right', md: 'chat' }, badge: unread > 0 ? unread : false }}
        />
        <ZSTabNavigator.Screen name="settings" options={{ title: '설정', icon: { sf: 'gearshape', md: 'settings' }, badge: true }} />
        <ZSTabNavigator.Screen
          name="compose"
          options={{ title: '글쓰기', icon: { sf: 'square.and.pencil', md: 'edit' }, hidden: Platform.OS !== 'ios' }}
        />
        <ZSTabNavigator.Screen name="search" options={{ title: '검색', icon: { sf: 'magnifyingglass', md: 'search' }, role: 'search' }} />
      </ZSTabNavigator>
    </ZSTabsBadgeContext.Provider>
  );
}

const ACCESSORY_MAX_FONT_SCALE = 1.3;

function UnreadAccessory({ unread, onReadAll }: { unread: number; onReadAll: () => void }) {
  const placement = NativeTabs.BottomAccessory.usePlacement();
  return (
    <View style={[styles.accessory, placement === 'regular' ? styles.accessoryWithButton : null]} testID="lab-zs-tab-navigator-accessory">
      <ZSText variant="subtitle2" emphasized numberOfLines={1} maxFontSizeMultiplier={ACCESSORY_MAX_FONT_SCALE} style={styles.accessoryText}>
        {placement === 'inline' ? `미읽음 ${unread}` : `채팅 미읽음 ${unread}개`}
      </ZSText>
      {placement === 'regular' ? (
        <ZSButton
          title="모두 읽음"
          variant="text"
          size="small"
          maxFontSizeMultiplier={ACCESSORY_MAX_FONT_SCALE}
          onPress={onReadAll}
          disabled={unread === 0}
          style={styles.accessoryButton}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  accessory: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
  },
  accessoryWithButton: {
    paddingRight: 4,
  },
  accessoryText: {
    flex: 1,
  },
  accessoryButton: {
    alignSelf: 'center',
  },
});
