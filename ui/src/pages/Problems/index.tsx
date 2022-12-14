import { TAssignment, TAssignmentProblem } from '@/types/assignment';
import moment from 'moment';
import { connect, FormattedMessage, Link, useIntl } from 'umi';
import AssignmentChild from '../Assignments/AssignmentChild';

import styles from './styles.less';
import ProblemList from './ProblemList';
import { Form, notification } from 'antd';
import Card from '@/components/Card';
import DoProblem from '@/components/AssignmentProblems/DoProblem';
import { useEffect, useState } from 'react';

interface IProblemsPage {
  assignment: TAssignment;
  assProblemDic: Record<string, TAssignmentProblem>;
  dispatch?: any;
}

const ProblemsPage: React.FC<IProblemsPage> = ({ dispatch, assignment }) => {
  const [form] = Form.useForm();
  const [problemId, setProblemId] = useState<string | undefined>(undefined);
  const [submissionIdChecking, setSubmissionIdToCheck] = useState<string | undefined>(undefined);
  const [currentResult, setCurrentResult] = useState<string | undefined>(undefined);
  const intl = useIntl();

  const handleGetSubmissionStatus = (customCb?: (res: any) => void) => {
    const callback = (res: any) => {
      if (!res) {
        notification.error({ message: intl.formatMessage({ id: res.msgId }) });
        return;
      }
      customCb?.(res);
    };
    dispatch({
      type: 'submission/getStatusById',
      payload: { id: submissionIdChecking, callback },
    });
  };

  useEffect(() => {
    if (!submissionIdChecking) {
      return;
    }
    const intervalCheckingSubmissionStatus = setInterval(() => {
      const clearIntervalCb = (res: any) => {
        if (res && (res.queueState === 'DONE' || res.queueState === 'ERR')) {
          clearInterval(intervalCheckingSubmissionStatus);
          setSubmissionIdToCheck(undefined);
          setCurrentResult(res.result);
        }
      };
      handleGetSubmissionStatus(clearIntervalCb);
    }, 3000);

    return () => clearInterval(intervalCheckingSubmissionStatus);
  }, [submissionIdChecking]);

  const handleSubmitCode = (values: any) => {
    const { assignmentId, languageExtension, code } = values;
    if (!problemId) {
      notification.error({
        message: intl.formatMessage({ id: 'exception.submission.no-problem-selected' }),
      });
    }
    if (!assignmentId || !languageExtension) {
      notification.error({
        message: intl.formatMessage({ id: 'exception.component.form.miss-data' }),
      });
      return;
    }
    if (!code || code.trim() === '') {
      notification.error({
        message: intl.formatMessage({ id: 'exception.problem-solving.code-empty' }),
      });
      return;
    }
    const submitCodeCb = (res: any, err?: any) => {
      if (!res) {
        console.error(err);
      }
      setSubmissionIdToCheck(res.id);
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
    setProblemId(problemId);
    if (form) {
      form.setFieldValue('code', '');
    }
  };

  const renderDoProblem = () => {
    const now = moment();
    if (assignment) {
      const isAssignmentDisabled =
        moment(assignment.startTime).isAfter(now) ||
        (!!assignment.finishTime &&
          moment(assignment.finishTime).add(assignment.extraTime, 'minutes').isBefore(now));

      const codeEditorLink = `/code-editor?${assignment ? `ass=${assignment.id}&` : ''}${
        problemId ? `prob=${problemId}` : ''
      }`;

      return (
        <Card
          cardTitle={intl.formatMessage({ id: 'problem.do-problem.title' })}
          cardDescription={
            isAssignmentDisabled
              ? intl.formatMessage({ id: 'exception.assignment.no-do' })
              : undefined
          }
        >
          <Link to={codeEditorLink}>
            <FormattedMessage id="site.go-to-beta" />
          </Link>
          <DoProblem
            onFinish={handleSubmitCode}
            form={form}
            notAllowedDo={isAssignmentDisabled}
            initialValues={{
              assignmentId: assignment.id,
            }}
            problemId={problemId}
            checking={{
              loading: !!submissionIdChecking,
              result: currentResult,
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
