import ActionIcons from '@/components/ActionIcons';
import { ErrorBoundary } from '@/components/Boundary';
import CardWrapTable from '@/components/CardWrapTable';
import SubmissionStatus from '@/components/SubmissionStatus';
import { TAccount } from '@/types/account';
import { TAssignment } from '@/types/assignment';
import { ROLES } from '@/utils/constants';
import { notification, TableProps, Tooltip } from 'antd';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { connect, FormattedHTMLMessage, useIntl, useParams } from 'umi';
import AssignmentChild from '../Assignments/AssignmentChild';
import ModalViewCode from './ModalViewCode';

type TableColumnsProps = TableProps<any>['columns'] & {
  forAdminOnly?: boolean;
};

interface ISubmissionPage {
  currentAccount: TAccount;
  submissionDic: Record<string, any>;
  loadingSubmissions: boolean;
  loadingSubmissionCode: boolean;
  assignment: TAssignment;
  dispatch: any;
}

const SubmissionPage: React.FC<ISubmissionPage> = ({
  dispatch,
  submissionDic,
  loadingSubmissions,
  loadingSubmissionCode,
  assignment,
  currentAccount: account,
}) => {
  const [currentIds, setCurrentIds] = useState<string[]>([]);
  const [submissionIdViewingCode, setSubmissionViewingCode] = useState<string | undefined>(
    undefined,
  );
  const [submissionIdViewingLog, setSubmissionViewingLog] = useState<string | undefined>(undefined);
  const { assignmentId }: any = useParams();
  const intl = useIntl();

  const handleViewCode = (id: string) => {
    if (!id) {
      notification.error({ message: intl.formatMessage({ id: 'exception.submission.empty-id' }) });
    }
    dispatch({
      type: 'submission/getCodeById',
      payload: { id },
    });
    setSubmissionViewingCode(id);
  };
  const handleViewLog = (id: string) => {
    if (!id) {
      notification.error({ message: intl.formatMessage({ id: 'exception.submission.empty-id' }) });
    }
    dispatch({
      type: 'submission/getLogById',
      payload: { id },
    });
    setSubmissionViewingLog(id);
  };

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
              action: () => handleViewCode(id),
              icon: 'code',
              title: intl.formatMessage({ id: 'submission.table.view-code' }),
            },
            {
              key: 'view-log',
              action: () => handleViewLog(id),
              icon: 'view',
              title: intl.formatMessage({ id: 'submission.table.view-log' }),
            },
            // {
            //   key: 're-judge',
            //   action: () => null,
            //   icon: 'reload',
            //   title: intl.formatMessage({ id: 'submission.table.rejudge' }),
            // },
          ]}
        />
      ),
    },
  ];
  return (
    <>
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

      {/* Code Viewing Modal */}
      {!!submissionIdViewingCode ? (
        <ModalViewCode
          code={submissionDic[submissionIdViewingCode]?.code}
          codeExt={submissionDic[submissionIdViewingCode]?.extension}
          loading={loadingSubmissionCode}
          title={`Code (#${submissionIdViewingCode})`}
          onCancel={() => setSubmissionViewingCode(undefined)}
        />
      ) : null}

      {/* Code Viewing Modal */}
      {!!submissionIdViewingLog ? (
        <ModalViewCode
          code={submissionDic[submissionIdViewingLog]?.log}
          codeExt="log"
          loading={loadingSubmissionCode}
          title={`Log (#${submissionIdViewingLog})`}
          onCancel={() => setSubmissionViewingLog(undefined)}
          width="calc(100% - 40px)"
        />
      ) : null}
    </>
  );
};

export default connect(({ account, assignments, submission, loading }: any) => ({
  assignment: assignments.selected ? assignments.dic[assignments.selected] : undefined,
  currentAccount: account.dic[account.current],
  loadingSubmissions: loading.effects['submission/search'],
  loadingSubmissionCode: loading.effects['submission/getCodeById'],
  loadingSubmissionLog: loading.effects['submission/getLogById'],
  submissionDic: submission.dic,
}))(SubmissionPage);
