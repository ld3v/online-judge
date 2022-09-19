import { ErrorBoundary } from '@/components/Boundary';
import CardWrapTable, { CardWrapTableAction } from '@/components/CardWrapTable';
import { TAccount } from '@/types/account';
import { TAssignment } from '@/types/assignment';
import { EMPTY_VALUE, ROLES } from '@/utils/constants';
import { TableProps } from 'antd';
import { useEffect } from 'react';
import { connect, FormattedHTMLMessage, useIntl, useParams } from 'umi';
import AssignmentChild from '../Assignments/AssignmentChild';

type TableColumnsProps = TableProps<any>['columns'] & {
  forAdminOnly?: boolean;
};

interface IScoreboardPage {
  currentAccount: TAccount;
  scoreboardList: any[];
  assignment: TAssignment;
  loadingScoreboard: boolean;
  submissionColumns: any[];
  dispatch: any;
}

const ScoreboardPage: React.FC<IScoreboardPage> = ({
  dispatch,
  scoreboardList,
  assignment,
  submissionColumns,
  loadingScoreboard,
  currentAccount,
}) => {
  const { assignmentId: id }: any = useParams();
  const intl = useIntl();
  const actions: CardWrapTableAction[] = [];
  const accountColumns: TableColumnsProps = [
    {
      title: intl.formatMessage({ id: 'scoreboard.table.order-num' }),
      key: 'scoreboard-orderNum',
      fixed: 'left',
      width: 50,
      dataIndex: 'id',
      render: (id, data, index) => index + 1,
    },
    {
      title: intl.formatMessage({ id: 'scoreboard.table.account' }),
      key: 'scoreboard-account',
      fixed: 'left',
      width: 220,
      dataIndex: 'account',
      render: (account) => account.display_name || EMPTY_VALUE,
    },
  ];
  const totalColumns: TableColumnsProps = [
    {
      title: intl.formatMessage({ id: 'scoreboard.table.total' }),
      key: 'scoreboard-total',
      width: 200,
      dataIndex: 'total',
      render: (total) => total.score,
    },
    {
      title: intl.formatMessage({ id: 'scoreboard.table.total-accepted' }),
      key: 'scoreboard-totalAccepted',
      width: 190,
      fixed: 'right',
      dataIndex: 'totalAccepted',
      render: (totalAccepted) => totalAccepted.score,
    },
  ];

  // const isAdmin = account.role === ROLES.admin;

  useEffect(() => {
    if (id) {
      dispatch({ type: 'scoreboard/get', payload: { id } });
    }
  }, []);

  const assignmentPath =
    currentAccount.role === ROLES.admin ? '/assignments-manage' : '/assignments';

  return (
    <ErrorBoundary>
      <AssignmentChild
        noSelectMessage={intl.formatMessage({ id: 'scoreboard.my.no-assignment-selected' })}
        notFoundMessage={intl.formatMessage({ id: 'scoreboard.my.assignment-not-found' })}
        childName="score-boards"
      >
        <CardWrapTable
          cardTitle={intl.formatMessage({ id: 'site.scoreboard' })}
          cardDescription={
            <FormattedHTMLMessage
              id="assignment.change-selected"
              values={{ name: assignment?.name || `#${id}`, link: assignmentPath }}
            />
          }
          actions={actions}
          columns={[...accountColumns, ...submissionColumns, ...totalColumns]}
          dataSource={scoreboardList}
          loading={loadingScoreboard}
          tableLayout="fixed"
          scroll={{ x: '100%' }}
          pagination={false}
          rowKey="id"
        />
      </AssignmentChild>
    </ErrorBoundary>
  );
};

export default connect(({ assignments, account, scoreboard, loading }: any) => ({
  assignment: assignments.selected ? assignments.dic[assignments.selected] : undefined,
  currentAccount: account.dic[account.current],
  loadingScoreboard: loading.effects['scoreboard/get'],
  submissionColumns: scoreboard.list.map((id: string) => scoreboard.subColsDic[id]),
  scoreboardList: scoreboard.list.map((id: string) => scoreboard.dic[id]),
}))(ScoreboardPage);
