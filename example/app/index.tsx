import { Text, StyleSheet, Pressable, Button } from 'react-native';
import { useTheme, ZSContainer, ZSContainerRef } from 'zs-ui';
import { router } from 'expo-router';
import { useRef } from 'react';

export default function Home() {
  const { palette: { toggleTheme, mode } } = useTheme();
  const containerRef = useRef<ZSContainerRef>(null);

  return (
    <ZSContainer 
      ref={containerRef}
      edges={[]} 
      style={{ gap: 20, padding: 30 }}
    >
      <Pressable onPress={toggleTheme} style={[styles.button, { backgroundColor: 'orange' }]}>
        <Text style={styles.buttonText}>현재 모드: {mode}</Text>
      </Pressable>

      <Button title='Theme 예제' onPress={() => router.push('/ThemeExample')} />
      <Button title='Layout 예제' onPress={() => router.push('/LayoutExample')} />
      <Button title='Overlay 예제' onPress={() => router.push('/OverlayExample')} />
      <Button title='ZSContainer 예제' onPress={() => router.push('/ZSContainerExample')} />
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
