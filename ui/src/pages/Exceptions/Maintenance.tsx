import Fix from '@/components/Icons/Fix';
import moment from 'moment';
import { FormattedHTMLMessage, FormattedMessage, Redirect } from 'umi';
import styles from './styles.less';

const Maintenance = () => {
  const maintenance = localStorage.getItem(`${LC_STR_PREFIX}MAINTENANCE`);
  if (!maintenance) {
    return <Redirect to="/" />;
  }

  const typeMsg = moment(maintenance, 'X').isValid() ? 'time' : 'forever';
  const maintenanceDone =
    typeMsg === 'time' ? moment(maintenance, 'X').format('HH:mm - DD/MM/YYYY') : '';

  return (
    <div className={styles.Maintenance}>
      <div className="view-box">
        <div className="icon">
          <Fix size={100} color="#fff" />
        </div>
        <div className="content">
          <div className="title">
            <FormattedMessage id="system.maintenance.title" />
          </div>
          <div className="desc">
            <FormattedHTMLMessage
              id="system.maintenance.desc"
              values={{ type: typeMsg, time: maintenanceDone }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Maintenance;
