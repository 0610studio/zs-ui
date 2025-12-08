import { ZSContainer, ZSPressable, ZSText, ZSView } from 'zs-ui';
import { router } from 'expo-router';
import TitleCard from '../src/ui/TitleCard';

const HomeButton = ({ title, onPress }: { title: string, onPress: () => void }) => {
  return (
    <ZSPressable fullWidth color='primary.50' style={{ padding: 12, borderRadius: 10, justifyContent: 'center', alignItems: 'center' }} onPress={onPress}>
      <ZSText typo='subTitle.1' color='white'>{title}</ZSText>
    </ZSPressable>
  );
};

export default function Home() {
  return (
    <ZSContainer backgroundColor='layer2'>
      <ZSView color='layer2' style={{ paddingHorizontal: 15, flex: 1, gap: 30, paddingTop: 30 }}>
        <TitleCard title='테마'>
          <HomeButton title='테마 예제' onPress={() => router.push('/ThemeExample')} />
        </TitleCard>
        <TitleCard title='레이아웃'>
          <HomeButton title='ZS_Container 예제' onPress={() => router.push('/ZSContainerExample')} />
          <HomeButton title='ZSText 예제' onPress={() => router.push('/ZSTextExample')} />
          <HomeButton title='ZSTextField 예제' onPress={() => router.push('/ZSTextFieldExample')} />
          <HomeButton title='Button 예제' onPress={() => router.push('/ButtonExample')} />
          <HomeButton title='ZSRadioGroup 예제' onPress={() => router.push('/ZSRadioGroupExample')} />
          <HomeButton title='ZSSkeleton 예제' onPress={() => router.push('/ZSSkeletonExample')} />
        </TitleCard>
        <TitleCard title='오버레이'>
          <HomeButton title='PopOver 예제' onPress={() => router.push('/PopOverExample')} />
          <HomeButton title='Overlay 예제' onPress={() => router.push('/OverlayExample')} />
          <HomeButton title='글로벌 오버레이 예제' onPress={() => router.push('/GlobalOverlayExample')} />
        </TitleCard>
        <TitleCard title='폴더블'>
          <HomeButton title='폴더블 상태 예제' onPress={() => router.push('/FoldableDevice')} />
          <HomeButton title='폴더블 레이아웃 예제' onPress={() => router.push('/FoldableExample')} />
        </TitleCard>
      </ZSView>
    </ZSContainer>
  );
}
