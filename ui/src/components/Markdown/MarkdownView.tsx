import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ReactMarkdownOptions } from 'react-markdown/lib/react-markdown';

import styles from './styles.less';

interface IMarkdownView extends ReactMarkdownOptions {}

const MarkdownView: React.FC<IMarkdownView> = ({ children }) => {
  return (
    <ReactMarkdown className={styles.markdown} remarkPlugins={[remarkGfm]} children={children} />
  );
};

export default MarkdownView;
