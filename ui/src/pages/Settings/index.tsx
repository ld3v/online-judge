import Configuration from './Configuration';
import styles from './styles.less';
import SyncConfiguration from './SyncConfiguration';
import SyncData from './SyncData';

const SettingsPage = () => {
  return (
    <div className={styles.SettingsPage}>
      <Configuration className={styles.UpdateBasic} />
      <SyncConfiguration className={styles.SyncConfiguration} />
      <SyncData />
    </div>
  );
};

export default SettingsPage;
