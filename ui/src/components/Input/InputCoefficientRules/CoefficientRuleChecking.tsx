import { ICoefficientRule } from '@/types/assignment';
import { Alert, FormInstance } from 'antd';
import { FormattedHTMLMessage } from 'umi';
import { checkCoefficientRules } from './utils';

interface ICoefficientRuleChecking {
  value?: ICoefficientRule[];
  onGetFieldValue: FormInstance['getFieldValue'];
}

const CoefficientRuleChecking: React.FC<ICoefficientRuleChecking> = ({ onGetFieldValue }) => {
  const finishTime = onGetFieldValue(['time', 'finishTime']);
  const extraTime = onGetFieldValue('extra_time');
  const rules = onGetFieldValue('lateRules');

  const {
    important: mainErrs,
    normal: normalErrs,
    byRule: ruleErrs,
  } = checkCoefficientRules(rules, finishTime, Number(extraTime));

  const importErrorsRendered = mainErrs.map(({ msg, value }) => (
    <div key={`import_err#${value?.i || '--'}#${msg}`} className="warn-item import">
      <FormattedHTMLMessage id={msg} values={value} />
    </div>
  ));
  const commonErrorsRendered = normalErrs.map(({ msg, value }) => (
    <div key={`common_err#${value?.i || '--'}#${msg}`} className="warn-item common">
      <FormattedHTMLMessage id={msg} values={value} />
    </div>
  ));
  const ruleErrorsRendered = ruleErrs.map(({ msg, value }, index) => (
    <div key={`rule_err#${value?.i || '--'}#${msg}`} className="warn-item normal">
      <b>Rule#{(value?.i || index) + 1}</b>: <FormattedHTMLMessage id={msg} values={value} />
    </div>
  ));
  if (importErrorsRendered.length === 0 && normalErrs.length === 0 && ruleErrs.length === 0)
    return null;
  return (
    <Alert
      description={
        <>
          <FormattedHTMLMessage id="assignment.coefficient-rules.warning" />
          {importErrorsRendered.length ? importErrorsRendered : null}
          {commonErrorsRendered.length ? commonErrorsRendered : null}
          {ruleErrorsRendered.length ? ruleErrorsRendered : null}
        </>
      }
      className="warn-items"
    />
  );
};

export default CoefficientRuleChecking;
