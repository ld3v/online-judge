import { TAssignment } from '@/types/assignment';
import { Modal, ModalProps, Skeleton } from 'antd';
import { connect, useIntl } from 'umi';
import AssignmentProblems from '../AssignmentProblems';
import DoProblem from '../AssignmentProblems/DoProblem';

interface IModalViewProblems extends ModalProps {
  loading?: boolean;
  visible?: boolean;
  assignment?: TAssignment;
  assignmentId?: string;
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
  dispatch,
}) => {
  const intl = useIntl();

  const handleClose = () => {
    dispatch({ type: 'assignments/setPreviewSelected' });
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
      <AssignmentProblems assignmentId={assignmentId} />
      <DoProblem />
    </Modal>
  );
};

export default connect(({ assignments }: any) => {
  return {
    visible: !!assignments.previewSelected,
    assignmentId: assignments.previewSelected,
    assignment: assignments.dic[assignments.previewSelected],
  };
})(ModalViewProblems);
