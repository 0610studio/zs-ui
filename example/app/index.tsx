import { StyleSheet, Button } from 'react-native';
import { ZSContainer } from 'zs-ui';
import { router } from 'expo-router';

export default function Home() {
  return (
    <ZSContainer 
      edges={[]} 
      style={{ gap: 20, padding: 30 }}
    >
      <Button title='테마 예제' onPress={() => router.push('/ThemeExample')} />
      <Button title='레이아웃 예제' onPress={() => router.push('/LayoutExample')} />
      <Button title='오버레이 예제' onPress={() => router.push('/OverlayExample')} />
      <Button title='글로벌 오버레이 예제' onPress={() => router.push('/GlobalOverlayExample')} />
      <Button title='ZS_Container 예제' onPress={() => router.push('/ZSContainerExample')} />
      <Button title='폴더블 기기 예제' onPress={() => router.push('/FoldableDevice')} />
      <Button title='폴더블 레이아웃 예제' onPress={() => router.push('/FoldableExample')} />
    </ZSContainer>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 8,
    borderRadius: 5,
    backgroundColor: 'orange',
    alignItems: 'center',
    paddingHorizontal: 10,
    width: '100%'
  },
});