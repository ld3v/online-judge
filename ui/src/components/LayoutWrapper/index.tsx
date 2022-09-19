import { ROLES } from '@/utils/constants';
import { getMenuData, getPageTitle } from '@ant-design/pro-layout';
import { FC, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { ConnectProps, history, useDispatch } from 'umi';
import { connect, useIntl } from 'umi';
import { ErrorBoundary } from '../Boundary';
import Navbar from '../Navbar';
import CreateNotification from '../Modal/CreateNotification';
import ViewNotification from '../Modal/ViewNotification';
import SIDEBAR_ITEMS from './sidebarItems';

import styles from './styles.less';

export interface LayoutWrapperProps extends ConnectProps {
  currentAccount: any;
}

const LayoutWrapper: FC<LayoutWrapperProps> = (props: any) => {
  // Handle logic to get page's title
  const {
    route = {
      routes: [],
    },
    currentAccount,
  } = props;

  const dispatch = useDispatch();
  const intl = useIntl();

  useEffect(() => {
    const notificationCallback = (res: any) => {
      if (!res) {
        return;
      }
    };
    if (currentAccount) {
      dispatch({
        type: 'notification/getAll',
        payload: {
          callback: notificationCallback,
        },
      });

      if (currentAccount.role === ROLES.admin) {
        dispatch({ type: 'settings/getAll' });
      }
    }
  }, [currentAccount && currentAccount.id]);

  const { routes = [] } = route;
  const {
    children,
    location = {
      pathname: '',
    },
  } = props;
  const { breadcrumb } = getMenuData(routes);
  const pageName = getPageTitle({
    pathname: location.pathname,
    breadcrumb,
    ...props,
  });
  const title = pageName ? intl.formatMessage({ id: pageName, defaultMessage: '' }) : '';
  const pageTitle = intl.formatMessage({ id: 'site', defaultMessage: 'UIT Contest' });

  // Handle logic to render sidebar
  if (!currentAccount || Object.keys(currentAccount).length === 0) {
    return (
      <ErrorBoundary>
        <Helmet>
          <title>{pageName && title ? `${title} - ${pageTitle}` : pageTitle}</title>
        </Helmet>
        <ErrorBoundary>{children}</ErrorBoundary>
      </ErrorBoundary>
    );
  }

  const sidebarItems = SIDEBAR_ITEMS.filter((item) =>
    item.roleAccessible.includes(currentAccount.role),
  );
  const pageNamesAvailable = sidebarItems.map((sidebar) => sidebar.title);
  if (!pageNamesAvailable.includes(pageName)) {
    console.error(
      `no.page-name.available for "${location.pathname}": ${pageName || '"no-page-name"'} - ${
        currentAccount?.role || '"no-account"'
      }`,
    );
  }
  return (
    <ErrorBoundary>
      <Helmet>
        <title>{pageName && title ? `${title} - ${pageTitle}` : pageTitle}</title>
      </Helmet>
      <div className={styles.LayoutWrapper}>
        <Navbar />
        <div className="main">
          <div className="sidebar">
            <div className="sidebar-items">
              <ErrorBoundary>
                {sidebarItems
                  .filter((i) => i.href)
                  .map((item) => (
                    <div
                      key={item.key}
                      className={`sidebar-item ${pageName === item.title ? 'active' : ''}`}
                      onClick={() => (pageName === item.title ? null : history.push(item.href))}
                    >
                      {intl.formatMessage({ id: item.title })}
                    </div>
                  ))}
              </ErrorBoundary>
            </div>
          </div>
          <div className="content">
            <ErrorBoundary>{children}</ErrorBoundary>
          </div>
        </div>
      </div>

      {/* MODAL */}
      <CreateNotification />
      <ViewNotification />
    </ErrorBoundary>
  );
};

export default connect(({ account }: any) => ({ currentAccount: account.dic[account.current] }))(
  LayoutWrapper,
);
