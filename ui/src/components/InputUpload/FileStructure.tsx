import { FileStructure, getFileStructure } from '@/utils/funcs';
import { TFileDisplay } from './FilesDisplay';
import styles from './styles.less';

const FilesStructure: React.FC<{ files: TFileDisplay[] }> = ({ files }) => {
  const structure = getFileStructure(files);

  const renderFileTree = (structure: FileStructure | string) => {
    return (
      <>
        {Object.keys(structure).map((itemKey) => {
          const isFile = typeof structure[itemKey] === 'string';
          if (isFile) {
            return (
              <div className="file-structure__file" key={`file_${itemKey}`}>
                <div className="filename">{itemKey}</div>
              </div>
            );
          }
          return (
            <div className="file-structure__file" key={`folder_${itemKey}`}>
              <div className="file-structure__folder">
                <div className="name">{itemKey}</div>
                <div className="files">{renderFileTree(structure[itemKey])}</div>
              </div>
            </div>
          );
        })}
      </>
    );
  };

  return (
    <div className={styles.FilesStructure}>
      <div className="file-structure__folder">{renderFileTree(structure)}</div>;
    </div>
  );
};

export default FilesStructure;
