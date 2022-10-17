import { ErrorBoundary } from '@/components/Boundary';
import { TCoefficientRuleType } from '@/types/assignment';
import { COEFFICIENT_RULE_FIELD_MAPPING, COEFFICIENT_RULE_TYPES } from '@/utils/constants';
import { ArrowRightOutlined, DeleteFilled } from '@ant-design/icons';
import { Form, Select, SelectProps } from 'antd';
import { FormInstance } from 'antd/es/form/Form';
import { useState } from 'react';
import { useIntl } from 'umi';
import InputNumber from '../InputNumber';
import styles from './styles.less';

interface ICoefficientRuleItem {
  defaultType?: TCoefficientRuleType;
  parentName: string;
  onRemove: () => void;
  onSetField: FormInstance['setFieldValue'];
  withLabel: boolean;
}

// Support functions
const valueWithZero = (main?: number, nonMain?: number): number | undefined => {
  return !main && main !== 0 ? nonMain : main;
};

// Support components
const InputRange = ({
  value,
  onChange,
  defaultValue,
  inpProps,
}: {
  value?: [number, number];
  onChange?: (value: [number, number]) => void;
  defaultValue?: [number, number];
  inpProps?: {
    min?: any;
    max?: any;
  };
}) => {
  const displayValue = [
    valueWithZero(value?.[0], defaultValue?.[0]),
    valueWithZero(value?.[1], defaultValue?.[1]),
  ];
  return (
    <div className={styles.InputRange}>
      <InputNumber
        value={displayValue[0]}
        data-index="0"
        onChange={(v) => onChange?.([valueWithZero(v, displayValue[0]) || 0, displayValue[0] || 0])}
        {...(inpProps?.min || {})}
      />
      <InputNumber
        value={displayValue[1]}
        data-index="1"
        onChange={(v) => onChange?.([displayValue[0] || 0, valueWithZero(v, displayValue[1]) || 0])}
        {...(inpProps?.max || {})}
      />
      <ArrowRightOutlined style={{ fontSize: 12 }} />
    </div>
  );
};

// Main component
const CoefficientRuleItem: React.FC<ICoefficientRuleItem> = ({
  defaultType,
  parentName,
  withLabel,
  onRemove,
  onSetField,
}) => {
  const [ruleType, setRuleType] = useState<TCoefficientRuleType>(defaultType || 'CONST');

  const intl = useIntl();

  const handleChangeType = (type: TCoefficientRuleType) => {
    setRuleType(type);
    const field =
      type === 'CONST'
        ? COEFFICIENT_RULE_FIELD_MAPPING.variantOverTime
        : COEFFICIENT_RULE_FIELD_MAPPING.const;
    onSetField(['lateRules', parentName, field], undefined);
  };

  const ruleTypeOptions: SelectProps['options'] = COEFFICIENT_RULE_TYPES.map((t) => ({
    value: t,
    label: intl.formatMessage({ id: `component.input-coefficient-rule.type.${t}` }),
  }));

  return (
    <ErrorBoundary>
      <div className={styles.CoefficientRuleItem} data-label={withLabel}>
        <div className="coefficientRule-inputs">
          <Form.Item
            label={
              withLabel &&
              intl.formatMessage({ id: 'component.input-coefficient-rule.delay-range' })
            }
            className="coefficientRule-inputRange"
            name={[parentName, COEFFICIENT_RULE_FIELD_MAPPING.delayRange]}
          >
            <InputRange />
          </Form.Item>
          <Form.Item
            label={
              withLabel && intl.formatMessage({ id: 'component.input-coefficient-rule.base-mins' })
            }
            className="coefficientRule-inputBaseMins"
            name={[parentName, COEFFICIENT_RULE_FIELD_MAPPING.baseMins]}
          >
            <InputNumber />
          </Form.Item>
          <Form.Item
            label={withLabel && intl.formatMessage({ id: 'component.input-coefficient-rule.type' })}
            className="coefficientRule-inputType"
          >
            <Select
              options={ruleTypeOptions}
              onChange={(t) => handleChangeType(t)}
              value={ruleType}
            />
          </Form.Item>
          {ruleType === 'CONST' ? (
            <Form.Item
              label={
                withLabel && intl.formatMessage({ id: 'component.input-coefficient-rule.const' })
              }
              className="coefficientRule-inputTypeValue"
              name={[parentName, COEFFICIENT_RULE_FIELD_MAPPING.const]}
            >
              <InputNumber />
            </Form.Item>
          ) : (
            <Form.Item
              label={
                withLabel &&
                intl.formatMessage({
                  id: 'component.input-coefficient-rule.variant-over-time',
                })
              }
              name={[parentName, COEFFICIENT_RULE_FIELD_MAPPING.variantOverTime]}
              className="coefficientRule-inputTypeValue"
            >
              <InputRange />
            </Form.Item>
          )}
        </div>
        <Form.Item label={withLabel && <div>&nbsp;</div>} className="coefficientRule-remove">
          <div className="remove" onClick={() => onRemove()}>
            <DeleteFilled />
          </div>
        </Form.Item>
      </div>
    </ErrorBoundary>
  );
};

export default CoefficientRuleItem;
