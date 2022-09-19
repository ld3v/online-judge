import Card from '@/components/Card';
import { Button, notification } from 'antd';
import { useEffect, useState } from 'react';
import { connect, FormattedHTMLMessage, FormattedMessage, useIntl } from 'umi';

interface ISyncConfiguration {
  dispatch?: any;
  syncing?: boolean;
  className?: string;
}

const SyncConfiguration: React.FC<ISyncConfiguration> = ({ dispatch, syncing, className }) => {
  const intl = useIntl();

  const [judgeURL, setJudgeURL] = useState<string>('');

  const handleSyncConfiguration = () => {
    const callback = (res: any) => {
      if (res) {
        notification.success({
          message: intl.formatMessage({ id: 'settings.sync-configuration.success' }),
        });
      }
    };
    dispatch({ type: 'settings/sync', payload: { callback } });
  };

  useEffect(() => {
    const callback = (url: any) => {
      if (url) {
        setJudgeURL(url);
      }
    };
    dispatch({
      type: 'settings/getJudgeURL',
      payload: {
        callback,
      },
    });
  }, []);

  return (
    <Card
      cardTitle={intl.formatMessage({ id: 'settings.sync-configuration' })}
      className={className || ''}
    >
      <FormattedHTMLMessage
        id="settings.sync-configuration.description"
        values={{ judgeURL: judgeURL || false }}
      />
      <br />
      <br />
      <Button danger onClick={() => handleSyncConfiguration()} loading={syncing}>
        <FormattedMessage id="settings.sync-configuration.submit-title" />
      </Button>
    </Card>
  );
};

export default connect(({ loading }: any) => ({
  syncing: loading.effects['settings/sync'],
}))(SyncConfiguration);
