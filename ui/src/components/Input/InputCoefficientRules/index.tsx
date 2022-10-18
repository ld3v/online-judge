import { ErrorBoundary } from '@/components/Boundary';
import { LabelWithDesc } from '@/components/CardWrapForm/Input';
import { ICoefficientRule } from '@/types/assignment';
import { COEFFICIENT_RULE_FIELD_MAPPING } from '@/utils/constants';
import { Alert, Button, Form, FormInstance, FormItemProps, notification } from 'antd';
import moment from 'moment';
import { FormattedHTMLMessage, FormattedMessage, useIntl } from 'umi';
import CoefficientRuleChecking from './CoefficientRuleChecking';
import CoefficientRuleItem from './CoefficientRuleItem';

import styles from './styles.less';
import { checkCoefficientRules } from './utils';

interface IInputCoefficientRules {
  form: FormInstance;
  defaultRules?: ICoefficientRule[];
  label?: FormItemProps['label'];
  needToVerifyRules?: boolean;
}

/**
 * ### Coefficient rules configure
 *
 * Property **needToVerifyRules** use to verify rules when use in assignment form. (Have value for finish-time, extra-time).
 */
const InputCoefficientRules: React.FC<IInputCoefficientRules> = ({
  label,
  form,
  needToVerifyRules,
}) => {
  const intl = useIntl();

  const inputLabel = label || (
    <LabelWithDesc
      label={intl.formatMessage({ id: 'component.input-coefficient-rule.label' })}
      description={<FormattedHTMLMessage id="component.input-coefficient-rule.description" />}
    />
  );
  return (
    <ErrorBoundary>
      <Form.Item label={inputLabel} className={styles.InputCoefficientRules}>
        <div className={styles.InputCoefficientRulesInput}>
          <Form.List
            name="lateRules"
            rules={[
              {
                validator() {
                  // If not verify -> Finish time is end of day (today).
                  const finishTime = needToVerifyRules
                    ? form.getFieldValue(['time', 'finishTime'])
                    : moment().endOf('day');
                  // If not verify -> Extra time is 30 days
                  const extraTime = needToVerifyRules
                    ? form.getFieldValue('extra_time')
                    : 60 * 24 * 30;
                  const rules = form.getFieldValue('lateRules') || [];

                  const { important: importErrs, byRule: ruleErrs } = checkCoefficientRules(
                    rules,
                    finishTime,
                    Number(extraTime),
                  );
                  if (importErrs.length > 0) {
                    const errorMsg = intl.formatMessage({
                      id: 'exception.component.data-render-error',
                    });
                    notification.error({
                      message: errorMsg,
                    });
                    return Promise.reject([new Error(errorMsg)]);
                  }
                  if (ruleErrs.length > 0) {
                    return Promise.reject([
                      new Error(
                        intl.formatMessage({
                          id: 'exception.assignment.form.coefficient-rules.error-need-fix',
                        }),
                      ),
                    ]);
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            {(fields, { add, remove }, { errors }) => (
              <>
                {fields.map(({ key, name }: any, index: number) => {
                  const ruleVOT = form.getFieldValue([
                    'lateRules',
                    name,
                    COEFFICIENT_RULE_FIELD_MAPPING.variantOverTime,
                  ]);
                  const defaultType =
                    Array.isArray(ruleVOT) && ruleVOT.length === 2 && ruleVOT[0] < ruleVOT[1]
                      ? 'VARIANT_OVER_TIME'
                      : 'CONST';
                  return (
                    <CoefficientRuleItem
                      onRemove={() => remove(index)}
                      onSetField={form.setFieldValue}
                      withLabel={index === 0}
                      parentName={name}
                      defaultType={defaultType}
                      key={key}
                    />
                  );
                })}
                <div className={styles.InputCoefficientRulesActions}>
                  <Button
                    htmlType="button"
                    onClick={() => add({ DELAY_RANGE: [0, 30], BASE_MINS: 0, CONST: 100 })}
                  >
                    <FormattedMessage id="component.input-coefficient-rule.add" />
                  </Button>
                </div>
                {errors.length > 0 && (
                  <Alert
                    showIcon
                    type="error"
                    className={styles.InputCoefficientRulesValidatorWarn}
                    message={intl.formatMessage({
                      id: 'exception.assignment.form.coefficient-rules.error-need-fix',
                    })}
                  />
                )}
              </>
            )}
          </Form.List>
          <Form.Item
            className={styles.InputCoefficientRulesWarning}
            shouldUpdate={(preValue, curValue) => {
              const isDiffFinish =
                !preValue.time ||
                !preValue.time.finishTime ||
                !curValue.time ||
                !curValue.time.finishTime ||
                !!preValue.time.finishTime.diff(curValue.time.finishTime, 'minute');
              const isDiffExtra = Number(preValue.extra_time) !== Number(curValue.extra_time);
              // [NEED UPDATE]
              // When develop, I meet an issue: https://github.com/ant-design/ant-design/issues/35518
              // -> Need to check this issue & update this code to improve performance for this process.
              const isDiffRule = Array.isArray(curValue.lateRules) && curValue.lateRules.length > 0;

              return isDiffExtra || isDiffFinish || isDiffRule;
            }}
          >
            {({ getFieldValue }) => (
              <CoefficientRuleChecking
                onGetFieldValue={getFieldValue}
                needToVerify={needToVerifyRules}
              />
            )}
          </Form.Item>
        </div>
      </Form.Item>
    </ErrorBoundary>
  );
};

export default InputCoefficientRules;
