import ActionIcons from '@/components/ActionIcons';
import CardWrapTable from '@/components/CardWrapTable';
import { EMPTY_VALUE } from '@/utils/constants';
import { TableProps } from 'antd';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { connect, useHistory, useIntl } from 'umi';

type TableColumnsProps = TableProps<any>['columns'];

interface IAccountMgntPage {
  current: any;
  accountDic: Record<string, any>;
  loadingAccounts: boolean;
  dispatch: any;
}

const AccountMgntPage: React.FC<IAccountMgntPage> = ({
  dispatch,
  current,
  accountDic,
  loadingAccounts,
}) => {
  const [currentIds, setCurrentIds] = useState<string[]>([]);
  const intl = useIntl();
  const history = useHistory();

  // const handleUpdateState = (id: string, state: 'lock' | 'unlock') => {
  //   const callback = (res: any) => {
  //     if (res) {
  //       notification.success({
  //         message: intl.formatMessage(
  //           { id: 'account.state.success' },
  //           { isLock: state === 'lock' },
  //         ),
  //       });
  //     }
  //   };
  //   dispatch({
  //     type: 'account/updateState',
  //     payload: {
  //       id,
  //       state,
  //       callback,
  //     },
  //   });
  // };

  const columns: TableColumnsProps = [
    {
      title: intl.formatMessage({ id: 'account.table.display-name' }),
      key: 'display-name',
      fixed: 'left',
      width: 250,
      dataIndex: 'displayName',
    },
    {
      title: intl.formatMessage({ id: 'account.table.username' }),
      key: 'username',
      width: 200,
      dataIndex: 'username',
    },
    {
      title: intl.formatMessage({ id: 'account.table.role' }),
      key: 'role',
      width: 120,
      dataIndex: 'role',
      render: (role) => intl.formatMessage({ id: `account.roles.${role || 'unknown'}` }),
    },
    {
      title: intl.formatMessage({ id: 'account.table.created-at' }),
      key: 'role',
      width: 150,
      dataIndex: 'createdAt',
      render: (createdAt) =>
        createdAt ? moment(createdAt).format('DD/MM/YYYY HH:mm') : EMPTY_VALUE,
    },
    {
      title: intl.formatMessage({ id: 'component.table.action' }),
      key: 'actions',
      width: 100,
      fixed: 'right',
      dataIndex: 'id',
      render: (id, data) =>
        data ? (
          <ActionIcons
            actions={[
              {
                key: 'edit',
                action: () => history.push(`/accounts/${id}/update`),
                icon: data.editable ? 'edit' : '',
              },
              // {
              //   key: 'state',
              //   action: () => handleUpdateState(id, data.isLocked ? 'unlock' : 'lock'),
              //   icon:
              //     data.id !== current.id && data.lockable
              //       ? `${data.isLocked ? 'unlock' : 'lock'}`
              //       : '',
              // },
              // {
              //   key: 'state-me',
              //   action: () => handleUpdateState(id, 'lock'),
              //   icon: data.id === current.id && data.lockable ? 'lock-me' : '',
              // },
              {
                key: 'mail',
                action: () => window.open(`mailto:${data.email}`),
                icon: data.email ? 'mail' : '',
              },
            ]}
          />
        ) : (
          EMPTY_VALUE
        ),
    },
  ];

  const handleSearch = (keyword?: string) => {
    const callback = (data: any) => {
      if (!data) {
        return;
      }
      setCurrentIds(data.keys);
    };
    dispatch({
      type: 'account/search',
      payload: {
        callback,
        keyword,
      },
    });
  };

  useEffect(() => {
    handleSearch();
  }, []);

  return (
    <CardWrapTable
      cardTitle={intl.formatMessage({ id: 'site.accounts-manage' })}
      columns={columns}
      dataSource={currentIds.map((id) => accountDic?.[id])}
      loading={loadingAccounts}
      search={{
        placeholder: intl.formatMessage({ id: 'account.search' }),
        onSearch: (k) => handleSearch(k),
      }}
      tableLayout="fixed"
      scroll={{ x: '100%' }}
      pagination={false}
      rowKey="id"
    />
  );
};

export default connect(({ account, loading }: any) => ({
  loadingAccounts: loading.effects['account/search'],
  current: account.dic[account.current],
  accountDic: account.dic,
}))(AccountMgntPage);
