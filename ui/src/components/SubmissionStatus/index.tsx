import { CheckCircleOutlined, CheckOutlined, LoadingOutlined } from '@ant-design/icons';
import styles from './styles.less';

interface ISubmissionStatus {
  status: 'PENDING' | 'Uploaded' | 'SCORE';
}

const SubmissionStatus: React.FC<ISubmissionStatus> = ({ status }) => {
  let statusIcon = <CheckOutlined />;
  if (status === 'PENDING') statusIcon = <LoadingOutlined spin />;
  if (status === 'Uploaded') statusIcon = <CheckCircleOutlined />;

  return <div className={styles.SubmissionStatus}>{statusIcon}</div>;
};

export default SubmissionStatus;
