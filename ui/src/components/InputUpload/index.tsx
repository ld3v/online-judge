import { Upload, UploadProps } from 'antd';
import { FormattedHTMLMessage } from 'umi';
import FilesDisplay, { TFileDisplay } from './FilesDisplay';

import styles from './styles.less';

export interface IInputUpload {
  directory?: boolean;
  className?: string;
  disabled?: boolean;
  // Default
  onChange?: (data: { file: File; name: string; key: string }[]) => void;
  value?: TFileDisplay[];
}
const InputUpload: React.FC<IInputUpload> = ({ directory, disabled, onChange, value }) => {
  const handleChange: UploadProps['onChange'] = ({ fileList }) => {
    const newValue = fileList
      .map((fileItem) => ({
        name: fileItem.name,
        file: fileItem.originFileObj,
        key: fileItem.uid,
      }))
      .filter((fileItem) => !!fileItem.file) as TFileDisplay[];
    onChange?.(newValue);
  };

  if (Array.isArray(value) && value.length > 0) {
    return <FilesDisplay files={value} onClearAll={() => onChange?.([])} />;
  }

  return (
    <Upload.Dragger
      onChange={handleChange}
      directory={!!directory}
      disabled={!!disabled}
      className={styles.InputUpload}
    >
      <FormattedHTMLMessage id="component.input-upload.empty" />
    </Upload.Dragger>
  );
};

export default InputUpload;
