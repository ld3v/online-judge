import CardWrapForm from '@/components/CardWrapForm';
import { ROLE } from '@/utils/constants';
import { Col, Form, Input, Row, Select } from 'antd';
import React from 'react';
import { connect, useIntl } from 'umi';

interface IAccountFormPage {
  onSubmit: (formData: any) => void;
  defaultValues?: Record<string, any>;
  cardTitle: string;
  className?: string;
  preLoading?: boolean;
  submitting?: boolean;
  roleEditable?: boolean;
  submitTitle?: string | React.ReactNode;
  // Connect props
  defaultLateRule?: string;
  searchingProblems?: boolean;
  searchingAccounts?: boolean;
  problemStateDic?: Record<string, any>;
  accountStateDic?: Record<string, any>;
  dispatch?: any;
}

const AccountFormPage: React.FC<IAccountFormPage> = ({
  cardTitle,
  className,
  onSubmit,
  preLoading,
  submitting,
  defaultValues,
  submitTitle,
  roleEditable,
}) => {
  const intl = useIntl();
  const [form] = Form.useForm();

  const initialValues = {
    ...(defaultValues || {}),
  };

  const handleSubmit = ({ username, ...data }: any) => {
    const dataToUpdate = {
      ...data,
    };
    onSubmit(dataToUpdate);
  };

  return (
    <CardWrapForm
      cardTitle={cardTitle}
      form={form}
      classNameWrapper={className || ''}
      initialValues={initialValues}
      onFinish={handleSubmit}
      loadingPreRender={preLoading}
      submitting={submitting}
      submitTitle={submitTitle}
    >
      <Row gutter={20}>
        <Col span={12}>
          <Form.Item
            name="username"
            label={intl.formatMessage({ id: 'account.form.username.label' })}
            rules={[
              {
                required: true,
                message: intl.formatMessage({ id: 'exception.account.form.username.required' }),
              },
            ]}
          >
            <Input
              placeholder={intl.formatMessage({ id: 'account.form.username.placeholder' })}
              disabled
            />
          </Form.Item>
          {roleEditable !== undefined && (
            <Form.Item name="role" label={intl.formatMessage({ id: 'account.form.role.label' })}>
              <Select
                options={ROLE.map((role) => ({
                  value: role,
                  label: intl.formatMessage({ id: `account.roles.${role}` }),
                }))}
                disabled={!roleEditable}
              />
            </Form.Item>
          )}
        </Col>
        <Col span={12}>
          <Form.Item
            name="displayName"
            label={intl.formatMessage({ id: 'account.form.display-name.label' })}
            rules={[
              {
                required: true,
                message: intl.formatMessage({ id: 'exception.account.form.display-name.required' }),
              },
            ]}
          >
            <Input
              placeholder={intl.formatMessage({ id: 'account.form.display-name.placeholder' })}
            />
          </Form.Item>
          <Form.Item
            name="email"
            label={intl.formatMessage({ id: 'account.form.email.label' })}
            rules={[
              {
                required: true,
                message: intl.formatMessage({ id: 'exception.account.form.email.required' }),
              },
            ]}
          >
            <Input placeholder={intl.formatMessage({ id: 'account.form.email.placeholder' })} />
          </Form.Item>
        </Col>
      </Row>
    </CardWrapForm>
  );
};

export default connect(({ account, loading }: any) => ({
  currentLoading: loading.effects['account/getById'],
  accountStateDic: account.dic,
}))(AccountFormPage);
