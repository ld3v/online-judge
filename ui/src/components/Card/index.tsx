import { LoadingOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, ButtonProps, Input } from 'antd';
import { debounce } from 'lodash';
import { FC, useCallback } from 'react';

import styles from './styles.less';

export interface CardAction extends ButtonProps {
  title: string;
  key: string;
}

export interface CardSearch {
  placeholder?: string;
  onSearch: (keyword: string) => void;
  debounceTime?: number;
  loading?: boolean;
}

interface ICard {
  cardTitle?: React.ReactNode | string;
  cardDescription?: React.ReactNode | string;
  search?: CardSearch;
  className?: string;
  actions?: CardAction[];
  children: React.ReactNode;
}

const Card: FC<ICard> = ({ className, cardTitle, cardDescription, search, actions, children }) => {
  const handleSearch = useCallback(
    debounce((keyword: string) => {
      search?.onSearch?.(keyword);
    }, search?.debounceTime || 700),
    [],
  );

  return (
    <div className={`${styles.Card} ${className || ''}`}>
      {(!!cardTitle || !!actions || !!search) && (
        <div className="card-header">
          {cardTitle && (
            <div className="header">
              <div className="title">{cardTitle}</div>
              {cardDescription && <div className="description">{cardDescription}</div>}
            </div>
          )}
          {(!!actions || !!search) && (
            <div className="actions">
              {!!search && (
                <div className="search">
                  <Input
                    placeholder={search.placeholder}
                    onChange={({ target }) => handleSearch(target.value)}
                    suffix={search.loading ? <LoadingOutlined /> : <SearchOutlined />}
                  />
                </div>
              )}
              {Array.isArray(actions) && actions.length > 0 ? (
                <div className="buttons">
                  {actions.map(({ key, title, ...btnProps }) => (
                    <Button {...btnProps} key={key}>
                      {title}
                    </Button>
                  ))}
                </div>
              ) : null}
            </div>
          )}
        </div>
      )}
      <div className="card-body">{children}</div>
    </div>
  );
};

export default Card;
