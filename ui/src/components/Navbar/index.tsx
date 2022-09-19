import { FC } from 'react';
import AccountDropdown from './AccountDropdown';
import NotifyDropdown from './NotifyDropdown';
import styles from './styles.less';

const Navbar: FC = () => (
  <div className={styles.Navbar}>
    <div className="logo">
      <img src="/logo-banner.png" alt="logo-banner" />
    </div>
    <div className="actions">
      <NotifyDropdown />
      <AccountDropdown />
    </div>
  </div>
);

export default Navbar;
