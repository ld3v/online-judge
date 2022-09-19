import { notification } from 'antd';
import React from 'react';
import { connect, useHistory, useIntl } from 'umi';
import AssignmentForm from './AssignmentForm';

interface ICreateAssignmentPage {
  dispatch?: any;
}

const CreateAssignmentPage: React.FC<ICreateAssignmentPage> = ({ dispatch }) => {
  const intl = useIntl();
  const history = useHistory();

  const handleSubmit = (data: any) => {
    const callback = (res: any) => {
      console.log(res);
      if (res) {
        notification.success({ message: intl.formatMessage({ id: 'assignment.create.success' }) });
        history.push('/assignments-manage');
      }
    };
    dispatch({
      type: 'assignments/create',
      payload: {
        data,
        callback,
      },
    });
  };

  return (
    <AssignmentForm
      cardTitle={intl.formatMessage({ id: 'assignment.add' })}
      onSubmit={handleSubmit}
    />
  );
};

export default connect()(CreateAssignmentPage);
