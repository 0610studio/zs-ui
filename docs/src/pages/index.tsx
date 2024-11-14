import Layout from '@theme/Layout';
import LandingPage  from '@site/src/components/LandingPage';


export default function Home(): JSX.Element {
  return (
    <Layout
      title={`Expo - UI Toolkit 👋`}
      description="ReactNative Expo - UI Toolkit">
        <LandingPage />
    </Layout>
  );
}
