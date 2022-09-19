import { notification } from 'antd';
import { connect, useHistory, useIntl } from 'umi';
import ProblemForm from './ProblemForm';

interface ICreateProblemPage {
  dispatch: any;
}

const CreateProblemPage: React.FC<ICreateProblemPage> = ({ dispatch }) => {
  const intl = useIntl();
  const history = useHistory();

  const handleSubmit = ({ languages, ...data }: any) => {
    const callback = (res: any) => {
      if (res) {
        notification.success({
          message: intl.formatMessage({ id: 'problem.create.success' }),
        });
        history.push('/problems-manage');
      }
    };
    dispatch({
      type: 'problem/create',
      payload: {
        data: {
          languages: languages.map(({ id: langId, ...langData }: any) => ({
            language_id: langId,
            ...langData,
          })),
          ...data,
        },
        callback,
      },
    });
  };
  return (
    <ProblemForm cardTitle={intl.formatMessage({ id: 'problem.create' })} onSubmit={handleSubmit} />
  );
};

export default connect()(CreateProblemPage);
