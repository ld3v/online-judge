import { FormInstance, notification } from 'antd';
import { connect, useHistory, useIntl } from 'umi';
import ProblemForm from './ProblemForm';

interface ICreateProblemPage {
  dispatch: any;
}

const CreateProblemPage: React.FC<ICreateProblemPage> = ({ dispatch }) => {
  const intl = useIntl();
  const history = useHistory();

  const handleSubmit = ({ languages, upload, ...data }: any, form: FormInstance<any>) => {
    const callback = (res: any, error: any) => {
      if (res) {
        notification.success({
          message: intl.formatMessage({ id: 'problem.create.success' }),
        });
        history.push('/problems-manage');
        return;
      }
      form.setFields([
        { name: 'upload', errors: [intl.formatMessage({ id: error.messageId }, error.errorData)] },
      ]);
    };
    dispatch({
      type: 'problem/create',
      payload: {
        data: {
          languages: languages.map(({ id: langId, ...langData }: any) => ({
            language_id: langId,
            time_limit: langData.time_limit,
            memory_limit: langData.memory_limit,
          })),
          upload:
            Array.isArray(upload) && upload.length > 0
              ? upload.map((uploadItem) => uploadItem.file)
              : [],
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
