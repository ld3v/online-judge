import ActionIcons from '@/components/ActionIcons';
import CardWrapTable, { CardWrapTableAction } from '@/components/CardWrapTable';
import ModalViewProblems from '@/components/Modal/ModalViewProblems';
import { EMPTY_VALUE } from '@/utils/constants';
import { notification, TableProps } from 'antd';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { connect, useHistory, useIntl } from 'umi';

type TableColumnsProps = TableProps<any>['columns'];

interface IAssignmentMgntPage {
  assignmentStateDic: Record<string, any>;
  loadingAssignments: boolean;
  dispatch: any;
}

const AssignmentMgntPage: React.FC<IAssignmentMgntPage> = ({
  dispatch,
  assignmentStateDic,
  loadingAssignments,
}) => {
  const [currentAssignmentIds, setCurrentAssignmentIds] = useState<string[]>([]);
  const intl = useIntl();
  const history = useHistory();

  const handleDelete = (id: string) => {
    const callback = (res: any) => {
      if (res) {
        const newIds = currentAssignmentIds.filter((cId) => cId !== id);
        setCurrentAssignmentIds(newIds);
        notification.success({ message: intl.formatMessage({ id: 'assignment.delete.success' }) });
      }
    };
    dispatch({
      type: 'assignments/deleteById',
      payload: {
        id,
        callback,
      },
    });
  };
  const handleViewProblems = (id: string) => {
    // To show modal
    dispatch({
      type: 'assignments/setPreviewSelected',
      payload: { id },
    });
    // To load problems's data
    dispatch({
      type: 'assignments/getProblems',
      payload: { id },
    });
  };

  const actions: CardWrapTableAction[] = [
    {
      title: intl.formatMessage({ id: 'assignment.add' }),
      type: 'primary',
      onClick: () => history.push('/assignments-manage/create'),
      key: 'add-assignment-action',
    },
  ];
  const columns: TableColumnsProps = [
    {
      title: intl.formatMessage({ id: 'component.table.name' }),
      key: 'name',
      width: 200,
      fixed: 'left',
      dataIndex: 'name',
    },
    {
      title: intl.formatMessage({ id: 'assignment.table.coefficient' }),
      key: 'coefficient',
      width: 110,
      dataIndex: 'coefficient',
      render: (coefficient, data) => {
        if (data?.finished) return intl.formatMessage({ id: 'assignment.finished' });
        if (coefficient === 'error')
          return intl.formatMessage({ id: 'assignment.coefficient.error' });
        if (!Number.isNaN(coefficient)) return `${coefficient} %`;
        return coefficient || EMPTY_VALUE;
      },
    },
    {
      title: intl.formatMessage({ id: 'assignment.table.submissions' }),
      key: 'submissions',
      dataIndex: 'submissions',
      width: 110,
      render: (submissions) => (submissions ? submissions.length : EMPTY_VALUE),
    },
    {
      title: intl.formatMessage({ id: 'assignment.table.start-time' }),
      key: 'start-time',
      width: 150,
      dataIndex: 'startTime',
      render: (time) => moment(time).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: intl.formatMessage({ id: 'assignment.table.finish-time' }),
      key: 'finish-time',
      width: 150,
      dataIndex: 'finishTime',
      render: (time) => (time ? moment(time).format('DD/MM/YYYY HH:mm') : EMPTY_VALUE),
    },
    {
      title: intl.formatMessage({ id: 'component.table.action' }),
      key: 'action',
      width: 140,
      fixed: 'right',
      dataIndex: 'id',
      render: (id, data) => (
        <ActionIcons
          actions={[
            {
              key: 'edit',
              action: () => history.push(`/assignments-manage/${id}/update`),
              icon: 'edit',
            },
            {
              key: 'view-problems',
              title: intl.formatMessage({ id: 'assignment.actions.view-problems' }),
              action: () => handleViewProblems(id),
              icon: 'list',
            },
            {
              key: 'submission',
              action: () => history.push(`/submissions/${id}`),
              icon: 'submission',
            },
            {
              key: 'scoreboard',
              action: () => history.push(`/score-boards/${id}`),
              icon: data.open ? 'scoreboard' : '',
            },
            { key: 'delete', action: () => handleDelete(id), icon: 'del' },
          ]}
        />
      ),
    },
  ];

  const handleSearch = (keyword?: string) => {
    const callback = (data: any) => {
      if (!data) {
        return;
      }
      setCurrentAssignmentIds(data.keys);
    };
    dispatch({
      type: 'assignments/search',
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
    <>
      <CardWrapTable
        cardTitle={intl.formatMessage({ id: 'site.assignments-manage' })}
        actions={actions}
        columns={columns}
        loading={loadingAssignments}
        dataSource={currentAssignmentIds.map((id) => assignmentStateDic?.[id])}
        search={{
          placeholder: intl.formatMessage({ id: 'assignment.search' }),
          onSearch: (k) => handleSearch(k),
        }}
        tableLayout="fixed"
        pagination={false}
        scroll={{ x: '100%' }}
        rowKey="id"
      />

      {/* ---------------------- MODAL ---------------------- */}
      <ModalViewProblems />
    </>
  );
};

export default connect(({ assignments, loading }: any) => ({
  loadingAssignments: loading.effects['assignments/search'],
  assignmentStateDic: assignments.dic,
}))(AssignmentMgntPage);
