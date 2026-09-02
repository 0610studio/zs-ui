import { Platform, StyleSheet, Text, View } from 'react-native';

const MONO_FONT = Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' });

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
