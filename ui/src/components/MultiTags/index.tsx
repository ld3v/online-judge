import { Tag, Tooltip } from 'antd';
import { FormattedMessage } from 'umi';

import styles from './styles.less';

interface IMultiTags<TagType = any> {
  items: TagType[];
  displayKey: string;
  itemKey: string;
  numItemsDisplay?: number;
  emptyMsgId: string;
  extraItemsMsgId: string;
  isOverflowText?: boolean;
}

const MultiTags: React.FC<IMultiTags> = ({
  items,
  displayKey,
  itemKey,
  numItemsDisplay,
  emptyMsgId,
  extraItemsMsgId,
  isOverflowText,
}) => {
  const maxItemRender = numItemsDisplay || 3;
  const itemLength = items.length;
  if (!itemLength) return <FormattedMessage id={emptyMsgId} />;
  const extraItems = items
    .slice(numItemsDisplay)
    .map((item: any) => item[displayKey])
    .join(', ');
  const extraItemsRender =
    itemLength - maxItemRender > 0 ? (
      <Tooltip title={extraItems}>
        <Tag>
          <FormattedMessage id={extraItemsMsgId} values={{ count: itemLength - maxItemRender }} />
        </Tag>
      </Tooltip>
    ) : null;
  const renderItems = items.slice(0, numItemsDisplay).map((item: any) => (
    <Tag key={item[itemKey]} className={isOverflowText ? styles.overflowText : ''}>
      {item[displayKey]}
    </Tag>
  ));
  return (
    <>
      {renderItems}
      {extraItemsRender}
    </>
  );
};

export default MultiTags;
