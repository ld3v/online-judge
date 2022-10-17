import CardWrapForm from '@/components/CardWrapForm';
import {
  InputSearchSelect,
  LabelWithDesc,
  TableSearchSelect,
  TimeRangeInput,
} from '@/components/CardWrapForm/Input';
import InputCoefficientRules from '@/components/Input/InputCoefficientRules';
import InputNumber from '@/components/Input/InputNumber';
import { ICoefficientRule } from '@/types/assignment';
import { SETTING_FIELDS_MAPPING } from '@/utils/constants';
import { sumItems } from '@/utils/funcs';
import { Col, Empty, Form, Input, Row, Switch } from 'antd';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { connect, FormattedHTMLMessage, useIntl } from 'umi';

interface IAssignmentFormPage {
  onSubmit: (formData: any) => void;
  defaultValues?: Record<string, any>;
  cardTitle: string;
  preLoading?: boolean;
  submitting?: boolean;
  // Connect props
  defaultLateRule?: ICoefficientRule[];
  searchingProblems?: boolean;
  searchingAccounts?: boolean;
  problemStateDic?: Record<string, any>;
  accountStateDic?: Record<string, any>;
  dispatch?: any;
}

const AssignmentFormPage: React.FC<IAssignmentFormPage> = ({
  cardTitle,
  onSubmit,
  preLoading,
  submitting,
  defaultValues,
  defaultLateRule,
  searchingAccounts,
  searchingProblems,
  problemStateDic,
  accountStateDic,
  dispatch,
}) => {
  const [withFinish, setWithFinish] = useState<boolean>(
    defaultValues?.time.startTime && defaultValues?.time.finishTime,
  );
  const [currentSearchProblemIds, setCurrentSearchProblemIds] = useState<string[]>([]);
  const [currentSearchAccountIds, setCurrentSearchAccountIds] = useState<string[]>([]);
  const [currentProblemList, setCurrentProblemList] = useState<any[]>(
    defaultValues?.problems || [],
  );
  const [participantSearchDisabled, setParticipantSearchDisabled] = useState<boolean>(true);
  const [form] = Form.useForm();
  const intl = useIntl();

  const initialValues = {
    lateRules: defaultValues?.lateRules ? JSON.parse(defaultValues.lateRules) : [],
    problems: [],
    is_public: true,
    extra_time: 0,
    ...(defaultValues || {}),
  };

  const handleSearchProblem = (keyword?: string, exceptIds?: string[]) => {
    const currentProblemsSelected = form?.getFieldValue(['problems']) || [];
    const except = exceptIds || currentProblemsSelected.map((p: any) => p.id);
    const payload = {
      keyword,
      except,
      page: 1,
      limit: 20,
      callback: (data: any) => {
        if (!data) {
          return;
        }
        setCurrentSearchProblemIds(data.keys);
      },
    };
    dispatch({
      type: 'problem/search',
      payload,
    });
  };
  const handleSearchAccount = (keyword?: string, exceptIds?: string[]) => {
    const currentAccountsSelected = form?.getFieldValue(['participants']) || [];
    const except = exceptIds || currentAccountsSelected.map((p: any) => p.id);
    const payload = {
      keyword,
      except,
      role: 'user',
      page: 1,
      limit: 20,
      callback: (data: any) => {
        if (!data) {
          return;
        }
        setCurrentSearchAccountIds(data.keys);
      },
    };
    dispatch({
      type: 'account/search',
      payload,
    });
  };

  useEffect(() => {
    // init data for problems & participants
    handleSearchProblem();
    handleSearchAccount();
  }, []);

  useEffect(() => {
    if (!form) {
      console.error('Create: `withFinish` changed, but `form` is unavailable!');
      return;
    }
    const timeValue = form.getFieldValue('time');
    if (timeValue) {
      // Default (when init), time is undefined -> not show error;
      // When had value (edit start or finish) -> show error
      form.validateFields(['time']);
    }
  }, [withFinish]);

  const handleAddNewProblem = () => {
    if (!form) {
      console.error('Create: `problem-add`, but `form` is unavailable!');
      return;
    }
    const currentProblems = form.getFieldValue(['problems']) || [];
    setCurrentProblemList(currentProblems);
    // Re-get new problem list
    handleSearchProblem('');
  };
  const handlePublic = (isPublic: boolean) => {
    setParticipantSearchDisabled(isPublic);
    form.setFieldsValue({ is_public: isPublic, participants: [] });
  };
  const handleSubmit = ({
    description,
    time,
    problems,
    participants,
    lateRules,
    ...values
  }: any) => {
    const problemsTransformed = (problems || []).map((p: any, idx: number) => ({
      id: p.id,
      name: p.problemName || `Exercise ${idx}`,
      score: p.score ? Number(p.score) : 0,
    }));
    const participantsIds = (participants || []).map((p: any) => p.id);
    const data = {
      ...values,
      description: description || '',
      late_rule: lateRules,
      start_time: time.startTime ? time.startTime.toDate() : undefined,
      finish_time: time.finishTime ? time.finishTime.toDate() : undefined,
      problems: problemsTransformed,
      participants: participantsIds,
    };
    onSubmit(data);
  };

  const timeLabel = (
    <LabelWithDesc
      label={intl.formatMessage({ id: 'assignment.form.time.label' })}
      extraDescription={
        <>
          {intl.formatMessage({ id: 'assignment.form.time.withFinish' })}
          {': '}
          <Switch
            size="small"
            checked={withFinish}
            onChange={(checked) => setWithFinish(checked)}
          />
        </>
      }
    />
  );
  const participantsLabel = (
    <LabelWithDesc
      label={intl.formatMessage({ id: 'assignment.form.participants.label' })}
      description={<FormattedHTMLMessage id="assignment.form.participants.description" />}
      extraDescription={
        <>
          {intl.formatMessage({ id: 'assignment.form.participants.is-public' })}
          {': '}
          <Switch
            size="small"
            checked={participantSearchDisabled}
            onChange={(checked) => handlePublic(checked)}
          />
        </>
      }
    />
  );
  const problemsLabel = (
    <LabelWithDesc
      label={intl.formatMessage({ id: 'assignment.form.problems.label' })}
      description={
        <FormattedHTMLMessage
          id="assignment.form.problems.description"
          values={{
            count_problems: currentProblemList.length,
            total_score: sumItems('score', ...currentProblemList),
          }}
        />
      }
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
    >
      <Row gutter={20}>
        <Col span={12}>
          <Form.Item
            label={intl.formatMessage({ id: 'assignment.form.name.label' })}
            name="name"
            rules={[
              {
                required: true,
                message: intl.formatMessage({ id: 'exception.assignment.form.name.no-named' }),
              },
            ]}
          >
            <Input placeholder={intl.formatMessage({ id: 'assignment.form.name.placeholder' })} />
          </Form.Item>
          <Form.Item
            label={intl.formatMessage({ id: 'assignment.form.description.label' })}
            name="description"
          >
            <Input.TextArea
              rows={1}
              autoSize={{ maxRows: 10 }}
              placeholder={intl.formatMessage({ id: 'assignment.form.description.placeholder' })}
            />
          </Form.Item>
          <Form.Item
            name="participants"
            label={participantsLabel}
            rules={[
              () => ({
                validator(_, value) {
                  if ((value || []).length === 0 && !participantSearchDisabled) {
                    return Promise.reject(
                      new Error(
                        intl.formatMessage({
                          id: 'exception.assignment.form.participants.no-selected',
                        }),
                      ),
                    );
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <InputSearchSelect
              searchOptions={{
                optionsData: currentSearchAccountIds.map((id) => accountStateDic?.[id]),
                labelKey: 'displayName',
              }}
              searchEmptyContent={
                <Empty
                  description={intl.formatMessage({
                    id: 'assignment.form.participants.search.no-result',
                  })}
                />
              }
              searchPlaceholder={intl.formatMessage({
                id: 'assignment.form.participants.search.placeholder',
              })}
              onSearch={(keyword) => handleSearchAccount(keyword)}
              searching={searchingAccounts}
              searchDisabled={participantSearchDisabled}
              onAdd={() => handleSearchAccount()}
              onDelete={() => handleSearchAccount()}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            className={`inp-labelDesc ${withFinish ? 'inp-group' : ''}`}
            label={timeLabel}
            name="time"
            dependencies={['time.startTime', 'time.finishTime']}
            rules={[
              ({ getFieldValue }) => ({
                validator() {
                  const startTime = getFieldValue(['time', 'startTime']);
                  const finishTime = getFieldValue(['time', 'finishTime']);
                  if (
                    (!withFinish && startTime) ||
                    (withFinish &&
                      startTime &&
                      finishTime &&
                      moment(finishTime)
                        .startOf('minute')
                        .isAfter(moment(startTime).startOf('minute')))
                  ) {
                    return Promise.resolve();
                  }
                  if (!withFinish && !startTime) {
                    return Promise.reject(
                      new Error(intl.formatMessage({ id: 'exception.time.start.required' })),
                    );
                  }
                  if (withFinish && (!startTime || !finishTime)) {
                    return Promise.reject(
                      new Error(intl.formatMessage({ id: 'exception.time.start-finish.required' })),
                    );
                  }
                  return Promise.reject(
                    new Error(intl.formatMessage({ id: 'exception.time.start-after-finish' })),
                  );
                },
              }),
            ]}
          >
            <TimeRangeInput withFinish={withFinish} />
          </Form.Item>
          <Form.Item
            name="extra_time"
            label={intl.formatMessage({ id: 'assignment.form.extra-time.label' })}
          >
            <InputNumber
              placeholder={intl.formatMessage({ id: 'assignment.form.extra-time.placeholder' })}
            />
          </Form.Item>
        </Col>
      </Row>
      <InputCoefficientRules form={form} defaultRules={defaultLateRule} />
      <Form.Item
        label={problemsLabel}
        name="problems"
        rules={[
          () => ({
            validator(_, value) {
              if ((value || []).length === 0) {
                return Promise.reject(
                  new Error(
                    intl.formatMessage({
                      id: 'exception.assignment.form.problems.no-selected',
                    }),
                  ),
                );
              }
              return Promise.resolve();
            },
          }),
        ]}
      >
        <TableSearchSelect
          columns={[
            {
              title: intl.formatMessage({ id: 'assignment.table.problem-name' }),
              editable: false,
              width: 150,
              dataIndex: 'name',
            },
            {
              title: intl.formatMessage({ id: 'problem.table.name' }),
              width: 150,
              dataIndex: 'problemName',
              renderFormItem: () => (
                <Input placeholder={intl.formatMessage({ id: 'problem.table.name' })} />
              ),
            },
            {
              title: intl.formatMessage({ id: 'problem.table.score' }),
              width: 70,
              dataIndex: 'score',
              renderFormItem: () => (
                <Input
                  type="number"
                  min={0}
                  placeholder={intl.formatMessage({ id: 'problem.table.score' })}
                />
              ),
            },
          ]}
          onAdd={handleAddNewProblem}
          searchOptions={{
            optionsData: currentSearchProblemIds.map((id) => problemStateDic?.[id]),
          }}
          searchEmptyContent={
            <Empty
              description={intl.formatMessage({ id: 'assignment.form.problems.search.no-result' })}
            />
          }
          searchPlaceholder={intl.formatMessage({
            id: 'assignment.form.problems.search.placeholder',
          })}
          onSearch={(keyword) => handleSearchProblem(keyword)}
          searching={searchingProblems}
          onSourceChange={(problems, actions) => {
            if (actions?.isDelete) {
              handleSearchProblem();
            }
            setCurrentProblemList(problems);
          }}
          emptyText={intl.formatMessage({ id: 'assignment.form.problems.no-selected' })}
        />
      </Form.Item>
      <Form.Item name="is_public" hidden>
        <></>
      </Form.Item>
    </CardWrapForm>
  );
};

export default connect(({ settings, account, problem, loading }: any) => ({
  defaultLateRule: settings.dic[SETTING_FIELDS_MAPPING.default_late_rule],
  searchingProblems: loading.effects['problem/search'],
  searchingAccounts: loading.effects['account/search'],
  problemStateDic: problem.dic,
  accountStateDic: account.dic,
}))(AssignmentFormPage);
