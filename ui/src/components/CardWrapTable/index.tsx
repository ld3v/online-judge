import { ButtonProps, Skeleton, Table, TableProps } from 'antd';
import { FC } from 'react';
import { useIntl } from 'umi';
import { ErrorBoundary } from '../Boundary';
import Card, { CardSearch } from '../Card';

export interface CardWrapTableAction extends ButtonProps {
  title: string;
  key: string;
}

interface ICardWrapTable extends TableProps<any> {
  cardTitle?: React.ReactNode | string;
  cardDescription?: React.ReactNode | string;
  loadingPreRenderTable?: boolean;
  actions?: CardWrapTableAction[];
  search?: CardSearch;
}

const CardWrapTable: FC<ICardWrapTable> = ({
  cardTitle,
  cardDescription,
  loadingPreRenderTable,
  actions,
  search,
  ...tableProps
}) => {
  const intl = useIntl();
  const renderTable = loadingPreRenderTable ? (
    <Skeleton />
  ) : (
    <Table
      pagination={false}
      bordered={false}
      locale={{
        filterTitle: 'Filter menu',
        filterConfirm: 'OK',
        filterReset: 'Reset',
        filterEmptyText: 'No filters',
        filterCheckall: 'Select all items',
        filterSearchPlaceholder: 'Search in filters',
        selectAll: 'Select current page',
        selectInvert: 'Invert current page',
        selectNone: 'Clear all data',
        selectionAll: 'Select all data',
        sortTitle: 'Sort',
        expand: 'Expand row',
        collapse: 'Collapse row',
        triggerDesc: 'Click to sort descending',
        triggerAsc: 'Click to sort ascending',
        cancelSort: 'Click to cancel sorting',
        // Overwrite locale
        emptyText: intl.formatMessage({ id: 'component.table.empty' }),
      }}
      {...tableProps}
    />
  );
  return (
    <Card
      cardTitle={cardTitle}
      cardDescription={cardDescription}
      actions={actions}
      className="wrapTable"
      search={search}
    >
      <ErrorBoundary>{renderTable}</ErrorBoundary>
    </Card>
  );
};

export default CardWrapTable;
