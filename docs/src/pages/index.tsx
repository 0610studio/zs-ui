import Layout from '@theme/Layout';
import LandingPage from '@site/src/components/LandingPage';

export default function Home(): JSX.Element {
  return (
    <Layout
      title="zs-ui · Expo UI"
      noFooter
      wrapperClassName="homepageLayout"
      description="Expo SDK 58용 iOS·Android UI 라이브러리. 컴포넌트, 오버레이, 테마와 적응형 레이아웃을 제공합니다.">
        <LandingPage />
    </Layout>
  );
}
