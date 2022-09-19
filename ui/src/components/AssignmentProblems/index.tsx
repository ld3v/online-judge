import { Col, Row, Skeleton } from 'antd';
import React, { useEffect, useState } from 'react';
import { connect, FormattedMessage, useIntl } from 'umi';
import Table, { ColumnProps } from 'antd/lib/table';
import { ErrorBoundary } from '@/components/Boundary';
import MarkdownView from '../Markdown/MarkdownView';
import { TAssignment } from '@/types/assignment';

import styles from './styles.less';

interface IAssignmentProblems {
  assignmentId: string;
  // From dispatch
  dispatch?: any;
  currentAccount?: any;
  assignment?: TAssignment;
  problems?: any[];
  problemDic?: Record<string, any>;
  problemLoading?: boolean;
  onChangeProblem?: (id: string) => void;
}

const AssignmentProblems: React.FC<IAssignmentProblems> = ({
  assignmentId,
  dispatch,
  problems,
  problemDic,
  problemLoading,
  onChangeProblem,
}) => {
  const intl = useIntl();

  const [problemViewing, setProblemViewing] = useState<string>('');

  const handleGetProblems = (id: string) => {
    const callback = (res: any) => {
      if (!res) {
        return;
      }
      console.log(res);
      setProblemViewing(res.problemIds[0]);
    };
    dispatch({
      type: 'assignments/getProblems',
      payload: {
        callback,
        id,
      },
    });
  };
  const handleSelectProblem = (id: string) => {
    setProblemViewing(id);
    onChangeProblem?.(id);
  };

  useEffect(() => {
    if (assignmentId) {
      handleGetProblems(assignmentId);
    }
  }, [assignmentId]);

  console.log(assignmentId);
  if (!assignmentId) {
    return null;
  }

  if (problemLoading) {
    return <Skeleton active />;
  }
  const problemListCols: ColumnProps<any>[] = [
    {
      title: intl.formatMessage({ id: 'problem.table.view.problem-list' }),
      colSpan: 2,
      width: '75%',
      key: 'name',
      dataIndex: 'problemName',
    },
    { key: 'score', width: '25%', dataIndex: 'score', className: 'problem-score' },
  ];

  const renderProblemContent = () => {
    if (problemViewing) {
      console.log(problemViewing);
      return (
        <>
          <div className={styles.ProblemTitle}>
            <b>{problemDic?.[problemViewing].problemName}:</b>
            &nbsp;
            {problemDic?.[problemViewing].name}
          </div>
          <MarkdownView children={problemDic?.[problemViewing].content || ''} />
        </>
      );
    }
    return <FormattedMessage id="problem.my.no-assignment-selected" />;
  };

  return (
    <Row gutter={[20, 0]}>
      <Col span={15}>
        <ErrorBoundary>{renderProblemContent()}</ErrorBoundary>
      </Col>
      <Col span={9}>
        <ErrorBoundary>
          <Table
            className={styles.ProblemList}
            dataSource={problems}
            columns={problemListCols}
            tableLayout="fixed"
            rowClassName={({ id, status }) =>
              `${styles.ProblemItem} ${id !== problemViewing ? 'clickable ' : ''}${status || ''}`
            }
            onRow={({ id }) => ({
              onClick: () => handleSelectProblem(id),
            })}
            rowKey="id"
            bordered
            pagination={false}
          />
        </ErrorBoundary>
      </Col>
    </Row>
  );
};

export default connect(({ assignments, loading }: any, { assignmentId }: any) => {
  const assignmentData = assignmentId ? assignments.dic[assignmentId] : { problems: [] };
  const { problems } = assignmentData || { problems: [] };
  return {
    problems: problems.map((id: string) => assignments.problemDic[id]).filter((item: any) => item),
    problemDic: assignments.problemDic,
    problemLoading: loading.effects['assignments/getProblems'],
  };
})(AssignmentProblems);
