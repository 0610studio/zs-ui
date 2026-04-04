import Layout from '@theme/Layout';
import LandingPage  from '@site/src/components/LandingPage';


export default function Home(): JSX.Element {
  return (
    <Layout
      title="ZS-ui · React Native Expo UI Toolkit"
      noFooter
      wrapperClassName="homepageLayout"
      description="Declarative overlays, consistent screen containers, theme customization, and foldable-ready UI components for Expo apps.">
        <LandingPage />
    </Layout>
  );
}
