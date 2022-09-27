import Card from '@/components/Card';
import { TQueue, TQueueState } from '@/types/queue';
import { FORMAT_DATETIME } from '@/utils/constants';
import { CheckCircleFilled, ExclamationCircleFilled, LoadingOutlined } from '@ant-design/icons';
import { Alert, Button, Collapse, Empty, Steps } from 'antd';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { connect, FormattedHTMLMessage, FormattedMessage, useIntl } from 'umi';

interface ISyncData {
  isSyncingAllData?: boolean;
  isSyncingAllStatus?: boolean;
  isGettingSyncAllCurrentStatus?: boolean;
  syncAllHistoryMapping?: Record<string, TQueue>;
  dispatch?: any;
}

const SUCCESS_COLOR = '#52c41a';
const ERROR_COLOR = '#f5222d';
const PROCESS_COLOR = '#1890ff';
const extraIconMapping: Record<TQueueState, React.ReactNode> = {
  DONE: <CheckCircleFilled style={{ color: SUCCESS_COLOR }} />,
  ERR: <ExclamationCircleFilled style={{ color: ERROR_COLOR }} />,
  PROCESS: <LoadingOutlined style={{ color: PROCESS_COLOR }} spin />,
  WAIT: <LoadingOutlined style={{ color: PROCESS_COLOR }} spin />,
  CREATED: <LoadingOutlined style={{ color: PROCESS_COLOR }} spin />,
};

const ProcessContent: React.FC<{ process: Record<string, TQueueState> }> = ({ process }) => {
  const intl = useIntl();

  const steps = Object.keys(process).map((processNameId) => (
    <Steps.Step
      title={intl.formatMessage({ id: `settings.sync-all-data.process._.${processNameId}` })}
      description={intl.formatMessage({ id: `queue.state.${process[processNameId]}` })}
      key={`process#${processNameId}`}
    />
  ));
  return (
    <Steps progressDot current={steps.length - 1} direction="vertical">
      {steps}
    </Steps>
  );
};

const SyncData: React.FC<ISyncData> = ({ syncAllHistoryMapping, dispatch }) => {
  const [currentId, setCurrentId] = useState<string>('');
  const [historyIds, setHistoryIds] = useState<string[]>([]);

  const intl = useIntl();

  const handleGetSyncAllStatus = (customCb?: (state: any, error?: any, data?: any) => void) => {
    const callback = (state: any, _: any, data: any) => {
      if (state) {
        setCurrentId(state.currentId || '');
        setHistoryIds(state.historyIds || []);
      }
      customCb?.(state, _, data);
    };
    dispatch({
      type: 'settings/syncAllDataStatus',
      payload: {
        callback,
      },
    });
  };

  useEffect(() => {
    handleGetSyncAllStatus();
  }, []);

  useEffect(() => {
    if (!currentId) {
      return;
    }
    const intervalRefreshCurrentProcess = setInterval(() => {
      const clearIntervalCb = (state: any, _: any, data: any) => {
        if (state && data.state === 'DONE') {
          clearInterval(intervalRefreshCurrentProcess);
        }
      };
      handleGetSyncAllStatus(clearIntervalCb);
    }, 5000);

    return () => clearInterval(intervalRefreshCurrentProcess);
  }, [currentId]);

  const handleSyncAll = () => {
    const callback = (state: any) => {
      if (state) {
        setCurrentId(state);
      }
    };
    dispatch({
      type: 'settings/syncAllData',
      payload: {
        callback,
      },
    });
  };

  const renderCurrent = () => {
    if (currentId === '')
      if (!currentId) {
        return (
          <Alert
            type="error"
            message={<FormattedMessage id="settings.sync-all-data.no-processing" />}
            action={
              <Button onClick={handleSyncAll}>
                <FormattedMessage id="settings.sync-all-data.sync-button-title" />
              </Button>
            }
          />
        );
      }
    const currentData = syncAllHistoryMapping?.[currentId];
    if (!currentData) {
      return (
        <Collapse>
          <Collapse.Panel
            header={intl.formatMessage({
              id: 'exception.settings.sync-all-data.process-empty-info',
            })}
            key="syncAllDataProcesses_current"
            extra={extraIconMapping.ERR}
            collapsible="disabled"
          />
        </Collapse>
      );
    }
    return (
      <Collapse>
        <Collapse.Panel
          header={
            <FormattedHTMLMessage
              id="settings.sync-all-data.process.current.title"
              values={{
                time: moment(new Date(currentData.createdAt)).format(FORMAT_DATETIME),
                jobId: currentData.jobId,
                queueId: currentData.id,
              }}
            />
          }
          extra={extraIconMapping[currentData.state || 'CREATED']}
          key="syncAllDataProcesses_current"
        >
          <ProcessContent process={currentData.process} />
        </Collapse.Panel>
      </Collapse>
    );
  };

  const renderHistory = () => {
    if (historyIds.length === 0) {
      return (
        <Empty
          description={intl.formatMessage({ id: 'exception.settings.sync-all-data.history.empty' })}
        />
      );
    }
    return (
      <Collapse accordion>
        {historyIds.map((id) => {
          const historyData = syncAllHistoryMapping?.[id];
          if (!historyData) {
            return null;
          }
          return (
            <Collapse.Panel
              header={
                <FormattedHTMLMessage
                  id="settings.sync-all-data.process.title"
                  values={{
                    time: moment(new Date(historyData.createdAt)).format(FORMAT_DATETIME),
                    jobId: historyData.jobId,
                    queueId: historyData.id,
                  }}
                />
              }
              key={`syncAllDataProcesses_process${id}`}
              extra={extraIconMapping[historyData.state || 'CREATED']}
            >
              <ProcessContent process={historyData.process} />
            </Collapse.Panel>
          );
        })}
      </Collapse>
    );
  };

  return (
    <Card
      cardTitle={intl.formatMessage({ id: 'settings.sync-all-data' })}
      cardDescription={<FormattedHTMLMessage id="settings.sync-all-data.description" />}
    >
      {renderCurrent()}
      <h3>
        <FormattedMessage id="settings.sync-all-data.history-title" />
      </h3>
      {renderHistory()}
    </Card>
  );
};

export default connect(({ loading, settings }: any) => ({
  syncAllHistoryMapping: settings.syncAllHistory,
  isSyncingAllData: loading.effects['settings/syncAllData'],
  isSyncingAllStatus: loading.effects['settings/syncAllDataStatus'],
}))(SyncData);
