import { TAssignment, TAssignmentProblem } from '@/types/assignment';
import moment from 'moment';
import { connect, useIntl } from 'umi';
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
  const intl = useIntl();

  // const handleGetSyncAllStatus = (customCb?: (state: any, error?: any, data?: any) => void) => {
  //   const callback = (state: any, _: any, data: any) => {
  //     if (state) {
  //       setCurrentId(state.currentId || '');
  //       setHistoryIds(state.historyIds || []);
  //     }
  //     customCb?.(state, _, data);
  //   };
  //   dispatch({
  //     type: 'settings/syncAllDataStatus',
  //     payload: {
  //       callback,
  //     },
  //   });
  // };
  const handleGetSubmissionStatus = (customCb?: (state: any, error?: any, data?: any) => void) => {
    const callback = (state: boolean, _: any, res: any) => {
      if (!state) {
        notification.error({ message: intl.formatMessage({ id: res.msgId }) });
        return;
      }
      customCb?.(state, _, res);
    };
    dispatch({
      type: 'submission/getStatusById',
      payload: { callback },
    });
  };

  useEffect(() => {
    if (!submissionIdChecking) {
      return;
    }
    const intervalRefreshCurrentProcess = setInterval(() => {
      const clearIntervalCb = (state: any, _: any, data: any) => {
        if (state && data.state === 'DONE') {
          clearInterval(intervalRefreshCurrentProcess);
        }
      };
      handleGetSubmissionStatus(clearIntervalCb);
    }, 5000);

    return () => clearInterval(intervalRefreshCurrentProcess);
  }, []);

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
    const submitCodeCb = (res: any, err?: any) => {
      if (!res) {
        console.error(err);
      }
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
            problemId={problemId}
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
