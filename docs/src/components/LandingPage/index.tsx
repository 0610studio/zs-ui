import { useEffect, useRef, useState } from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {
  ArrowUpRight,
  BookOpen,
  Layers3,
  PlayCircle,
  Sparkles,
  TabletSmartphone,
  Type,
  Waves,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import styles from './styles.module.css';

type Scene = {
  eyebrow: string;
  title: string;
  stageTitle: string;
  description: string;
  detail: string;
  accent: string;
  auraLabel: string;
  stats: Array<{ label: string; value: string }>;
  principles: string[];
  icon: LucideIcon;
};

type HeroScene = Pick<Scene, 'eyebrow' | 'stageTitle' | 'accent' | 'auraLabel' | 'icon'>;

const INSTALL_COMMAND = 'npx expo install @0610studio/zs-ui';

const introHero: HeroScene = {
  eyebrow: '@0610studio/zs-ui',
  stageTitle: 'ZS-UI',
  accent: '화면을 만드는 기준을 하나의 시스템으로.',
  auraLabel: 'Expo UI toolkit',
  icon: Waves,
};

const scenes: Scene[] = [
  {
    eyebrow: 'Capability 01',
    title: '상태를 흩뜨리지 않는 오버레이',
    stageTitle: '오버레이 컴포넌트',
    description: 'Alert, BottomSheet, Snackbar와 Loader를 같은 호출 방식으로 제어합니다.',
    detail: 'OverlayProvider 하나로 화면마다 반복되던 표시 상태와 닫기 흐름을 줄입니다.',
    accent: 'One overlay flow for feedback and actions.',
    auraLabel: 'Unified overlays',
    stats: [
      { label: 'Provider', value: 'OverlayProvider' },
      { label: 'Control', value: 'useOverlay' },
      { label: 'Pattern', value: 'show* / hide' },
    ],
    principles: ['함수 호출 중심 제어', '화면별 상태 중복 감소', '일관된 피드백 흐름'],
    icon: Sparkles,
  },
  {
    eyebrow: 'Capability 02',
    title: '공유되는 텍스트 계층',
    stageTitle: '타이포그래피 스케일',
    description: 'heading부터 caption까지 6개 그룹과 6개 단계로 읽기 흐름을 맞춥니다.',
    detail: 'ZSText와 useTheme.typography가 같은 타입과 토큰을 사용합니다.',
    accent: 'A 6 × 6 scale for consistent hierarchy.',
    auraLabel: 'Readable hierarchy',
    stats: [
      { label: 'Groups', value: '6' },
      { label: 'Levels', value: '6 each' },
      { label: 'Access', value: 'ZSText / useTheme' },
    ],
    principles: ['일관된 텍스트 계층', '컴포넌트와 스타일 공유', '폰트 교체를 Provider에서 관리'],
    icon: Type,
  },
  {
    eyebrow: 'Capability 03',
    title: '폴더블까지 반응하는 화면',
    stageTitle: '폴더블 대응',
    description: 'Android 폴더블의 접힘과 펼침 상태를 감지하고 넓어진 화면을 활용합니다.',
    detail: 'ZSContainer의 rightComponent로 펼침 상태의 두 영역 레이아웃을 구성합니다.',
    accent: 'Fold-aware layout for devices that open wider.',
    auraLabel: 'Foldable ready',
    stats: [
      { label: 'Hook', value: 'useFoldingState' },
      { label: 'Layout', value: 'rightComponent' },
      { label: 'Platform', value: 'Android' },
    ],
    principles: ['폴딩 상태 감지', '두 영역 레이아웃 지원', '일반 화면과 같은 컨테이너 사용'],
    icon: TabletSmartphone,
  },
  {
    eyebrow: 'Capability 04',
    title: '라이트와 다크를 같은 기준으로',
    stageTitle: '일관된 Theme',
    description: '팔레트, 타이포그래피와 화면 색상을 ThemeProvider에서 앱 전체에 적용합니다.',
    detail: 'useTheme와 themeFactory로 시스템 모드와 제품별 색상 체계를 함께 관리합니다.',
    accent: 'One theme system across every screen.',
    auraLabel: 'Consistent theme',
    stats: [
      { label: 'Provider', value: 'ThemeProvider' },
      { label: 'Mode', value: 'Light / Dark' },
      { label: 'Factory', value: 'themeFactory' },
    ],
    principles: ['앱 전체 팔레트 공유', '시스템 모드 대응', '제품별 토큰 확장'],
    icon: BookOpen,
  },
  {
    eyebrow: 'Capability 05',
    title: '화면 구조를 한 번에',
    stageTitle: '공통 화면 구조',
    description: 'SafeArea, 스크롤, 상태바와 키보드 대응을 ZSContainer에 모았습니다.',
    detail: '입력 화면과 일반 화면을 같은 뼈대로 구성해 반복되는 레이아웃 결정을 줄입니다.',
    accent: 'One container for the screen foundation.',
    auraLabel: 'Screen foundation',
    stats: [
      { label: 'Root', value: 'ZSContainer' },
      { label: 'Keyboard', value: 'Auto scroll' },
      { label: 'Layout', value: 'Header / Footer' },
    ],
    principles: ['공통 화면 패턴', '키보드 대응 내장', 'SafeArea와 스크롤 통합'],
    icon: Layers3,
  },
];

export default function LandingPage() {
  const { siteConfig } = useDocusaurusContext();
  const [activeScene, setActiveScene] = useState<number | null>(null);
  const stepRefs = useRef<Array<HTMLElement | null>>([]);
  const configuredVersion = siteConfig.customFields?.zsUiVersion;
  const version = typeof configuredVersion === 'string' ? configuredVersion : 'current';

  useEffect(() => {
    let frameId = 0;

    const updateActiveScene = () => {
      frameId = 0;
      const viewportCenter = window.innerHeight * 0.5;
      const firstStep = stepRefs.current[0];

      if (!firstStep || firstStep.getBoundingClientRect().top > viewportCenter) {
        setActiveScene((current) => (current === null ? current : null));
        return;
      }

      let closestIndex = 0;
      let closestDistance = Number.POSITIVE_INFINITY;

      stepRefs.current.forEach((step, index) => {
        if (!step) return;

        const rect = step.getBoundingClientRect();
        const distance = Math.abs(rect.top + rect.height * 0.5 - viewportCenter);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });

      setActiveScene((current) => (current === closestIndex ? current : closestIndex));
    };

    const requestUpdate = () => {
      if (frameId !== 0) return;
      frameId = window.requestAnimationFrame(updateActiveScene);
    };

    updateActiveScene();
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);

    return () => {
      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', requestUpdate);
      if (frameId !== 0) window.cancelAnimationFrame(frameId);
    };
  }, []);

  const scene = activeScene === null ? introHero : (scenes[activeScene] ?? introHero);
  const SceneIcon = scene.icon;
  const themeName = activeScene === null
    ? styles.themeIntro
    : (styles[`theme${activeScene + 1}`] ?? styles.themeIntro);

  return (
    <main className={`${styles.root} ${themeName}`}>
      <section className={styles.experience} aria-label="ZS-ui 주요 기능">
        <div className={styles.stickyViewport}>
          <div className={styles.backdrop} aria-hidden="true">
            <div className={styles.backdropGradient} />
            <div className={styles.backdropMesh} />
            <div className={styles.orbPrimary} />
            <div className={styles.orbSecondary} />
            <div className={styles.orbTertiary} />
            <div className={styles.noise} />
          </div>

          <div className={styles.stageFrame}>
            <div className={styles.stageTopRow}>
              <div className={styles.brandChip}>
                <Waves size={15} strokeWidth={2.1} aria-hidden="true" />
                <span>{siteConfig.title}</span>
                <span className={styles.versionChip}>v{version}</span>
              </div>

              <div className={styles.sceneChip}>
                <SceneIcon size={15} strokeWidth={2.1} aria-hidden="true" />
                <span>{scene.auraLabel}</span>
              </div>
            </div>

            <div className={`${styles.centerpiece} ${activeScene === null ? styles.centerpieceIntro : styles.centerpieceStory}`}>
              <div className={styles.heroWordWrap}>
                <span className={styles.heroEyebrow}>{scene.eyebrow}</span>
                <h1 key={scene.stageTitle} className={styles.heroWord}>{scene.stageTitle}</h1>
                <p key={scene.accent} className={styles.heroAccent}>{scene.accent}</p>
              </div>

              <div className={styles.centerDock}>
                <div className={styles.centerDockGlow} aria-hidden="true" />
                <div className={styles.centerDockBody}>
                  <div className={styles.dockCopy}>
                    <p className={styles.centerDockKicker}>Current · v{version}</p>
                    <strong>45개 공개 API와 로컬 앱 Playground</strong>
                  </div>
                  <div className={styles.dockActions}>
                    <Link to="/docs/Provider/start" className={styles.primaryAction}>
                      시작하기
                      <ArrowUpRight size={17} strokeWidth={2.2} aria-hidden="true" />
                    </Link>
                    <Link to="/docs/Playground" className={styles.secondaryAction}>
                      <PlayCircle size={17} strokeWidth={2.2} aria-hidden="true" />
                      Playground
                    </Link>
                  </div>
                  <code className={styles.installCommand}>{INSTALL_COMMAND}</code>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.scrollRail}>
          <div className={styles.introStep} aria-hidden="true" />
          {scenes.map((item, index) => {
            const ItemIcon = item.icon;
            const isActive = index === activeScene;

            return (
              <section
                key={item.title}
                ref={(node) => { stepRefs.current[index] = node; }}
                className={styles.storyStep}
                aria-label={`${item.eyebrow} ${item.title}`}>
                <article
                  className={`${styles.storyCard} ${isActive ? styles.storyCardActive : ''}`}
                  aria-hidden={!isActive}>
                  <div className={styles.storyCardHeader}>
                    <span className={styles.storyIndex}>{String(index + 1).padStart(2, '0')}</span>
                    <div className={styles.storyIcon} aria-hidden="true">
                      <ItemIcon size={18} strokeWidth={2.1} />
                    </div>
                  </div>

                  <div className={styles.storyCopy}>
                    <p className={styles.storyEyebrow}>{item.eyebrow}</p>
                    <h2 className={styles.storyTitle}>{item.title}</h2>
                    <p className={styles.storyDescription}>{item.description}</p>
                    <p className={styles.storyDetail}>{item.detail}</p>
                  </div>

                  <div className={styles.storyMeta}>
                    <div className={styles.storyStats}>
                      {item.stats.map((stat) => (
                        <div key={stat.label} className={styles.statItem}>
                          <span className={styles.statLabel}>{stat.label}</span>
                          <strong className={styles.statValue}>{stat.value}</strong>
                        </div>
                      ))}
                    </div>
                    <ul className={styles.principleList}>
                      {item.principles.map((principle) => <li key={principle}>{principle}</li>)}
                    </ul>
                  </div>
                </article>
              </section>
            );
          })}
        </div>
      </section>
    </main>
  );
}
