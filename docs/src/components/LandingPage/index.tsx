import React from 'react';
import { Monitor, Smartphone, Layout, Box, Code, Palette, Database, Grid, Share2, Layers, Command, Cpu } from 'lucide-react';
import styles from './styles.module.css';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Link from '@docusaurus/Link';

const LandingPage = () => {
  const { siteConfig } = useDocusaurusContext();
  const icons = [
    Monitor, Smartphone, Layout, Box, Code, Palette,
    Database, Grid, Share2, Layers, Command, Cpu
  ];

  const FloatingIcon = ({ Icon, index }) => (
    <div
      className={styles.floatingIcon}
      style={{
        left: `${(index * 15) % 85}%`,
        top: `${(index * 20) % 75}%`,
        transform: `rotate(${index * 30}deg)`,
        animation: `${styles.bounce} ${3 + index % 2}s ease-in-out infinite ${index * 0.5}s`
      }}
    >
      <Icon size={48} color="#fb923c" />
    </div>
  );

  return (
    <div className={styles.container}>
      {/* Floating Icons Background */}
      <div className={styles.iconContainer}>
        {icons.map((Icon, index) => (
          <FloatingIcon key={index} Icon={Icon} index={index} />
        ))}
      </div>

      {/* Main Content */}
      <div className={styles.mainContent}>
        <div className={styles.contentWrapper}>
          {/* Title with Gradient */}
          <h1 className={styles.title}>
            {siteConfig.title}
          </h1>

          {/* Tagline */}
          <p className={styles.tagline}>
            {siteConfig.tagline}
          </p>

          {/* CTA Buttons */}
          <div className={styles.buttonContainer}>
            <Link to="/docs/intro">
              <button className={styles.primaryButton}>
                Documentation
              </button>
            </Link>
            {/* <button className={styles.secondaryButton}>
              Documentation
            </button> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;