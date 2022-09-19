import {
  EditFilled,
  EyeFilled,
  InboxOutlined,
  MenuOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { EditableProTable, ProColumns } from '@ant-design/pro-components';
import { DragSortTable } from '@ant-design/pro-components';
import {
  DatePicker,
  Empty,
  EmptyProps,
  Input,
  InputProps,
  Select,
  SelectProps,
  Tag,
  Upload,
} from 'antd';
import { FINISH_TIME_LOCALE, START_TIME_LOCALE } from '@/locales/en-US';
import { FORMAT_DATETIME } from '@/utils/constants';
import moment from 'moment';
import { FC, useCallback, useState } from 'react';
import styles from './styles.less';
import ActionIcons from '../ActionIcons';
import { debounce } from 'lodash';
import { useIntl } from 'umi';
import { UploadChangeParam, UploadFile } from 'antd/lib/upload';
import ReactMarkdown from 'react-markdown';
import { TextAreaProps } from 'antd/lib/input';
import remarkGfm from 'remark-gfm';
// import remarkHTML from 'remark-html';

interface ILabelWithDesc {
  label: React.ReactNode | string;
  description?: React.ReactNode | string;
  extraDescription?: React.ReactNode | string;
}
interface ITimeRangeInput {
  value?: any;
  onChange?: (value: any) => void;
  withFinish: boolean;
}
interface ITableSearchSelect {
  // Select - Search
  searchPlaceholder?: SelectProps['placeholder'];
  searchClassName?: string;
  searchOptions: {
    optionsData: any[];
    labelKey?: string;
    valueKey?: string;
  };
  searching?: boolean;
  onSearch: SelectProps['onSearch'];
  searchEmptyContent?: SelectProps['notFoundContent'];
  onAdd?: (recordId: string) => void;
  // Table
  columns?: ProColumns[];
  tableClassName?: string;
  emptyText?: EmptyProps['description'];
  onSourceChange?: (data: any, options?: any) => void;
  // Default for form item content
  value?: any[];
  onChange?: (data: any) => void;
}

const LabelWithDesc: FC<ILabelWithDesc> = ({ label, description, extraDescription }) => {
  return (
    <div className={styles.labelWithDesc}>
      {extraDescription ? (
        <div className={styles.withExtra}>
          <div className={styles.label}>{label}</div>
          <div className={styles.extraDesc}>{extraDescription}</div>
        </div>
      ) : (
        <div className={styles.label}>{label}</div>
      )}
      {description && <div className={styles.desc}>{description}</div>}
    </div>
  );
};

const TimeRangeInput: React.FC<ITimeRangeInput> = ({ value, onChange, withFinish, ...props }) => (
  <>
    <DatePicker
      showTime={{
        minuteStep: 15,
      }}
      format={FORMAT_DATETIME}
      locale={START_TIME_LOCALE}
      disabledDate={(date) => date.isBefore(moment().startOf('day'))}
      onChange={(date) => onChange?.({ ...(value || {}), startTime: date })}
      value={value?.startTime || null}
    />
    {withFinish && (
      <DatePicker
        showTime={{
          minuteStep: 15,
        }}
        format={FORMAT_DATETIME}
        locale={FINISH_TIME_LOCALE}
        disabledDate={(date) => date.isBefore(moment().startOf('day'))}
        onChange={(date) => onChange?.({ ...(value || {}), finishTime: date })}
        value={value?.finishTime || null}
      />
    )}
  </>
);

const TableSearchSelect: React.FC<ITableSearchSelect> = ({
  searchPlaceholder,
  searchOptions: { labelKey, valueKey, optionsData },
  searching,
  searchEmptyContent,
  searchClassName,
  onAdd,
  onSearch,
  tableClassName,
  columns,
  emptyText,
  onSourceChange,
  value,
  onChange,
}) => {
  // For Editable table
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>(() =>
    (value || []).map((item) => item.id),
  );

  const intl = useIntl();

  const debounceChangeDataSource = useCallback(
    debounce((dataSource: any[]) => {
      // Update form.item value
      onChange?.(dataSource);
      // Trigger parent if available
      onSourceChange?.(dataSource);
    }, 800),
    [],
  );
  const debounceSearchProblem = useCallback(
    debounce((keyword: string) => {
      onSearch?.(keyword);
    }, 800),
    [],
  );

  const handleAddRecord = (recordId: string) => {
    setEditableRowKeys([...editableKeys, recordId]);
    const record = optionsData.find((rc) => rc[valueKey || 'id'] === recordId);
    onChange?.([...(value || []), record]);
    // Trigger parent if available
    onAdd?.(recordId);
  };
  const handleDragSortEnd = (newData: any[]) => {
    // Update form.item value
    onChange?.(newData);
    // Trigger parent if available
    onSourceChange?.(newData, { isDrag: true });
  };
  const handleDelete = (idDelete: string) => {
    const newData = value?.filter(({ id }) => id !== idDelete) || [];
    // Update form.item value
    onChange?.(newData);
    // Trigger parent if available
    onSourceChange?.(newData, { isDelete: true });
  };

  const columnsRendered: ProColumns[] = [
    {
      align: 'center',
      dataIndex: 'sort',
      editable: false,
      fixed: 'left',
      width: 40,
    },
    ...(columns || []),
    {
      align: 'center',
      fixed: 'right',
      width: 40,
      valueType: 'option',
      className: 'dragTableActions',
      render: () => null,
      // title: intl.formatMessage({ id: 'component.table.action' }),
    },
  ];
  const dragHandleRender = () => <MenuOutlined style={{ cursor: 'grab' }} />;
  return (
    <>
      <Select
        className={`${styles.TableSearchSelect_Search} ${searchClassName || ''}`}
        placeholder={searchPlaceholder}
        loading={searching}
        options={optionsData.map((opt) => ({
          label: opt[labelKey || 'name'],
          value: opt[valueKey || 'id'],
        }))}
        onSearch={(keyword) => debounceSearchProblem(keyword)}
        onSelect={handleAddRecord}
        notFoundContent={searchEmptyContent}
        suffixIcon={<SearchOutlined />}
        showSearch
        value={''} // Force select can not have value.
      />
      <DragSortTable
        columns={columnsRendered}
        rowKey="id"
        search={false}
        pagination={false}
        dataSource={value || []}
        tableLayout="fixed"
        dragSortKey="sort"
        dragSortHandlerRender={dragHandleRender}
        onDragSortEnd={handleDragSortEnd}
        toolBarRender={false}
        className={`${styles.TableSearchSelect_Table} ${tableClassName || ''}`}
        editable={{
          type: 'multiple',
          editableKeys,
          actionRender: ({ id }) => {
            return [
              <ActionIcons
                key="drag_actions"
                className="dragTableActions"
                actions={[{ key: 'delete', action: () => handleDelete(id), icon: 'del' }]}
              />,
            ];
          },
          onValuesChange: (_, newDataSource) => {
            debounceChangeDataSource(newDataSource);
          },
          onChange: setEditableRowKeys,
        }}
        scroll={{ x: '100%', y: 282 }}
        locale={{
          emptyText: (
            <Empty description={emptyText || intl.formatMessage({ id: 'component.table.empty' })} />
          ),
        }}
      />
    </>
  );
};

interface IInputSearchSelect {
  // Select - Search
  searchPlaceholder?: SelectProps['placeholder'];
  searchClassName?: string;
  searchOptions: {
    optionsData: any[];
    labelKey?: string;
    valueKey?: string;
  };
  searchEmptyContent?: SelectProps['notFoundContent'];
  searching?: boolean;
  searchDisabled?: SelectProps['disabled'];
  onAdd?: (recordId: string) => void;
  onSearch: SelectProps['onSearch'];
  // Tags
  listClassName?: string;
  onDelete?: (recordId: string) => void;
  // Default for form item content
  value?: any[];
  onChange?: (data: any) => void;
}

const InputSearchSelect: React.FC<IInputSearchSelect> = ({
  searchClassName,
  searchPlaceholder,
  searchOptions: { optionsData, labelKey, valueKey },
  searchEmptyContent,
  searching,
  searchDisabled,
  onAdd,
  onSearch,
  listClassName,
  value,
  onChange,
  onDelete,
}) => {
  const debounceSearchProblem = useCallback(
    debounce((keyword: string) => {
      onSearch?.(keyword);
    }, 800),
    [],
  );

  const handleAddRecord = (recordId: string) => {
    const record = optionsData.find((item) => item[valueKey || 'id'] === recordId);
    onChange?.([...(value || []), record]);
    // Trigger parent if available
    onAdd?.(recordId);
  };

  const handleDelete = (recordId: string) => {
    const newValue = [...(value || [])].filter((rc) => rc[valueKey || 'id'] !== recordId);
    onChange?.(newValue);
    // Trigger parent if available
    onDelete?.(recordId);
  };

  return (
    <>
      <Select
        className={`${styles.InputSearchSelect_Search} ${searchClassName || ''}`}
        placeholder={searchPlaceholder}
        loading={searching}
        options={optionsData.map((opt) => ({
          label: opt[labelKey || 'name'],
          value: opt[valueKey || 'id'],
        }))}
        onSearch={(keyword) => debounceSearchProblem(keyword)}
        onSelect={handleAddRecord}
        notFoundContent={searchEmptyContent}
        suffixIcon={<SearchOutlined />}
        showSearch
        value={''} // Force select can not have value.
        disabled={searchDisabled}
      />
      <div className={`${styles.InputSearchSelect_Search} ${listClassName || ''}`}>
        {(value || []).map((item) => (
          <Tag key={item.id} closable={!searchDisabled} onClose={() => handleDelete(item.id)}>
            {item[labelKey || 'name']}
          </Tag>
        ))}
      </div>
    </>
  );
};

interface IInputsNested {
  items: {
    name: string;
    placeholder?: InputProps['placeholder'];
    disabled?: boolean;
    key: string;
  }[];
  className?: string;
  // Default value for form input content
  onChange?: (data: any) => void;
  value?: any;
}

const InputsNested: React.FC<IInputsNested> = ({ items, className, onChange, value }) => {
  const handleInputChange = (name: string) => (valueItem: any) => {
    onChange?.({ ...(value || {}), [name]: valueItem });
  };
  return (
    <div className={`${styles.InputsNested} ${className || ''}`}>
      {items.map((item) => (
        <Input
          placeholder={item.placeholder}
          disabled={!!item.disabled}
          onChange={(e) => handleInputChange(item.name)(e.target.value)}
          value={value?.[item.name]}
          className={`InputsNested__${item.name}`}
          key={item.key}
        />
      ))}
    </div>
  );
};

interface ITagsSelection {
  options: any[];
  labelKey?: string;
  valueKey?: string;
  columns?: ProColumns[];
  emptyText?: string;
  // Default
  onChange?: (data: any) => void;
  value?: any;
}

const TagSelection: React.FC<ITagsSelection> = ({
  options,
  labelKey,
  valueKey,
  columns,
  emptyText,
  value,
  onChange,
}) => {
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>(() =>
    (value || []).map((item: any) => item.id),
  );

  const intl = useIntl();

  const handleAdd = ({ defaultValues, ...record }: any) => {
    const newValue = [
      ...(value || []),
      {
        ...record,
        ...(defaultValues || {}),
      },
    ];
    setEditableRowKeys([...editableKeys, record[valueKey || 'id']]);
    // Update form-item by default
    onChange?.(newValue);
  };
  const handleRemove = (record: any) => {
    const newValue =
      value?.filter((valueItem: any) => valueItem[valueKey || 'id'] !== record[valueKey || 'id']) ||
      [];
    const newEditableKeys = newValue.map((valueItem: any) => valueItem[valueKey || 'id']);
    setEditableRowKeys(newEditableKeys);
    // Update form-item by default
    onChange?.(newValue);
  };
  const handleRemoveById = (recordId: string) => {
    const newValue =
      value?.filter((valueItem: any) => valueItem[valueKey || 'id'] !== recordId) || [];
    const newEditableKeys = newValue.map((valueItem: any) => valueItem[valueKey || 'id']);
    setEditableRowKeys(newEditableKeys);
    // Update form-item by default
    onChange?.(newValue);
  };

  const columnsRendered: ProColumns[] = [
    ...(columns || []),
    {
      align: 'center',
      fixed: 'right',
      width: 40,
      valueType: 'option',
      render: () => null,
    },
  ];
  return (
    <div className={`${styles.TagSelection}`}>
      <div className="tagSelection-options">
        {options.map((option) => (
          <Tag.CheckableTag
            key={option[valueKey || 'id']}
            checked={
              !!value?.find(
                (valueItem: any) => valueItem[valueKey || 'id'] === option[valueKey || 'id'],
              )
            }
            onChange={(checked) => {
              if (checked) {
                handleAdd(option);
              } else {
                handleRemove(option);
              }
            }}
          >
            {option[labelKey || 'name']}
          </Tag.CheckableTag>
        ))}
      </div>
      <div className="tagSelection-table">
        <EditableProTable
          columns={columnsRendered}
          value={value}
          editable={{
            type: 'multiple',
            editableKeys,
            actionRender: ({ id }) => {
              return [
                <ActionIcons
                  key="edit_actions"
                  actions={[
                    { key: 'edit_actions-delete', action: () => handleRemoveById(id), icon: 'del' },
                  ]}
                />,
              ];
            },
            onValuesChange: (_, newDataSource) => {
              onChange?.(newDataSource);
            },
            onChange: setEditableRowKeys,
          }}
          recordCreatorProps={false}
          scroll={{ x: '100%', y: 282 }}
          locale={{
            emptyText: (
              <Empty
                description={emptyText || intl.formatMessage({ id: 'component.table.empty' })}
              />
            ),
          }}
          rowKey="id"
        />
      </div>
    </div>
  );
};

interface IInputUpload {
  directory?: boolean;
  className?: string;
  emptyText?: string | React.ReactNode;
  disabled?: boolean;
  // Default
  onChange?: (data: any) => void;
  value?: any;
}

const InputUpload: React.FC<IInputUpload> = ({
  directory,
  emptyText,
  className,
  disabled,
  onChange,
  value,
}) => {
  const intl = useIntl();

  const handleUpload = ({ file, fileList }: UploadChangeParam<UploadFile<any>>) => {
    const newValue = directory ? fileList : file;
    onChange?.(newValue);
  };

  return (
    <Upload.Dragger
      beforeUpload={() => false}
      directory={!!directory}
      onChange={handleUpload}
      fileList={value || []}
      className={`${styles.InputUpload} ${className || ''}`}
      disabled={disabled}
    >
      <p className="ant-upload-drag-icon">
        <InboxOutlined />
      </p>
      <p className="ant-upload-text">
        {emptyText || intl.formatMessage({ id: 'component.upload.drag-drop.folder.content' })}
      </p>
    </Upload.Dragger>
  );
};

interface IInputMarkdown {
  input?: {
    autoSize?: TextAreaProps['autoSize'];
    placeholder?: TextAreaProps['placeholder'];
  };
  // Default
  onChange?: (data: any) => void;
  value?: any;
}

const InputMarkdown: React.FC<IInputMarkdown> = ({ input, value, onChange }) => {
  const [isPreviewing, setPreview] = useState<boolean>(false);
  const intl = useIntl();

  const handleChange = (data: any) => {
    onChange?.(data);
  };
  const togglePreview = () => {
    setPreview(!isPreviewing);
  };

  return (
    <div className={styles.InputMarkdown}>
      <div className={`inputMarkdown-content ${isPreviewing ? 'preview' : 'edit'}`}>
        {isPreviewing ? (
          <ReactMarkdown
            className="react-markdown"
            remarkPlugins={[remarkGfm]}
            children={value || ''}
          />
        ) : (
          <Input.TextArea
            autoSize={input?.autoSize || { minRows: 4, maxRows: 10 }}
            placeholder={
              input?.placeholder ||
              intl.formatMessage({ id: 'component.inputMarkdown.placeholder' })
            }
            onChange={(e) => handleChange(e.target.value)}
            value={value || ''}
          />
        )}
      </div>
      <div className="inputMarkdown-preview" onClick={togglePreview}>
        {isPreviewing ? <EditFilled /> : <EyeFilled />}
      </div>
    </div>
  );
};

interface IInputDisplay {
  value?: any;
}
const InputDisplay: React.FC<IInputDisplay> = ({ value }) => {
  return <div className={styles.InputDisplay}>{value}</div>;
};

export {
  LabelWithDesc,
  TimeRangeInput,
  TableSearchSelect,
  InputSearchSelect,
  InputsNested,
  TagSelection,
  InputUpload,
  InputMarkdown,
  InputDisplay,
};
