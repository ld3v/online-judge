import Card from '@/components/Card';
import CardWrapForm from '@/components/CardWrapForm';
import { Checkbox, Col, Form, Input, notification, Row, Skeleton } from 'antd';
import { connect, FormattedMessage, useIntl } from 'umi';

interface IConfiguration {
  dispatch?: any;
  settings?: any;
  loadSettings?: boolean;
  updateSettings?: boolean;
  className?: string;
}

const Configuration: React.FC<IConfiguration> = ({
  dispatch,
  settings,
  loadSettings,
  updateSettings,
  className,
}) => {
  const intl = useIntl();

  if (Object.keys(settings).length === 0 || loadSettings) {
    return (
      <Card cardTitle={intl.formatMessage({ id: 'settings.form.configuration.title' })}>
        <Skeleton active />
      </Card>
    );
  }

  const handleUpdate = (data: any) => {
    const callback = (res: any) => {
      if (res) {
        notification.success({
          message: intl.formatMessage({ id: 'settings.update-info.success' }),
        });
      }
    };
    dispatch({
      type: 'settings/update',
      payload: {
        data,
        callback,
      },
    });
  };

  return (
    <CardWrapForm
      cardTitle={intl.formatMessage({ id: 'settings.form.configuration.title' })}
      submitting={updateSettings}
      onFinish={handleUpdate}
      initialValues={settings}
      classNameWrapper={className || ''}
    >
      <Row gutter={[20, 20]}>
        <Col span={12}>
          <Form.Item
            name="file_size_limit"
            label={intl.formatMessage({
              id: 'settings.form.configuration.file_size_limit.label',
            })}
            rules={[
              {
                required: true,
                message: intl.formatMessage({
                  id: 'settings.form.configuration.file_size_limit.required',
                }),
              },
            ]}
          >
            <Input
              placeholder={intl.formatMessage({
                id: 'settings.form.configuration.file_size_limit.placeholder',
              })}
            />
          </Form.Item>
          <Form.Item
            name="output_size_limit"
            label={intl.formatMessage({
              id: 'settings.form.configuration.output_size_limit.label',
            })}
            rules={[
              {
                required: true,
                message: intl.formatMessage({
                  id: 'settings.form.configuration.output_size_limit.required',
                }),
              },
            ]}
          >
            <Input
              placeholder={intl.formatMessage({
                id: 'settings.form.configuration.output_size_limit.placeholder',
              })}
            />
          </Form.Item>
          <Form.Item
            name="submit_penalty"
            label={intl.formatMessage({ id: 'settings.form.configuration.submit_penalty.label' })}
            rules={[
              {
                required: true,
                message: intl.formatMessage({
                  id: 'settings.form.configuration.submit_penalty.required',
                }),
              },
            ]}
          >
            <Input
              placeholder={intl.formatMessage({
                id: 'settings.form.configuration.submit_penalty.placeholder',
              })}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="default_late_rule"
            label={intl.formatMessage({
              id: 'settings.form.configuration.default_late_rule.label',
            })}
            rules={[
              {
                required: true,
                message: intl.formatMessage({
                  id: 'settings.form.configuration.default_late_rule.required',
                }),
              },
            ]}
          >
            <Input.TextArea
              autoSize={{ minRows: 9, maxRows: 9 }}
              placeholder={intl.formatMessage({
                id: 'settings.form.configuration.default_late_rule.placeholder',
              })}
            />
          </Form.Item>
          <Form.Item
            name="enable_registration"
            label={intl.formatMessage({
              id: 'settings.form.configuration.enable_registration.label',
            })}
            valuePropName="checked"
          >
            <Checkbox>
              <FormattedMessage id="settings.form.configuration.enable_registration.description" />
            </Checkbox>
          </Form.Item>
        </Col>
      </Row>
    </CardWrapForm>
  );
};

export default connect(({ settings, loading }: any) => ({
  settings: settings.dic,
  loadSettings: loading.effects['settings/getAll'],
  updateSettings: loading.effects['settings/update'],
}))(Configuration);
