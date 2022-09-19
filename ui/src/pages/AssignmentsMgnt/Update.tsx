import { notification, Skeleton } from 'antd';
import moment from 'moment';
import React, { useEffect } from 'react';
import { connect, useHistory, useIntl, useParams } from 'umi';
import AssignmentForm from './AssignmentForm';

interface IUpdateAssignmentPage {
  selected?: any;
  selectedLoading?: boolean;
  selectedUpdating?: boolean;
  dispatch?: any;
}

const UpdateAssignmentPage: React.FC<IUpdateAssignmentPage> = ({
  selected,
  selectedLoading,
  selectedUpdating,
  dispatch,
}) => {
  const intl = useIntl();
  const params = useParams();
  const history = useHistory();

  const handleSubmit = (data: any) => {
    const { id }: any = params || {};
    const callback = (res: any) => {
      if (res) {
        notification.success({
          message: intl.formatMessage({ id: 'assignment.update.success' }),
        });
        history.push('/assignments-manage');
      }
    };
    dispatch({
      type: 'assignments/updateById',
      payload: {
        id,
        data,
        callback,
      },
    });
  };

  useEffect(() => {
    const { id }: any = params || {};
    const callback = (res: any) => {
      if (!res) {
        notification.error({
          message: intl.formatMessage({ id: 'exception.assignment.notfound' }, { isMany: false }),
        });
        history.goBack();
      }
    };
    dispatch({
      type: 'assignments/getById',
      payload: {
        id,
        callback,
      },
    });
  }, []);

  if (!selected || selectedLoading) {
    return <Skeleton />;
  }

  const { startTime, finishTime, extraTime, ...assignmentInfo } = selected;
  const defaultValues = {
    time: {
      startTime: !!startTime && moment(startTime),
      finishTime: !!finishTime && moment(finishTime),
    },
    extra_time: extraTime,
    ...assignmentInfo,
  };

  return (
    <AssignmentForm
      cardTitle={intl.formatMessage({ id: 'assignment.update' })}
      onSubmit={handleSubmit}
      defaultValues={defaultValues}
      submitting={selectedUpdating}
    />
  );
};

export default connect(({ assignments, account, loading }: any) => {
  const { participants, problems, ...selectedInfo } = assignments.selected
    ? assignments.dic[assignments.selected]
    : { participants: [], problems: [] };
  return {
    selected: assignments.selected
      ? {
          ...selectedInfo,
          problems: problems.map((id: string) => assignments.problemDic[id]),
          participants: participants.map((id: string) => account.dic[id]),
        }
      : undefined,
    selectedLoading: loading.effects['assignments/getById'],
    selectedUpdating: loading.effects['assignments/updateById'],
  };
})(UpdateAssignmentPage);
