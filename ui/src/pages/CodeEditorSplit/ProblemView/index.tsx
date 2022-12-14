import { TProblem } from '@/types/problem';
import { ArrowLeftOutlined, ExclamationCircleOutlined, LoadingOutlined } from '@ant-design/icons';
import { connect, useIntl } from 'umi';
import ProblemContent from './ProblemContent';
import styles from './styles.less';

interface IProblemView {
  loadingMsg?: string;
  warningMsg?: string;
  data?: TProblem;
}
const ProblemView: React.FC<IProblemView> = ({ loadingMsg, warningMsg, data }) => {
  const intl = useIntl();

  const content = () => {
    if (!!loadingMsg) {
      return (
        <div className={`${styles.infoContent} load`}>
          <LoadingOutlined />
          <div>{intl.formatMessage({ id: loadingMsg })}</div>
        </div>
      );
    }
    if (!!warningMsg || !data) {
      return (
        <div className={`${styles.infoContent} warn`}>
          <ExclamationCircleOutlined />
          <div>
            {intl.formatMessage(
              { id: warningMsg || 'problem-solving.empty-data' },
              { isMany: false },
            )}
          </div>
        </div>
      );
    }
    return <ProblemContent data={data} />;
  };

  return (
    <div className={styles.ProblemWrapper}>
      <div className={styles.ProblemBar}>
        <div className={styles.back}>
          <ArrowLeftOutlined />
        </div>
        <div className={styles.logo}>
          <img src="/icons/icon-full.png" alt="logo-full" />
        </div>
      </div>
      <div
        className={
          styles.ProblemContentWrapper + ((!loadingMsg && !warningMsg) || !!data ? '' : ' info')
        }
      >
        {content()}
      </div>
    </div>
  );
};

export default connect(({ assignments, problem }: any, { problemId }: any) => {
  const problemByAssignment = assignments.problemDic[problemId];
  const problemByProblem = problem.dic[problemId];
  return {
    data: problemByProblem || problemByAssignment,
  };
})(ProblemView);
