import { LoadingOutlined } from '@ant-design/icons';
import styles from './styles.less';

interface ILoadingWrapper {
  children?: JSX.Element | JSX.Element[];
}
const LoadingWrapper: React.FC<ILoadingWrapper> = ({ children }) => {
  return (
    <div className={styles.LoadingWrapper}>
      <div className={styles.cover}>
        <LoadingOutlined spin />
      </div>
      {children || null}
    </div>
  );
};

export default LoadingWrapper;
