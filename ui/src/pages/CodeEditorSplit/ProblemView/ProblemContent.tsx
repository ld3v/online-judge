import { TProblem } from '@/types/problem';
import { getMDContent } from '@/utils/funcs';
import styles from './styles.less';

interface IProblemContent {
  data: TProblem;
}
const ProblemContent: React.FC<IProblemContent> = ({ data }) => {
  const htmlParsed = getMDContent(data.content);

  return (
    <div className={styles.Problem}>
      <h4>{data.name}</h4>
      <div className={styles.ProblemContent}>
        <div dangerouslySetInnerHTML={{ __html: htmlParsed }} />
      </div>
    </div>
  );
};

export default ProblemContent;
