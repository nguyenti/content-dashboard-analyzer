import styles from './ContentManager.module.css';

export function ContentManager() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Content Manager</h1>
        <p>Manage your content and scripts</p>
      </div>
      
      <div className={styles.contentCard}>
        <h2>Content Management</h2>
        <p>Upload scripts, manage content, and track performance</p>
      </div>
    </div>
  );
}