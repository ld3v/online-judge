import Card from '@/components/Card';
import { notification, Skeleton } from 'antd';
import { useEffect } from 'react';
import { connect, useHistory, useIntl, useParams } from 'umi';
import ProblemForm from './ProblemForm';

interface IUpdateProblemPage {
  dispatch: any;
  current: any;
  currentLoading: boolean;
  currentUpdating: boolean;
}

const UpdateProblemPage: React.FC<IUpdateProblemPage> = ({
  dispatch,
  current,
  currentLoading,
  currentUpdating,
}) => {
  const intl = useIntl();
  const params = useParams();
  const history = useHistory();

  const handleSubmit = ({ languages, ...data }: any) => {
    const { id }: any = params || {};
    const callback = (res: any) => {
      if (res) {
        notification.success({
          message: intl.formatMessage({ id: 'problem.update.successfully' }),
        });
        history.push('/problems-manage');
      }
    };
    dispatch({
      type: 'problem/update',
      payload: {
        id,
        data: {
          languages: languages.map(({ id: langId, problemLangId, ...langData }: any) => ({
            id: problemLangId,
            language_id: langId,
            ...langData,
          })),
          ...data,
        },
        callback,
      },
    });
  };

  useEffect(() => {
    const { id }: any = params || {};
    const callback = (res: any) => {
      if (!res) {
        notification.error({
          message: intl.formatMessage({ id: 'exception.problem.notfound' }, { isMany: false }),
        });
        history.goBack();
      }
    };
    dispatch({
      type: 'problem/getById',
      payload: {
        id,
        callback,
      },
    });
  }, []);

  if (!current || currentLoading) {
    return (
      <Card cardTitle={intl.formatMessage({ id: 'problem.update' })}>
        <Skeleton active />
      </Card>
    );
  }

  const { diff_cmd, diff_arg, languages, ...currentInfo } = current;
  const defaultValues = {
    diff_command: {
      command: diff_cmd || '',
      args: diff_arg || '',
    },
    languages: languages.map(({ id: problemLangId, langId, ...langData }: any) => ({
      id: langId,
      problemLangId,
      ...langData,
    })),
    ...currentInfo,
  };
  return (
    <ProblemForm
      cardTitle={intl.formatMessage({ id: 'problem.update' })}
      onSubmit={handleSubmit}
      submitting={currentUpdating}
      defaultValues={defaultValues}
    />
  );
};

export default connect(({ problem, loading }: any) => ({
  current: problem.dic[problem.current],
  currentLoading: loading.effects['problem/getById'],
  currentUpdating: loading.effects['problem/update'],
}))(UpdateProblemPage);
