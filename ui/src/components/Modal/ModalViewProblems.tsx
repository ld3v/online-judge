import { TAssignment } from '@/types/assignment';
import { Form, Modal, ModalProps, notification, Skeleton } from 'antd';
import { connect, useIntl } from 'umi';
import AssignmentProblems from '../AssignmentProblems';
import DoProblem from '../AssignmentProblems/DoProblem';

interface IModalViewProblems extends ModalProps {
  loading?: boolean;
  visible?: boolean;
  assignment?: TAssignment;
  assignmentId?: string;
  isSubmittingCode?: boolean;
  dispatch?: any;
}

/**
 * This modal only view for ADMIN.
 *
 * In case admin need to preview assignment's problems.
 *
 * ----
 * @param {IModalViewProblems} ModalViewProblemsProps
 * @returns Modal component
 */
const ModalViewProblems: React.FC<IModalViewProblems> = ({
  assignment,
  assignmentId,
  loading,
  visible,
  isSubmittingCode,
  dispatch,
}) => {
  const [doProblemForm] = Form.useForm();
  const intl = useIntl();

  const handleClose = () => {
    dispatch({ type: 'assignments/setPreviewSelected' });
    doProblemForm?.resetFields();
  };

  const handleChangeProblem = (problemId: string) => {
    doProblemForm?.setFieldsValue({ problemId });
  };

  const handleSubmit = (values: any) => {
    const { assignmentId, problemId, languageExtension, code } = values;
    if (!assignmentId || !problemId || !languageExtension) {
      notification.error({
        message: intl.formatMessage({ id: 'exception.component.form.miss-data' }),
      });
      return;
    }
    const submitCodeCb = (res: any, err?: any) => {
      if (err) console.error(err);
    };
    dispatch({
      type: 'submission/createWithCode',
      payload: {
        assignmentId,
        problemId,
        languageExtension,
        code,
        callback: submitCodeCb,
      },
    });
  };

  const modalBaseProps: ModalProps = {
    visible,
    footer: null,
    maskClosable: false,
    closable: true,
    style: {
      top: 55,
    },
    width: 'calc(100% - 50px)',
    onCancel: () => handleClose(),
  };

  if (loading) {
    return (
      <Modal
        {...modalBaseProps}
        title={intl.formatMessage({ id: 'component.loading.modal.title' })}
      >
        <Skeleton active />
      </Modal>
    );
  }

  if (!assignment) {
    return (
      <Modal
        {...modalBaseProps}
        title={intl.formatMessage({ id: 'exception.assignment.notfound' }, { isMany: false })}
      />
    );
  }

  return (
    <Modal {...modalBaseProps} title={assignment.name}>
      <AssignmentProblems assignmentId={assignmentId} onChangeProblem={handleChangeProblem} />
      <DoProblem
        onFinish={handleSubmit}
        codeEditorProps={{
          setOptions: {
            enableSnippets: true,
            enableLiveAutocompletion: true,
            enableBasicAutocompletion: true,
          },
        }}
        form={doProblemForm}
        isSubmitting={isSubmittingCode}
        initialValues={{
          assignmentId,
        }}
      />
    </Modal>
  );
};

export default connect(({ assignments, loading }: any) => {
  return {
    isSubmittingCode: loading.effects['submission/createWithCode'],
    visible: !!assignments.previewSelected,
    assignmentId: assignments.previewSelected,
    assignment: assignments.dic[assignments.previewSelected],
  };
})(ModalViewProblems);
