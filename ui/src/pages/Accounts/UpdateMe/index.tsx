import Card from '@/components/Card';
import { notification, Skeleton } from 'antd';
import { useEffect } from 'react';
import { connect, useIntl } from 'umi';
import AccountForm from '../AccountForm';

import styles from './styles.less';
import ValidateWarn from './ValidateWarn';

interface IUpdateMe {
  dispatch: any;
  updating: boolean;
  loadingMe: boolean;
  currentAccount: any;
}

const UpdateMePage: React.FC<IUpdateMe> = ({ dispatch, currentAccount, loadingMe, updating }) => {
  const intl = useIntl();

  const handleSubmit = (data: any) => {
    const callback = (res: any) => {
      if (res) {
        notification.success({
          message: intl.formatMessage({ id: 'account.update.success' }),
        });
      }
    };
    dispatch({
      type: 'account/updateById',
      payload: {
        id: 'me',
        data,
        callback,
      },
    });
  };

  useEffect(() => {
    // Load current account's data to make sure this is newest data!
    dispatch({ type: 'account/loadMe' });
  }, []);

  if (!currentAccount || loadingMe) {
    return (
      <Card cardTitle={intl.formatMessage({ id: 'account.update' })}>
        <Skeleton active />
      </Card>
    );
  }

  return (
    <div className={styles.UpdateMe}>
      <ValidateWarn className={styles.ValidateWarn} contentClassName={styles.content} />
      <AccountForm
        cardTitle={intl.formatMessage({ id: 'account.update' })}
        onSubmit={handleSubmit}
        defaultValues={currentAccount}
        submitting={updating}
        submitTitle={intl.formatMessage({ id: 'account.update.submit' })}
        className={styles.UpdateMeForm}
      />
    </div>
  );
};

export default connect(({ account, loading }: any) => ({
  currentAccount: account.dic[account.current],
  updating: loading.effects['account/updateById'],
  loadingMe: loading.effects['account/loadMe'],
}))(UpdateMePage);
