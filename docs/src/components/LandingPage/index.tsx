import { useEffect, useRef, useState } from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {
  ArrowUpRight,
  BookOpen,
  Layers3,
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
  stats: { label: string; value: string }[];
  principles: string[];
  icon: LucideIcon;
};

type HeroScene = Pick<Scene, 'eyebrow' | 'stageTitle' | 'accent' | 'auraLabel' | 'icon'>;

const INSTALL_COMMAND = 'npx expo install @0610studio/zs-ui';

const introHero: HeroScene = {
  eyebrow: '@0610studio/zs-ui',
  stageTitle: 'zs-ui',
  accent: '화면을 만드는 기준을 하나의 시스템으로.',
  auraLabel: 'Expo UI toolkit',
  icon: Waves,
};

const scenes: Scene[] = [
  {
    eyebrow: 'Capability 01',
    title: '함수로 여는 오버레이',
    stageTitle: '오버레이',
    description: 'Alert·시트·스낵바·진행 표시를 useOverlay로 호출합니다.',
    detail: '시트는 시스템 UI를 사용하고, Alert·스낵바는 두 플랫폼에서 앱 테마에 맞춰 그립니다.',
    accent: 'One API for alerts, sheets and notifications.',
    auraLabel: 'Native overlays',
    stats: [
      { label: 'Provider', value: 'OverlayProvider' },
      { label: 'Control', value: 'useOverlay' },
      { label: 'Render', value: 'iOS · Android' },
    ],
    principles: ['함수 호출 중심 제어', '테마에 맞춘 색과 글꼴', '화면별 상태 중복 감소'],
    icon: Sparkles,
  },
  {
    eyebrow: 'Capability 02',
    title: '플랫폼 글꼴 역할',
    stageTitle: '글꼴 역할',
    description: 'h1부터 overline까지 11개 variant로 글꼴을 고르고, iOS에서는 Dynamic Type 텍스트 스타일을 따릅니다.',
    detail: '두 플랫폼이 같은 크기표를 쓰며, ZSText와 useTheme().typography가 같은 역할을 제공합니다.',
    accent: 'Shared typography, system font scaling.',
    auraLabel: 'Readable hierarchy',
    stats: [
      { label: 'Roles', value: '11' },
      { label: 'iOS', value: 'Dynamic Type' },
      { label: 'Android', value: 'System font scale' },
    ],
    principles: ['역할 이름으로 고르기', '글자 크기 설정 존중', '브랜드 글꼴은 Provider에서'],
    icon: Type,
  },
  {
    eyebrow: 'Capability 03',
    title: '창 크기와 접힘선에 맞춰 반응하는 화면',
    stageTitle: '적응형 레이아웃',
    description: 'iPad·폴더블·데스크톱 창까지 플랫폼 공식 크기 클래스와 접힘선으로 화면을 나눕니다.',
    detail: 'LayoutProvider와 ZSPaneLayout으로 넓은 창의 2-pane과 접힘선 경계 분할을 구성합니다.',
    accent: 'Adaptive layout from phones to foldables and tablets.',
    auraLabel: 'Adaptive ready',
    stats: [
      { label: 'Hook', value: 'useWindowLayout' },
      { label: 'Layout', value: 'ZSPaneLayout' },
      { label: 'Platform', value: 'iOS · Android' },
    ],
    principles: ['공식 크기 클래스 기준', '화면을 가르는 접힘선에서 분할', 'Android 바 ↔ 레일 자동 전환'],
    icon: TabletSmartphone,
  },
  {
    eyebrow: 'Capability 04',
    title: '시드 색 하나로 만드는 테마',
    stageTitle: '색 역할',
    description: '브랜드 시드 색 하나로 라이트·다크·고대비 Material 3 색 역할을 만듭니다.',
    detail: 'ThemeProvider colors로 시드를 넘기고, 컴포넌트는 background·text·primaryContainer 같은 이름으로 색을 고릅니다.',
    accent: 'One seed, every mode and contrast.',
    auraLabel: 'Consistent theme',
    stats: [
      { label: 'Provider', value: 'ThemeProvider' },
      { label: 'Mode', value: 'Light / Dark / Contrast' },
      { label: 'Roles', value: 'Material 3' },
    ],
    principles: ['역할 이름으로 고르기', '다크·고대비 자동 대응', '네이티브 헤더까지 같은 테마'],
    icon: BookOpen,
  },
  {
    eyebrow: 'Capability 05',
    title: '화면 구조를 한 번에',
    stageTitle: '공통 화면 구조',
    description: 'SafeArea, 스크롤, 투명 헤더와 키보드 대응을 ZSScreen에 모았습니다.',
    detail: '입력 화면과 일반 화면을 같은 뼈대로 구성해 반복되는 레이아웃 결정을 줄입니다.',
    accent: 'One container for the screen foundation.',
    auraLabel: 'Screen foundation',
    stats: [
      { label: 'Root', value: 'ZSScreen' },
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
  const stepRefs = useRef<(HTMLElement | null)[]>([]);
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
                    <strong>iOS·Android 네이티브 우선 UI 툴킷</strong>
                  </div>
                  <div className={styles.dockActions}>
                    <Link to="/docs/Provider/start" className={styles.primaryAction}>
                      시작하기
                      <ArrowUpRight size={17} strokeWidth={2.2} aria-hidden="true" />
                    </Link>
                    <Link to="/docs/intro" className={styles.secondaryAction}>
                      <BookOpen size={17} strokeWidth={2.2} aria-hidden="true" />
                      API 문서
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
