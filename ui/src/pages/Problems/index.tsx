import { TAssignment, TAssignmentProblem } from '@/types/assignment';
import moment from 'moment';
import { connect, useIntl } from 'umi';
import AssignmentChild from '../Assignments/AssignmentChild';

import styles from './styles.less';
import ProblemList from './ProblemList';
import { Form, notification } from 'antd';
import Card from '@/components/Card';
import DoProblem from '@/components/AssignmentProblems/DoProblem';
import { useState } from 'react';
import { TCodeEditorLang, TLanguageExt } from '@/components/Code/CodeEditor/language';
import { langExt2CodeEditorLang } from '@/components/Code/CodeEditor/utils';

interface IProblemsPage {
  assignment: TAssignment;
  assProblemDic: Record<string, TAssignmentProblem>;
  dispatch?: any;
}

const ProblemsPage: React.FC<IProblemsPage> = ({ dispatch, assignment, assProblemDic }) => {
  const [form] = Form.useForm();
  const [langAvailable, setLangAvailable] = useState<TLanguageExt[] | undefined>(undefined);
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
    form.setFieldsValue({ problemId });
    if (assProblemDic?.[problemId]) {
      const langExtSupport = [
        ...new Set((assProblemDic[problemId].langExtAvailable || []).filter((t) => t)),
      ] as TLanguageExt[];
      setLangAvailable(langExtSupport.length === 0 ? undefined : langExtSupport);
    }
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
            codeEditorProps={{
              languageExtensionAvailable: langAvailable,
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
    assProblemDic: assignments.problemDic,
  };
})(ProblemsPage);
