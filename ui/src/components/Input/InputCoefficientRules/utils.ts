import { ICoefficientRule } from "@/types/assignment";
import { Moment } from "moment";

type TCoefficientRuleError = {
  msg: string;
  value?: {
    i: number;
    e?: string;
  }
}
export const checkCoefficientRules = (
  rules: ICoefficientRule[],
  finishTime: Moment | undefined,
  extraTime: number,
): {
  normal: TCoefficientRuleError[];
  byRule: TCoefficientRuleError[];
  important: TCoefficientRuleError[];
} => {
  const normal: TCoefficientRuleError[] = [];
  const byRule: TCoefficientRuleError[] = [];
  const important: TCoefficientRuleError[] = [];

  const normalPush = (d: TCoefficientRuleError) => !normal.find(c => c.msg === d.msg) ? normal.push(d) : null;

  if (!Array.isArray(rules)) {
    important.push({ msg: 'exception.assignment.form.coefficient-rules.invalid' });
    return { normal, byRule, important };
  }
  if (rules.length === 0) {
    return { normal, byRule, important };
  }
  // Assignment not finish, or not has extra-time.
  if (!finishTime || !extraTime) {
    normalPush({ msg: 'exception.assignment.form.coefficient-rules.no-effect' });
  }
  // Check rules
  rules.forEach((rule, i) => {
    if (!rule) {
      byRule.push({ msg: 'exception.assignment.form.coefficient-rule.invalid', value: { i, e: 'format' } });
      return;
    }

    if (Array.isArray(rule.DELAY_RANGE) && rule.DELAY_RANGE.length === 2) {
      const delayRangeInit = [rule.DELAY_RANGE?.[0] || 0, rule.DELAY_RANGE?.[1] || 0];

      if (delayRangeInit[1] === 0 || delayRangeInit[1] <= delayRangeInit[0] || delayRangeInit[0] < 0 || delayRangeInit[1] > 1440) {
        byRule.push({ msg: 'exception.assignment.form.coefficient-rule.time-range.invalid', value: { i, e: 'logic' } });
      }
    } else {
      byRule.push({ msg: 'exception.assignment.form.coefficient-rule.time-range.invalid', value: { i, e: 'format' } });
    }
    // Check base-mins
    if (rule.BASE_MINS && rule.BASE_MINS < 0) {
      byRule.push({ msg: 'exception.assignment.form.coefficient-rule.base-mins.invalid', value: { i, e: 'format' } });
    } else if ((rule.BASE_MINS || 0) + rule.DELAY_RANGE[1] > extraTime) {
      normalPush({ msg: 'exception.assignment.form.coefficient-rule.time-range.smaller-extra', value: { i } });
    }

    // Check coefficient value (const & variant-over-time)
    if (rule.CONST === undefined) {
      // CONST has not value -> Check VOT
      if (rule.VARIANT_OVER_TIME === undefined) {
        // Both is undefined -> empty
        byRule.push({ msg: 'exception.assignment.form.coefficient-rule.coefficient-value.empty', value: { i, e: 'empty' } });
      } else if (
        rule.VARIANT_OVER_TIME[0] < 0 ||
        rule.VARIANT_OVER_TIME[1] > 100 ||
        rule.VARIANT_OVER_TIME[0] >= rule.VARIANT_OVER_TIME[1]
      ) {
        // VOT has value -> Check out of range for VOT.
        byRule.push({ msg: 'exception.assignment.form.coefficient-rule.coefficient-value.vot-invalid', value: { i, e: 'vot_out-of-range' } });
      }
    } else {
      // CONST has value -> Check CONST
      if (rule.VARIANT_OVER_TIME !== undefined) {
        // Both have values -> conflict
        byRule.push({ msg: 'exception.assignment.form.coefficient-rule.coefficient-value.conflict', value: { i, e: 'conflict-values' } });
      } else if (rule.CONST < 0 || rule.CONST > 100) {
        // CONST has value -> Check out of range for CONST
        byRule.push({ msg: 'exception.assignment.form.coefficient-rule.coefficient-value.const-invalid', value: { i, e: 'const_out-of-range' } });
      }
    }
  });
  return {
    normal,
    byRule,
    important,
  };
}

// export const checkCoefficientRules = (
//   rules?: ICoefficientRule[],
//   finishTime?: Moment,
//   extraTime?: number
// ): {
//   common: any[]; // string[]
//   rules: {
//     i: number;
//     msg: any; // string
//   }[]
// } => {
//   const errors = !Array.isArray(rules)
//     ? []
//     : rules.map((rule) => checkCoefficientRule(rule, finishTime, extraTime));
//   const commonErrors = errors.filter((r) => r && COMMON_ERROR.includes(r)).filter(isString);
//   const ruleErrors = errors.map((r, i) => r && !COMMON_ERROR.includes(r) ? { i, msg: r } : undefined).filter(isRuleErr);
//   return {
//     common: [...new Set(commonErrors)],
//     rules: ruleErrors,
//   }
// }

export const isDiffRules = (rules0: ICoefficientRule[], rules1: ICoefficientRule[]): boolean => {
  // Check length
  if (!Array.isArray(rules0) || !Array.isArray(rules1) || rules0.length !== rules1.length) return true;
  const length = rules0.length;
  for (let index = 0; index < length; index += 1) {
    const rule0 = rules0[index];
    const rule1 = rules1[index];

    if (
      rule0.BASE_MINS !== rule1.BASE_MINS ||
      rule0.CONST !== rule1.CONST ||
      (
        rule0.DELAY_RANGE[0] !== rule1.DELAY_RANGE[0] ||
        rule0.DELAY_RANGE[1] !== rule1.DELAY_RANGE[1]
      ) ||
      (
        Array.isArray(rule0.VARIANT_OVER_TIME) &&
        Array.isArray(rule1.VARIANT_OVER_TIME) &&
        (
          rule0.VARIANT_OVER_TIME[0] !== rule1.VARIANT_OVER_TIME[0] ||
          rule0.VARIANT_OVER_TIME[1] !== rule1.VARIANT_OVER_TIME[1]
        )
      )
    ) {
      return true;
    };
  }

  return false;
}
