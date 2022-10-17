import { TAssignment } from '@/types/assignment';
import moment from 'moment';
import { connect, useIntl } from 'umi';
import AssignmentChild from '../Assignments/AssignmentChild';

import styles from './styles.less';
import ProblemList from './ProblemList';
import { Form, notification } from 'antd';
import Card from '@/components/Card';
import DoProblem from '@/components/AssignmentProblems/DoProblem';

interface IProblemsPage {
  assignment: TAssignment;
  dispatch?: any;
}

const ProblemsPage: React.FC<IProblemsPage> = ({ dispatch, assignment }) => {
  const [form] = Form.useForm();
  const intl = useIntl();

  const handleSubmitCode = (values: any) => {
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

  const handleChangeProblem = (problemId: string) => {
    form?.setFieldsValue({ problemId });
  };

  const renderDoProblem = () => {
    const now = moment();
    if (assignment) {
      const isAssignmentDisabled =
        moment(assignment.startTime).isAfter(now) ||
        (!!assignment.finishTime &&
          moment(assignment.finishTime).add(assignment.extraTime, 'minutes').isBefore(now));

      return (
        <Card
          cardTitle={intl.formatMessage({ id: 'problem.do-problem.title' })}
          cardDescription={
            isAssignmentDisabled
              ? intl.formatMessage({ id: 'exception.assignment.no-do' })
              : undefined
          }
        >
          <DoProblem
            onFinish={handleSubmitCode}
            form={form}
            notAllowedDo={isAssignmentDisabled}
            initialValues={{
              assignmentId: assignment.id,
            }}
          />
        </Card>
      );
    }
    return null;
  };

  return (
    <AssignmentChild
      noSelectMessage={intl.formatMessage({ id: 'problem.my.no-assignment-selected' })}
      notFoundMessage={intl.formatMessage({ id: 'problem.my.assignment-not-found' })}
      childName="problems"
      className={styles.ProblemPage}
    >
      <ProblemList onChangeProblem={handleChangeProblem} />
      {renderDoProblem()}
    </AssignmentChild>
  );
};

export default connect(({ assignments }: any) => {
  const assignmentData = assignments.selected
    ? assignments.dic[assignments.selected]
    : { problems: [] };
  return {
    assignment: assignments.selected ? assignmentData : undefined,
  };
})(ProblemsPage);
