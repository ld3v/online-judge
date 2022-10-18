import { Button, Dropdown, Empty } from 'antd';
import { FC, useState } from 'react';
import { BellOutlined } from '@ant-design/icons';
import { connect, FormattedMessage, useIntl } from 'umi';
import styles from './styles.less';
import { ROLES } from '@/utils/constants';

type TNotification = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
};
type viewNotifyFunc = (id: string) => void;

interface DropdownContentProps {
  view?: viewNotifyFunc;
  create?: () => void;
  isAdmin: boolean;
  notifications?: TNotification[];
  onCloseOverlay: () => void;
}
const DropdownContent: FC<DropdownContentProps> = ({
  isAdmin,
  view,
  create,
  notifications,
  onCloseOverlay,
}) => {
  const intl = useIntl();

  const handleCreate = () => {
    create?.();
    onCloseOverlay();
  };
  const handleView = (id: string) => {
    view?.(id);
    onCloseOverlay();
  };

  if (!Array.isArray(notifications) || !notifications.length) {
    return (
      <>
        <div className={styles.DropdownContent}>
          <Empty description={intl.formatMessage({ id: 'navbar.notifications.empty' })} />
        </div>
        {isAdmin && (
          <div className={styles.DropdownActions}>
            <Button type="link" onClick={handleCreate}>
              <FormattedMessage id="navbar.notifications.add" />
            </Button>
          </div>
        )}
      </>
    );
  }
  return (
    <>
      <div className={styles.DropdownContent} key="user-authenticated-nav-notify-dropdown">
        <div className="dropdown-items">
          {(notifications || []).map((item) => (
            <div
              className="dropdown-item notification-item"
              onClick={() => handleView(item.id)}
              key={item.id}
            >
              <div className="notify-title">{item.title}</div>
              <div className="notify-content">{item.content}</div>
            </div>
          ))}
        </div>
      </div>
      {isAdmin && (
        <div className={styles.DropdownActions}>
          <Button type="link" onClick={handleCreate}>
            <FormattedMessage id="navbar.notifications.add" />
          </Button>
        </div>
      )}
    </>
  );
};

interface NotifyDropdownProps {
  isAdmin: boolean;
  notifications?: TNotification[];
  isLoggedIn?: boolean;
  dispatch?: any;
}
const NotifyDropdown: FC<NotifyDropdownProps> = ({
  isAdmin,
  notifications,
  isLoggedIn,
  dispatch,
}) => {
  const [overlayVisible, setOverlayVisible] = useState<boolean>(false);

  if (!isLoggedIn) {
    return null;
  }
  const handleCreateNotification = () => {
    dispatch({ type: 'notification/modalCreateVisible', visible: true });
  };

  const handleViewNotification = (id: string) => {
    dispatch({ type: 'notification/select', payload: { id } });
  };

  const handleCloseOverlay = () => {
    setOverlayVisible(false);
  };
  const handleOpenChange = (flag: boolean) => {
    setOverlayVisible(flag);
  };

  return (
    <Dropdown
      overlay={
        <DropdownContent
          isAdmin={isAdmin}
          view={handleViewNotification}
          create={handleCreateNotification}
          notifications={notifications}
          onCloseOverlay={handleCloseOverlay}
        />
      }
      overlayClassName={`${styles.DropdownContentWrapper} notifications`}
      placement="bottomRight"
      trigger={['click']}
      onOpenChange={handleOpenChange}
      open={overlayVisible}
    >
      <div className={`${styles.Action} notifications`}>
        <div className="bell">
          <BellOutlined style={{ fontSize: '20px' }} />
        </div>
      </div>
    </Dropdown>
  );
};

export default connect(({ account, notification }: any) => ({
  isLoggedIn: !!account.current,
  isAdmin: account.dic[account.current]?.role === ROLES.admin,
  notifications: notification.list.map((id: string) => notification.dic[id]),
}))(NotifyDropdown);
