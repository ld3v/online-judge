import { DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import React, { useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'umi';
import FilesStructure from './FileStructure';

import styles from './styles.less';

const FileDisplay: React.FC<{ name: string }> = ({ name }) => {
  return <div className={styles.FileDisplay}>{name}</div>;
};

export type TFileDisplay = { file: File; name: string; key: string };

const FilesDisplay: React.FC<{
  files: TFileDisplay[];
  onClearAll: () => void;
}> = ({ files, onClearAll }) => {
  const [filesNeedViewStructure, setFilesViewStructure] = useState<TFileDisplay[]>([]);
  const intl = useIntl();
  const isEmpty = !Array.isArray(files) || files.length === 0;

  useEffect(() => {
    if (files.length === 0) {
      setFilesViewStructure([]);
    }
  }, [(files || []).length]);

  const handleViewStructure = () => {
    if (filesNeedViewStructure && filesNeedViewStructure.length > 0) {
      setFilesViewStructure([]);
      return;
    }
    setFilesViewStructure(files);
  };

  return (
    <div
      className={styles.InputUploadPreview}
      data-showing-structure={filesNeedViewStructure && filesNeedViewStructure.length > 0}
    >
      <div className={styles.Preview}>
        <div className={styles.InputUploadItems}>
          {isEmpty ? (
            <span>
              <FormattedMessage id="component.input-upload.empty" />
            </span>
          ) : (
            files.map((item) => <FileDisplay name={item.name} key={item.key} />)
          )}
        </div>
        <div className={styles.InputUploadActions}>
          <Tooltip title={intl.formatMessage({ id: 'component.input-upload.view-structure' })}>
            <div
              className={styles.InputUploadAction}
              onClick={() => (isEmpty ? null : handleViewStructure())}
              data-disabled={isEmpty}
            >
              <EyeOutlined style={{ fontSize: 12 }} />
            </div>
          </Tooltip>
          <Tooltip
            title={isEmpty ? false : intl.formatMessage({ id: 'component.input-upload.clear-all' })}
          >
            <div
              className={styles.InputUploadAction}
              onClick={() => (isEmpty ? null : onClearAll())}
              data-disabled={isEmpty}
            >
              <DeleteOutlined style={{ fontSize: 12 }} />
            </div>
          </Tooltip>
        </div>
      </div>
      <FilesStructure files={files} />
    </div>
  );
};

export default FilesDisplay;
