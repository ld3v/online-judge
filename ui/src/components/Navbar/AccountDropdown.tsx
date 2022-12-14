import { TAccount, TAccountRole } from '@/types/account';
import { ROLES } from '@/utils/constants';
import { Dropdown } from 'antd';
import { FC } from 'react';
import { connect, FormattedHTMLMessage, FormattedMessage, useHistory } from 'umi';
import styles from './styles.less';

type TDropdownItem = {
  title: string;
  trigger: string | '';
  roleAccessible: TAccountRole[];
  divider?: 'top' | 'none';
};
const dropdownItems: TDropdownItem[] = [
  {
    title: 'navbar.account.update-info',
    trigger: 'updateInfo',
    roleAccessible: [ROLES.admin, ROLES.user],
  },
  {
    title: 'navbar.account.logout',
    trigger: 'logout',
    roleAccessible: [ROLES.admin, ROLES.user],
    divider: 'top',
  },
];

type actionFunc = Record<string, () => void>;

interface DropdownContentProps {
  action: actionFunc;
  account: TAccount;
}
const DropdownContent: FC<DropdownContentProps> = ({ action, account }) => {
  const dropdownItemsAvailable = dropdownItems.filter((item) =>
    item.roleAccessible.includes(account.role),
  );
  return (
    <div className={styles.DropdownContent} key="user-authenticated-nav-account-dropdown">
      <div className="account divider-bottom">
        <FormattedHTMLMessage
          id="navbar.account.info"
          values={{
            displayName: account.displayName ? ` ${account.displayName}` : '',
            username: account.username,
          }}
        />
      </div>
      <div className="dropdown-items">
        {dropdownItemsAvailable.map((item) => (
          <div
            className={`dropdown-item divider-${item.divider || 'none'} ${
              !!action[item.trigger] ? '' : 'disabled'
            }`}
            onClick={() => action[item.trigger]?.()}
            key={item.title}
          >
            <FormattedMessage id={item.title} />
          </div>
        ))}
      </div>
    </div>
  );
};

interface AccountDropdownProps {
  currentAccount?: TAccount;
}
const AccountDropdown: FC<AccountDropdownProps> = ({ currentAccount: account }) => {
  const history = useHistory();

  const action = {
    updateInfo: () => history.push('/accounts/me'),
    logout: () => {
      localStorage.removeItem(`${LC_STR_PREFIX}AUTH`);
      window.location.href = '/';
    },
  };
  if (!account) {
    return null;
  }
  return (
    <Dropdown
      overlay={<DropdownContent action={action} account={account} />}
      overlayClassName={`${styles.DropdownContentWrapper} account`}
      placement="bottomRight"
      trigger={['click']}
    >
      <div className={styles.Action}>
        <div className="avatar">
          {/* <img src={account.avatar || '/default-avatar.png'} alt="navbar-account-avatar" /> */}
          <img src={'/default-avatar.png'} alt="navbar-account-avatar" />
        </div>
      </div>
    </Dropdown>
  );
};

export default connect(({ account }: any) => ({ currentAccount: account.dic[account.current] }))(
  AccountDropdown,
);
