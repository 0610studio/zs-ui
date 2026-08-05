import { Platform, StyleSheet, Text, View } from 'react-native';

const MONO_FONT = Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' });

/** 예제 하단에 사용법을 보여주는 다크 코드 블록 (라이트/다크 모드 공통 잉크 색) */
export default function CodeBlock({ code }: { code: string }) {
  return (
    <View style={styles.container}>
      <Text style={styles.code}>{code}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#1C252E',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  code: {
    fontFamily: MONO_FONT,
    fontSize: 12,
    lineHeight: 19,
    color: '#EDEDED',
  },
});
