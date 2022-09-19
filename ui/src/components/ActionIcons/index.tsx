import {
  CodeOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  LockOutlined,
  MailOutlined,
  OrderedListOutlined,
  ReloadOutlined,
  SolutionOutlined,
  TrophyOutlined,
  UnlockOutlined,
} from '@ant-design/icons';
import { Popconfirm, Tooltip } from 'antd';
import React from 'react';
import { useIntl } from 'umi';

import styles from './styles.less';

export interface IActionIcons {
  title?: string;
  className?: string;
  actions: {
    title?: string;
    key: string;
    action: () => void | null;
    icon: 'edit' | 'del' | React.ReactNode;
    disabled?: boolean;
  }[];
}

const ActionIcons: React.FC<IActionIcons> = ({ title, className, actions }) => {
  const intl = useIntl();
  return (
    <div className={`${styles.ActionIcons} ${className || ''}`}>
      {actions.map(({ title: actionTitle, key, icon, action, disabled }) => {
        if (typeof icon === 'string') {
          switch (icon) {
            case 'view':
              const viewTit = intl.formatMessage({ id: 'component.actions-icon.view' });
              return (
                <Tooltip title={actionTitle || viewTit} key={key}>
                  <EyeOutlined onClick={disabled ? () => null : action} disabled={disabled} />
                </Tooltip>
              );
            case 'code':
              const codeTit = intl.formatMessage({ id: 'component.actions-icon.code' });
              return (
                <Tooltip title={actionTitle || codeTit} key={key}>
                  <CodeOutlined onClick={disabled ? () => null : action} disabled={disabled} />
                </Tooltip>
              );
            case 'scoreboard':
              const scoreboardTit = intl.formatMessage({ id: 'component.actions-icon.scoreboard' });
              return (
                <Tooltip title={actionTitle || scoreboardTit} key={key}>
                  <TrophyOutlined onClick={disabled ? () => null : action} disabled={disabled} />
                </Tooltip>
              );
            case 'submission':
              const submissionTit = intl.formatMessage({ id: 'component.actions-icon.submission' });
              return (
                <Tooltip title={actionTitle || submissionTit} key={key}>
                  <SolutionOutlined onClick={disabled ? () => null : action} disabled={disabled} />
                </Tooltip>
              );
            case 'edit':
              const editTit = intl.formatMessage({ id: 'component.actions-icon.edit' });
              return (
                <Tooltip title={actionTitle || editTit} key={key}>
                  <EditOutlined onClick={disabled ? () => null : action} disabled={disabled} />
                </Tooltip>
              );
            case 'lock':
              const lockTit = intl.formatMessage({ id: 'component.actions-icon.lock' });
              return (
                <Tooltip title={actionTitle || lockTit} key={key}>
                  <LockOutlined onClick={disabled ? () => null : action} disabled={disabled} />
                </Tooltip>
              );
            case 'lock-me':
              const lockMeTit = intl.formatMessage({ id: 'component.actions-icon.lock-me' });
              if (disabled) {
                return (
                  <Tooltip title={actionTitle || lockMeTit} key={key}>
                    <LockOutlined disabled />
                  </Tooltip>
                );
              }
              return (
                <Tooltip title={actionTitle || lockMeTit} key={key}>
                  <Popconfirm
                    title={intl.formatMessage({ id: 'component.actions-icon.lock-me.title' })}
                    onConfirm={action}
                    okText={intl.formatMessage({ id: 'component.actions-icon.lock-text' })}
                    cancelText={intl.formatMessage({ id: 'component.actions-icon.cancel-text' })}
                    placement="topRight"
                  >
                    <LockOutlined />
                  </Popconfirm>
                </Tooltip>
              );
            case 'unlock':
              const unlockTit = intl.formatMessage({ id: 'component.actions-icon.unlock' });
              return (
                <Tooltip title={actionTitle || unlockTit} key={key}>
                  <UnlockOutlined onClick={disabled ? () => null : action} disabled={disabled} />
                </Tooltip>
              );
            case 'mail':
              const mailTit = intl.formatMessage({ id: 'component.actions-icon.send-mail' });
              return (
                <Tooltip title={actionTitle || mailTit} key={key}>
                  <MailOutlined onClick={disabled ? () => null : action} disabled={disabled} />
                </Tooltip>
              );

            case 'list':
              const listTit = intl.formatMessage({ id: 'component.actions-icon.list' });
              return (
                <Tooltip title={actionTitle || listTit} key={key}>
                  <OrderedListOutlined
                    onClick={disabled ? () => null : action}
                    disabled={disabled}
                  />
                </Tooltip>
              );
            case 'reload':
              const loadTit = intl.formatMessage({ id: 'component.actions-icon.reload' });
              return (
                <Tooltip title={actionTitle || loadTit} key={key}>
                  <ReloadOutlined onClick={disabled ? () => null : action} disabled={disabled} />
                </Tooltip>
              );
            case 'del':
              const delTit = intl.formatMessage({ id: 'component.actions-icon.del' });
              if (disabled) {
                return (
                  <Tooltip title={actionTitle || delTit} key={key}>
                    <DeleteOutlined disabled />
                  </Tooltip>
                );
              }
              return (
                <Tooltip title={actionTitle || delTit} key={key}>
                  <Popconfirm
                    title={intl.formatMessage({ id: 'component.actions-icon.delete-title' })}
                    onConfirm={action}
                    okText={intl.formatMessage({ id: 'component.actions-icon.delete-text' })}
                    cancelText={intl.formatMessage({ id: 'component.actions-icon.cancel-text' })}
                    placement="topRight"
                  >
                    <DeleteOutlined />
                  </Popconfirm>
                </Tooltip>
              );
            default:
              return null;
          }
        }
        if (React.isValidElement(icon)) {
          const iconProps = actionTitle
            ? {
                onClick: action,
                title: actionTitle,
                disabled,
              }
            : { onClick: action };
          return React.cloneElement(icon, iconProps);
        }
        return icon;
      })}
    </div>
  );
};

export default ActionIcons;
