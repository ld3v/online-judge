import { Button, Form, FormProps, Skeleton } from 'antd';
import { FC } from 'react';
import { useIntl } from 'umi';
import { ErrorBoundary } from '../Boundary';

import styles from './styles.less';

interface ICardWrapForm extends FormProps<any> {
  cardTitle?: React.ReactNode | string;
  cardDescription?: React.ReactNode | string;
  submitting?: boolean;
  footerClassName?: string;
  loadingPreRender?: boolean;
  classNameWrapper?: string;
  submitTitle?: string | React.ReactNode;
  disabledForm?: boolean;
  children: React.ReactNode;
  buttonDanger?: boolean;
}

const CardWrapForm: FC<ICardWrapForm> = ({
  cardTitle,
  cardDescription,
  submitTitle,
  submitting,
  footerClassName,
  children,
  classNameWrapper,
  loadingPreRender,
  disabledForm,
  buttonDanger,
  ...formProps
}) => {
  const intl = useIntl();
  const renderForm = loadingPreRender ? (
    <Skeleton />
  ) : (
    <Form layout="vertical" {...formProps}>
      {children}
      <div className={`${styles.formFooter} ${footerClassName || ''} card-wrap-form-footer`}>
        <Button htmlType="submit" type="primary" loading={!!submitting} danger={buttonDanger}>
          {submitTitle || intl.formatMessage({ id: 'component.form.submit' })}
        </Button>
      </div>
    </Form>
  );

  return (
    <ErrorBoundary>
      <div className={`${styles.CardWrapForm} ${classNameWrapper || ''}`}>
        {cardTitle && (
          <div className={styles.cardHeader}>
            <div className={styles.header}>
              <div className={styles.title}>{cardTitle}</div>
              {cardDescription && <div className={styles.description}>{cardDescription}</div>}
            </div>
          </div>
        )}
        {!disabledForm && (
          <div className={styles.formContent}>
            <ErrorBoundary>{renderForm}</ErrorBoundary>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default CardWrapForm;
