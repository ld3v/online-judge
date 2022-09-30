import ActionIcons from '@/components/ActionIcons';
import CardWrapTable, { CardWrapTableAction } from '@/components/CardWrapTable';
import MultiTags from '@/components/MultiTags';
import { EMPTY_VALUE } from '@/utils/constants';
import { notification, TablePaginationConfig, TableProps } from 'antd';
import { useEffect, useState } from 'react';
import { connect, useHistory, useIntl } from 'umi';

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
  const [total, setTotal] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
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
      render: (note) => note || EMPTY_VALUE,
    },
    {
      title: intl.formatMessage({ id: 'assignment.table.language' }),
      key: 'usedLanguages',
      width: 120,
      dataIndex: 'languages',
      filters: filterLangs,
      render: (languages) => (
        <MultiTags
          items={languages}
          itemKey="id"
          displayKey="name"
          extraItemsMsgId="problem.lang-using.extra"
          emptyMsgId="problem.no-langs"
          numItemsDisplay={2}
        />
      ),
    },
    {
      title: intl.formatMessage({ id: 'assignment.table.problem-used-in-which-assignment' }),
      key: 'usedAssignments',
      width: 190,
      dataIndex: 'assignments',
      render: (assignments) => (
        <MultiTags
          items={assignments}
          itemKey="id"
          displayKey="name"
          extraItemsMsgId="problem.assignment-using.extra"
          emptyMsgId="problem.no-assignments"
          numItemsDisplay={1}
          isOverflowText={true}
        />
      ),
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
    page: number = 1,
    keyword?: string,
    filter?: { assignmentIds?: string[]; langIds?: string[] },
  ) => {
    const callback = (res: any) => {
      if (!res) {
        return;
      }
      setCurrentIds(res.keys);
      setTotal(res.total);
      setCurrentPage(page);
    };
    dispatch({
      type: 'problem/search',
      payload: {
        callback,
        keyword,
        assignmentIds: filter?.assignmentIds?.join(','),
        langIds: filter?.langIds?.join(','),
        page,
        limit: 10,
      },
    });
  };

  const handleTableChange = ({ current }: TablePaginationConfig, filters: any) => {
    const { usedLanguages } = filters;
    const filtersParams = {
      langIds: usedLanguages || [],
    };
    handleSearch(current, currentKeyword, filtersParams);
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
          handleSearch(1, k);
        },
      }}
      loading={loadingProblems}
      onChange={handleTableChange}
      tableLayout="fixed"
      scroll={{ x: '100%' }}
      pagination={{
        current: currentPage,
        total,
        pageSize: 10,
        showSizeChanger: false,
      }}
      rowKey="id"
    />
  );
};

export default connect(({ language, problem, loading }: any) => ({
  loadingProblems: loading.effects['problem/search'],
  problemDic: problem.dic,
  langs: Object.values(language.dic),
}))(ProblemMgntPage);
