import ActionIcons from '@/components/ActionIcons';
import { ErrorBoundary } from '@/components/Boundary';
import CardWrapTable from '@/components/CardWrapTable';
import SubmissionStatus from '@/components/SubmissionStatus';
import { TAccount } from '@/types/account';
import { TAssignment } from '@/types/assignment';
import { ROLES } from '@/utils/constants';
import { TableProps, Tooltip } from 'antd';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { connect, FormattedHTMLMessage, useIntl, useParams } from 'umi';
import AssignmentChild from '../Assignments/AssignmentChild';

type TableColumnsProps = TableProps<any>['columns'] & {
  forAdminOnly?: boolean;
};

interface ISubmissionPage {
  currentAccount: TAccount;
  submissionDic: Record<string, any>;
  loadingSubmissions: boolean;
  assignment: TAssignment;
  dispatch: any;
}

const SubmissionPage: React.FC<ISubmissionPage> = ({
  dispatch,
  submissionDic,
  loadingSubmissions,
  assignment,
  currentAccount: account,
}) => {
  const [currentIds, setCurrentIds] = useState<string[]>([]);
  const { assignmentId }: any = useParams();
  const intl = useIntl();
  const columns: TableColumnsProps = [
    {
      title: intl.formatMessage({ id: 'submission.table.problem' }),
      key: 'submission-problem-resolved',
      width: 200,
      dataIndex: 'problem',
      ellipsis: true,
      fixed: 'left',
      render: (problem, data) => (
        <Tooltip title={intl.formatMessage({ id: 'submission.table.go-to-problem' })}>
          <a href={`/problems/${data.assignmentId}?problem=${problem.id}`} target="_blank">
            {problem.name}
          </a>
        </Tooltip>
      ),
    },
    {
      title: intl.formatMessage({ id: 'submission.table.submitter' }),
      key: 'submitter',
      width: 220,
      ellipsis: true,
      dataIndex: 'submitter',
      render: (submitter) => submitter.displayName,
    },
    {
      title: intl.formatMessage({ id: 'submission.table.lang' }),
      key: 'submission-language',
      width: 110,
      dataIndex: 'language',
      render: (language) => language.name,
    },
    {
      title: intl.formatMessage({ id: 'submission.table.submitted-at' }),
      key: 'submission-createdAt',
      width: 190,
      dataIndex: 'created_at',
      render: (time) => moment(time).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: intl.formatMessage({ id: 'submission.table.score' }),
      key: 'submission-score',
      width: 100,
      fixed: 'right',
      dataIndex: 'pre_score',
    },
    {
      title: intl.formatMessage({ id: 'submission.table.status' }),
      key: 'submission-status',
      width: 100,
      fixed: 'right',
      dataIndex: 'status',
      render: (status) => <SubmissionStatus status={status} />,
    },
  ];

  useEffect(() => {
    const payload = {
      callback: (data: any) => {
        if (!data) {
          return;
        }
        setCurrentIds(data.keys);
      },
      assignmentId,
    };
    dispatch({ type: 'submission/search', payload });
  }, []);

  const assignmentLink = account.role === ROLES.admin ? '/assignments-manage' : '/assignments';
  const cardDescription = assignmentId ? (
    <FormattedHTMLMessage
      id="assignment.change-selected"
      values={{ name: assignment?.name || `#${assignmentId}`, link: assignmentLink }}
    />
  ) : (
    <FormattedHTMLMessage id="assignment.select-selected" values={{ link: assignmentLink }} />
  );

  if (account.role === ROLES.user) {
    return (
      <ErrorBoundary>
        <AssignmentChild
          noSelectMessage={intl.formatMessage({ id: 'submission.my.no-assignment-selected' })}
          notFoundMessage={intl.formatMessage({ id: 'submission.my.assignment-not-found' })}
          childName="submissions"
        >
          <CardWrapTable
            cardTitle={intl.formatMessage({ id: 'site.submissions' })}
            cardDescription={cardDescription}
            columns={columns}
            dataSource={currentIds.map((id) => submissionDic?.[id])}
            loading={loadingSubmissions}
            tableLayout="fixed"
            scroll={{ x: '100%' }}
            pagination={false}
            rowKey="id"
          />
        </AssignmentChild>
      </ErrorBoundary>
    );
  }
  // Custom view for admin
  const adminCols: TableColumnsProps = [
    {
      title: intl.formatMessage({ id: 'component.table.action' }),
      key: 'actions',
      width: 100,
      fixed: 'right',
      dataIndex: 'id',
      render: (id) => (
        <ActionIcons
          actions={[
            {
              key: 'view-code',
              action: () => null,
              icon: 'code',
              title: intl.formatMessage({ id: 'submission.table.view-code' }),
            },
            {
              key: 'view-log',
              action: () => null,
              icon: 'view',
              title: intl.formatMessage({ id: 'submission.table.view-log' }),
            },
            {
              key: 're-judge',
              action: () => null,
              icon: 'reload',
              title: intl.formatMessage({ id: 'submission.table.rejudge' }),
            },
          ]}
        />
      ),
    },
  ];
  return (
    <CardWrapTable
      cardTitle={intl.formatMessage({ id: 'site.submissions' })}
      cardDescription={cardDescription}
      columns={[...columns, ...adminCols]}
      dataSource={currentIds.map((id) => submissionDic?.[id])}
      loading={loadingSubmissions}
      tableLayout="fixed"
      scroll={{ x: '100%' }}
      pagination={false}
      rowKey="id"
    />
  );
};

export default connect(({ account, assignments, submission, loading }: any) => ({
  assignment: assignments.selected ? assignments.dic[assignments.selected] : undefined,
  currentAccount: account.dic[account.current],
  loadingSubmissions: loading.effects['submission/search'],
  submissionDic: submission.dic,
}))(SubmissionPage);
