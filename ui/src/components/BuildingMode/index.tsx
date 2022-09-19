import { FormattedMessage } from 'umi';
import styles from './styles.less';

const BuildingMode = () => {
  return (
    <div className={styles.BuildingMode}>
      <div className="building-content">
        <img src="/building.png" alt="warn-build-mode" />
        <FormattedMessage id="system.feature.building" />
      </div>
    </div>
  );
};

export default BuildingMode;
