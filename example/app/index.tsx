import { Text, StyleSheet, Pressable, Button } from 'react-native';
import { useTheme, ZSContainer } from 'zs-ui';
import { router } from 'expo-router';

export default function Home() {
  const { palette: { toggleTheme, mode } } = useTheme();

  return (
    <ZSContainer 
      edges={[]} 
      style={{ gap: 20, padding: 30 }}
    >
      <Pressable onPress={toggleTheme} style={[styles.button, { backgroundColor: 'orange' }]}>
        <Text style={styles.buttonText}>현재 모드: {mode}</Text>
      </Pressable>

      <Button title='테마 예제' onPress={() => router.push('/ThemeExample')} />
      <Button title='레이아웃 예제' onPress={() => router.push('/LayoutExample')} />
      <Button title='오버레이 예제' onPress={() => router.push('/OverlayExample')} />
      <Button title='ZS_Container 예제' onPress={() => router.push('/ZSContainerExample')} />
      <Button title='글로벌 오버레이 예제' onPress={() => router.push('/GlobalOverlayExample')} />
      <Button title='폴더블 기기 예제' onPress={() => router.push('/FoldableDevice')} />
    </ZSContainer>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 8,
    borderRadius: 5,
    backgroundColor: '#BB86FC',
    alignItems: 'center',
    paddingHorizontal: 10,
    width: '100%'
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
});