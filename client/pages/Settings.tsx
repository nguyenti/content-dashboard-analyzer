import styles from './Settings.module.css';

export function Settings() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Settings</h1>
        <p>Configure your platforms and preferences</p>
      </div>
      
      <div className={styles.contentCard}>
        <h2>Platform Settings</h2>
        <p>Connect your social media accounts and configure API keys</p>
      </div>
    </div>
  );
}