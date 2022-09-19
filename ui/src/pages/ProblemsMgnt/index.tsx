import ActionIcons from '@/components/ActionIcons';
import CardWrapTable, { CardWrapTableAction } from '@/components/CardWrapTable';
import { MAX_ASSIGNMENTS_USING_PROBLEM } from '@/utils/constants';
import { notification, TableProps, Tag, Tooltip } from 'antd';
import { useEffect, useState } from 'react';
import { connect, FormattedMessage, useHistory, useIntl } from 'umi';

type TableColumnsProps = TableProps<any>['columns'];

interface IProblemMgntPage {
  problemDic: Record<string, any>;
  langs: any[];
  loadingProblems: boolean;
  dispatch: any;
}

const ProblemMgntPage: React.FC<IProblemMgntPage> = ({
  dispatch,
  problemDic,
  loadingProblems,
  langs,
}) => {
  const [currentKeyword, setCurrentKeyword] = useState<string>('');
  const [currentIds, setCurrentIds] = useState<string[]>([]);
  const intl = useIntl();
  const history = useHistory();

  const handleDelete = (id: string) => {
    const callback = (res: any) => {
      if (res) {
        const newIds = currentIds.filter((cId) => cId !== id);
        setCurrentIds(newIds);
        notification.success({ message: intl.formatMessage({ id: 'problem.delete.success' }) });
      }
    };
    dispatch({
      type: 'problem/deleteById',
      payload: {
        id,
        callback,
      },
    });
  };

  const actions: CardWrapTableAction[] = [
    {
      title: intl.formatMessage({ id: 'problem.add' }),
      type: 'primary',
      onClick: () => history.push('/problems-manage/create'),
      key: 'add-problem-action',
    },
  ];
  const filterLangs = langs.map((lang) => ({ text: lang.name, value: lang.id }));
  const columns: TableColumnsProps = [
    {
      title: intl.formatMessage({ id: 'component.table.name' }),
      key: 'name',
      fixed: 'left',
      width: 220,
      dataIndex: 'name',
    },
    {
      title: intl.formatMessage({ id: 'component.table.note' }),
      key: 'adminNote',
      width: 200,
      dataIndex: 'note',
    },
    {
      title: intl.formatMessage({ id: 'assignment.table.language' }),
      key: 'usedLanguages',
      width: 120,
      dataIndex: 'languages',
      filters: filterLangs,
      render: (langs) =>
        Array.isArray(langs) && langs.length > 0
          ? langs.map((lang) => <Tag key={lang.id}>{lang.name}</Tag>)
          : intl.formatMessage({ id: 'problem.no-langs' }),
    },
    {
      title: intl.formatMessage({ id: 'assignment.table.problem-used-in-which-assignment' }),
      key: 'usedAssignments',
      width: 190,
      dataIndex: 'assignments',
      render: (assignments) => {
        const assLength = assignments.length;
        if (!assLength) return intl.formatMessage({ id: 'problem.no-assignments' });
        const extraItems = assignments
          .slice(MAX_ASSIGNMENTS_USING_PROBLEM)
          .map((assignment: any) => assignment.name)
          .join(', ');
        const extraItemsRender =
          assLength - MAX_ASSIGNMENTS_USING_PROBLEM > 0 ? (
            <Tooltip title={extraItems}>
              <Tag>
                <FormattedMessage
                  id="problem.assignment-using.extra"
                  values={{ count: assLength - MAX_ASSIGNMENTS_USING_PROBLEM }}
                />
              </Tag>
            </Tooltip>
          ) : null;
        const renderItems = assignments
          .slice(0, MAX_ASSIGNMENTS_USING_PROBLEM)
          .map((assignment: any) => <Tag key={assignment.id}>{assignment.name}</Tag>);
        return (
          <>
            {renderItems}
            {extraItemsRender}
          </>
        );
      },
    },
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
              key: 'edit',
              action: () => history.push(`/problems-manage/${id}/update`),
              icon: 'edit',
            },
            { key: 'delete', action: () => handleDelete(id), icon: 'del' },
          ]}
        />
      ),
    },
  ];

  const handleSearch = (
    keyword?: string,
    filter?: { assignmentIds?: string[]; langIds?: string[] },
  ) => {
    const callback = (res: any) => {
      if (!res) {
        return;
      }
      setCurrentIds(res.keys);
    };
    dispatch({
      type: 'problem/search',
      payload: {
        callback,
        keyword,
        assignmentIds: filter?.assignmentIds?.join(','),
        langIds: filter?.langIds?.join(','),
      },
    });
  };

  const handleTableChange = (_: any, filters: any) => {
    const { usedLanguages } = filters;
    const filtersParams = {
      langIds: usedLanguages || [],
    };
    handleSearch(currentKeyword, filtersParams);
  };

  useEffect(() => {
    handleSearch();
    dispatch({ type: 'language/get' });
  }, []);

  return (
    <CardWrapTable
      cardTitle={intl.formatMessage({ id: 'site.problems-manage' })}
      actions={actions}
      columns={columns}
      dataSource={currentIds.map((id) => problemDic?.[id])}
      search={{
        placeholder: intl.formatMessage({ id: 'problem.search' }),
        onSearch: (k) => {
          setCurrentKeyword(k);
          handleSearch(k);
        },
      }}
      loading={loadingProblems}
      onChange={handleTableChange}
      tableLayout="fixed"
      scroll={{ x: '100%' }}
      pagination={false}
      rowKey="id"
    />
  );
};

export default connect(({ language, problem, loading }: any) => ({
  loadingProblems: loading.effects['problem/search'],
  problemDic: problem.dic,
  langs: Object.values(language.dic),
}))(ProblemMgntPage);
