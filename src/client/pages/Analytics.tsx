import React from 'react';
import styles from './Analytics.module.css';

export function Analytics() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Analytics</h1>
        <p>Deep dive into your content performance</p>
      </div>
      
      <div className={styles.contentCard}>
        <h2>Advanced Analytics</h2>
        <p>Coming soon - detailed analytics and insights</p>
      </div>
    </div>
  );
}