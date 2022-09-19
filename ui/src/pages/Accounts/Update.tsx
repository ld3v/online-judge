import { Alert, notification, Skeleton } from 'antd';
import React, { useEffect } from 'react';
import { connect, FormattedHTMLMessage, useHistory, useIntl, useParams } from 'umi';
import AccountForm from './AccountForm';
import DisableAccount from './DisableAccount';

import styles from './styles.less';

interface IUpdateAccountPage {
  selected?: any;
  selectedLoading?: boolean;
  selectedUpdating?: boolean;
  dispatch?: any;
  currentAccount?: any;
}

const UpdateAccountPage: React.FC<IUpdateAccountPage> = ({
  selected,
  selectedLoading,
  selectedUpdating,
  dispatch,
  currentAccount,
}) => {
  const intl = useIntl();
  const params = useParams();
  const history = useHistory();

  const { id }: any = params || {};

  const handleSubmit = (data: any) => {
    const { id }: any = params || {};
    const callback = (res: any) => {
      if (res) {
        notification.success({
          message: intl.formatMessage({ id: 'account.update.success' }),
        });
        history.push('/accounts');
      }
    };
    dispatch({
      type: 'account/updateById',
      payload: {
        id,
        data,
        callback,
      },
    });
  };

  useEffect(() => {
    const callback = (res: any) => {
      if (!res) {
        notification.error({
          message: intl.formatMessage({ id: 'exception.account.notfound' }, { isMany: false }),
        });
        history.goBack();
        return;
      }
      if (!res.editable) {
        notification.error({
          message: intl.formatMessage({ id: 'exception.account.no-edit' }),
        });
        history.goBack();
        return;
      }
    };
    dispatch({
      type: 'account/getById',
      payload: {
        id,
        callback,
      },
    });
  }, []);

  if (!selected || selectedLoading) {
    return <Skeleton active />;
  }

  return (
    <div className={styles.UpdatePage}>
      {currentAccount?.id === selected.id && (
        <Alert
          message={intl.formatMessage({ id: 'account.alert.update-me.title' })}
          description={<FormattedHTMLMessage id="account.alert.update-me.description" />}
          type="warning"
          showIcon
          className={styles.alert}
          closable
        />
      )}
      {selected?.isRoot && (
        <Alert
          message={intl.formatMessage({ id: 'account.alert.update-root.title' })}
          description={
            <FormattedHTMLMessage
              id="account.alert.update-root.description"
              values={{ isMe: currentAccount?.id === selected.id }}
            />
          }
          type="info"
          showIcon
          closable
          className={styles.alert}
        />
      )}
      <AccountForm
        cardTitle={intl.formatMessage({ id: 'account.update' })}
        onSubmit={handleSubmit}
        defaultValues={selected}
        submitting={selectedUpdating}
        roleEditable={selected.roleEditable}
        submitTitle={intl.formatMessage({ id: 'account.update.submit' })}
        className={styles.UpdateInfo}
      />
      <DisableAccount account={selected} />
    </div>
  );
};

export default connect(({ account, loading }: any) => ({
  currentAccount: account.dic[account.current],
  selected: account.dic[account.selected],
  selectedLoading: loading.effects['account/getById'],
  selectedUpdating: loading.effects['account/updateById'],
}))(UpdateAccountPage);
