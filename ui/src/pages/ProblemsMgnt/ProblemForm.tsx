import CardWrapForm from '@/components/CardWrapForm';
import {
  InputMarkdown,
  InputsNested,
  InputUpload,
  LabelWithDesc,
  TagSelection,
} from '@/components/CardWrapForm/Input';
import { Col, Form, Input, Row } from 'antd';
import { useEffect } from 'react';
import { connect, FormattedHTMLMessage, useIntl } from 'umi';

import styles from './styles.less';

interface IProblemForm {
  onSubmit: (formData: any) => void;
  defaultValues?: Record<string, any>;
  cardTitle: string;
  preLoading?: boolean;
  submitting?: boolean;
  // Connect props
  langs?: any[];
  dispatch?: any;
}

const ProblemForm: React.FC<IProblemForm> = ({
  cardTitle,
  defaultValues,
  onSubmit,
  preLoading,
  submitting,
  langs,
  dispatch,
}) => {
  const intl = useIntl();
  const [form] = Form.useForm();

  useEffect(() => {
    dispatch({ type: 'language/get' });
  }, []);

  const handleSubmit = ({ diff_command, languages, ...problemInfo }: any) => {
    const languagesTransformed = languages.map((lang: any) => ({
      id: lang.id,
      time_limit: lang.timeLimit,
      memory_limit: lang.memoryLimit,
    }));
    const data = {
      languages: languagesTransformed,
      diff_cmd: diff_command?.command || '',
      diff_arg: diff_command?.args || '',
      ...problemInfo,
    };
    onSubmit(data);
  };

  const initialValues = {
    diff_command: {
      command: 'diff',
    },
    ...defaultValues,
  };
  const langsOptions =
    langs?.map((lang) => ({
      id: lang.id,
      name: lang.name,
      defaultValues: {
        timeLimit: lang.default_time_limit,
        memoryLimit: lang.default_memory_limit,
      },
    })) || [];

  const languagesLabel = (
    <LabelWithDesc
      label={intl.formatMessage({ id: 'problem.form.languages.label' })}
      description={<FormattedHTMLMessage id="problem.form.languages.description" />}
    />
  );
  const testFolderLabel = (
    <LabelWithDesc
      label={intl.formatMessage({ id: 'problem.form.test-folder.label' })}
      description={<FormattedHTMLMessage id="problem.form.test-folder.description" />}
    />
  );
  return (
    <CardWrapForm
      cardTitle={cardTitle}
      form={form}
      initialValues={initialValues}
      onFinish={handleSubmit}
      loadingPreRender={preLoading}
      submitting={submitting}
      className={styles.problemForm}
    >
      <Row gutter={20}>
        <Col span={12}>
          <Form.Item
            name="name"
            label={intl.formatMessage({ id: 'problem.form.name.label' })}
            rules={[
              {
                required: true,
                message: intl.formatMessage({ id: 'exception.problem.form.name.required' }),
              },
            ]}
          >
            <Input placeholder={intl.formatMessage({ id: 'problem.form.name.placeholder' })} />
          </Form.Item>
          <Form.Item
            name="diff_command"
            label={<FormattedHTMLMessage id="problem.form.diff-command.label" />}
            rules={[
              ({ getFieldValue }) => ({
                validator() {
                  const diffCommand = getFieldValue(['diff_command', 'command']);
                  if (diffCommand && diffCommand.trim() !== '') {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error(
                      intl.formatMessage({ id: 'exception.problem.diff-command.required' }),
                    ),
                  );
                },
              }),
            ]}
          >
            <InputsNested
              items={[
                {
                  name: 'command',
                  placeholder: intl.formatMessage({
                    id: 'problem.form.diff-command.command.placeholder',
                  }),
                  key: 'problem-form-diff-command-command',
                },
                {
                  name: 'args',
                  placeholder: intl.formatMessage({
                    id: 'problem.form.diff-command.arguments.placeholder',
                  }),
                  key: 'problem-form-diff-command-arguments',
                },
              ]}
              className={styles.ProblemForm_diffCommand}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="note"
            label={intl.formatMessage({ id: 'problem.form.admin-note.label' })}
          >
            <Input.TextArea
              autoSize={{ maxRows: 10 }}
              placeholder={intl.formatMessage({ id: 'problem.form.admin-note.placeholder' })}
            />
          </Form.Item>
        </Col>
      </Row>
      <Form.Item
        name="content"
        label={intl.formatMessage({ id: 'problem.form.content.label' })}
        rules={[
          {
            required: true,
            message: intl.formatMessage({ id: 'exception.problem.form.content.required' }),
          },
        ]}
      >
        <InputMarkdown />
      </Form.Item>
      <Form.Item name="test_folder" label={testFolderLabel}>
        <InputUpload directory disabled />
      </Form.Item>
      <Form.Item
        name="languages"
        label={languagesLabel}
        rules={[
          () => ({
            validator(_, value) {
              if ((value || []).length === 0) {
                return Promise.reject(
                  new Error(
                    intl.formatMessage({
                      id: 'exception.problem.form.languages.no-selected',
                    }),
                  ),
                );
              }
              return Promise.resolve();
            },
          }),
        ]}
      >
        <TagSelection
          options={langsOptions}
          columns={[
            {
              title: intl.formatMessage({ id: 'language.table.name' }),
              editable: false,
              width: 150,
              fixed: 'left',
              dataIndex: 'name',
            },
            {
              title: intl.formatMessage({ id: 'language.table.time-limit' }),
              width: 200,
              dataIndex: 'timeLimit',
              renderFormItem: (_, { record }) => (
                <Input type="number" min={0} placeholder={record.defaultTimeLimit} />
              ),
            },
            {
              title: intl.formatMessage({ id: 'language.table.memory-limit' }),
              width: 200,
              dataIndex: 'memoryLimit',
              renderFormItem: (_, { record }) => (
                <Input type="number" min={0} placeholder={record.defaultMemoryLimit} />
              ),
            },
          ]}
        />
      </Form.Item>
    </CardWrapForm>
  );
};

export default connect(({ language, loading }: any) => ({
  languageLoading: loading.effects['language/get'],
  langs: Object.values(language.dic),
}))(ProblemForm);
