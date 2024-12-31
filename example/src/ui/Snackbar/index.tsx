import { StyleSheet, View, Platform, Image } from 'react-native';
import { BlurView } from 'expo-blur';
import { CustomSnackbarProps, ZSText } from 'zs-ui';

type SnackType = 'success' | 'error' | 'info';

interface SnackBarConfig {
  icon: string;
  color: string;
}

const SNACK_CONFIG: Record<SnackType, SnackBarConfig> = {
  success: {
    icon: '✓',
    color: 'rgba(52, 199, 89, 0.9)'
  },
  error: {
    icon: '!',
    color: 'rgba(255, 59, 48, 0.9)'
  },
  info: {
    icon: 'i',
    color: 'rgba(142, 142, 147, 0.9)'
  }
};

function SnackBar({
  snackType = 'success',
  snackMessage
}: CustomSnackbarProps) {
  const config = SNACK_CONFIG[snackType as SnackType];
  const isAndroid = Platform.OS === 'android';

  const SnackContent = () => (
    <View style={styles.snackbar}>
      <View style={styles.container}>
        {
          snackType === 'success' ? (
            <Image style={{ width: 24, height: 24 }} source={require('./assets/ic_toast_suc.png')} resizeMode='cover' />
          ) : (
            <Image style={{ width: 24, height: 24 }} source={require('./assets/ic_prohibition.png')} resizeMode='cover' />
          )
        }
        <View style={styles.textContainer}>
          <ZSText typo='subTitle.1' style={styles.message}>{snackMessage}</ZSText>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.werapper}>
      <BlurView
        intensity={80}
        tint="light"
        style={styles.blurContainer}
        {...(isAndroid && {
          experimentalBlurMethod: "dimezisBlurView",
          blurReductionFactor: 8
        })}
      >
        <SnackContent />
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  werapper: {
    borderRadius: 16
  },
  blurContainer: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  snackbar: {
    width: '100%',
    paddingHorizontal: 15,
    paddingVertical: 18,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    paddingLeft: 10,
  },
  message: {
    color: '#000000'
  },
});

export default SnackBar;