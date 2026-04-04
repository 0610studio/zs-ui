import React, { useEffect, useRef, useState } from 'react';
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
  word: string;
  eyebrow: string;
  title: string;
  description: string;
  detail: string;
  accent: string;
  auraLabel: string;
  stats: Array<{
    label: string;
    value: string;
  }>;
  principles: string[];
  icon: LucideIcon;
};

const scenes: Scene[] = [
  {
    word: '오버레이 컴포넌트',
    eyebrow: 'Capability 01',
    title: '오버레이 컴포넌트',
    description:
      'useOverlay로 Alert, Snackbar, BottomSheet, Loader 등을 한 방식으로 제어합니다.',
    detail: 'OverlayProvider 하나로 화면별 오버레이 상태를 따로 만들지 않아도 됩니다.',
    accent: 'One overlay pattern for common feedback and actions.',
    auraLabel: 'Unified overlays',
    stats: [
      { label: 'API', value: 'show* / hideOverlay' },
      { label: 'Coverage', value: '6 overlay types' },
      { label: 'Provider', value: 'Global state' },
    ],
    principles: ['함수 호출 중심 제어', '상태 중복 감소', '일관된 피드백 흐름'],
    icon: Sparkles,
  },
  {
    word: '타이포그래피 스케일',
    eyebrow: 'Capability 02',
    title: '타이포그래피 스케일',
    description:
      'heading부터 caption까지 6×6 타이포그래피 체계를 제공합니다.',
    detail: 'ZSText와 useTheme.typography가 같은 기준을 사용합니다.',
    accent: 'A shared type scale for consistent text hierarchy.',
    auraLabel: 'Readable hierarchy',
    stats: [
      { label: 'Scale', value: '6 groups × 6 levels' },
      { label: 'Access', value: 'useTheme.typography' },
      { label: 'Bridge', value: 'ZSText + Text' },
    ],
    principles: ['일관된 텍스트 계층', '같은 기준으로 재사용', '읽기 흐름 유지'],
    icon: Type,
  },
  {
    word: '폴더블 대응',
    eyebrow: 'Capability 03',
    title: '폴더블 대응',
    description:
      'Android 폴더블의 접힘과 펼침 상태를 감지할 수 있습니다.',
    detail: 'ZSContainer로 펼침 상태의 양면 레이아웃을 구성할 수 있습니다.',
    accent: 'Fold-aware layout for devices that open wider.',
    auraLabel: 'Foldable ready',
    stats: [
      { label: 'Platform', value: 'Android foldables' },
      { label: 'Hook', value: 'useFoldingState' },
      { label: 'Layout', value: 'rightComponent' },
    ],
    principles: ['폴딩 상태 감지', '양면 레이아웃 지원', '넓은 화면에 자연스럽게 대응'],
    icon: TabletSmartphone,
  },
  {
    word: '기본 UI 세트',
    eyebrow: 'Capability 04',
    title: '기본 UI 세트',
    description:
      '자주 쓰는 기본 UI를 같은 테마 규칙으로 제공합니다.',
    detail: '텍스트, 뷰, 입력, 버튼을 같은 기준으로 조합할 수 있습니다.',
    accent: 'Core UI primitives with shared theme behavior.',
    auraLabel: 'System primitives',
    stats: [
      { label: 'Primitives', value: 'Text · View · Input' },
      { label: 'Actions', value: 'Pressable · Button' },
      { label: 'Theme', value: 'Palette-aware' },
    ],
    principles: ['테마 기반 기본 컴포넌트', '공통 스타일 규칙', '빠른 화면 조합'],
    icon: BookOpen,
  },
  {
    word: '공통 화면 구조',
    eyebrow: 'Capability 05',
    title: '공통 화면 구조',
    description: 'ZSContainer가 SafeArea, 스크롤, 상태바, 키보드 대응을 함께 제공합니다.',
    detail: '입력 화면과 일반 화면을 같은 패턴으로 구성할 수 있습니다.',
    accent: 'One container for common screen structure.',
    auraLabel: 'Screen foundation',
    stats: [
      { label: 'Root', value: 'ZSContainer' },
      { label: 'Keyboard', value: 'Auto scroll' },
      { label: 'Layout', value: 'Header / Footer / Foldable' },
    ],
    principles: ['공통 화면 패턴', '키보드 대응 내장', '레이아웃 반복 감소'],
    icon: Layers3,
  },
];

const LandingPage = () => {
  const { siteConfig } = useDocusaurusContext();
  const [activeScene, setActiveScene] = useState(0);
  const stepRefs = useRef<Array<HTMLElement | null>>([]);

  useEffect(() => {
    let frameId = 0;

    const updateActiveScene = () => {
      frameId = 0;

      const viewportCenter = window.innerHeight * 0.5;
      let closestIndex = 0;
      let closestDistance = Number.POSITIVE_INFINITY;

      stepRefs.current.forEach((step, index) => {
        if (!step) {
          return;
        }

        const rect = step.getBoundingClientRect();
        const sectionCenter = rect.top + rect.height * 0.5;
        const distance = Math.abs(sectionCenter - viewportCenter);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });

      setActiveScene((current) => (current === closestIndex ? current : closestIndex));
    };

    const onScroll = () => {
      if (frameId !== 0) {
        return;
      }

      frameId = window.requestAnimationFrame(updateActiveScene);
    };

    updateActiveScene();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);

      if (frameId !== 0) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, []);

  const scene = scenes[activeScene];
  const SceneIcon = scene.icon;

  return (
    <main className={`${styles.root} ${styles[`theme${activeScene}`]}`}>
      <section className={styles.experience}>
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
                <Waves size={15} strokeWidth={2.1} />
                <span>{siteConfig.title}</span>
              </div>

              <div className={styles.sceneChip}>
                <SceneIcon size={15} strokeWidth={2.1} />
                <span>{scene.auraLabel}</span>
              </div>
            </div>

            <div className={styles.centerpiece}>
              <div className={styles.heroWordWrap}>
                <span className={styles.heroEyebrow}>{scene.eyebrow}</span>
                <strong key={scene.word} className={styles.heroWord}>
                  {scene.word}
                </strong>
                <p key={scene.accent} className={styles.heroAccent}>
                  {scene.accent}
                </p>
              </div>

              <div className={styles.centerDock}>
                <div className={styles.centerDockGlow} aria-hidden="true" />
                <div className={styles.centerDockBody}>
                  <p className={styles.centerDockKicker}>Documentation</p>
                  <Link to="/docs/intro" className={styles.centerDockButton}>
                    문서 바로가기
                    <span className={styles.centerDockArrow} aria-hidden="true">
                      <ArrowUpRight size={18} strokeWidth={2.2} />
                    </span>
                  </Link>
                  <p className={styles.centerDockCaption}></p>
                </div>
              </div>
            </div>

          </div>
        </div>

        <div className={styles.scrollRail}>
          {scenes.map((item, index) => {
            const ItemIcon = item.icon;
            const isActive = index === activeScene;

            return (
              <section
                key={item.word}
                ref={(node) => {
                  stepRefs.current[index] = node;
                }}
                className={styles.storyStep}
                aria-label={`${item.eyebrow} ${item.title}`}>
                <article className={`${styles.storyCard} ${isActive ? styles.storyCardActive : ''}`}>
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
                      {item.principles.map((principle) => (
                        <li key={principle} className={styles.principleItem}>
                          {principle}
                        </li>
                      ))}
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
};

export default LandingPage;
