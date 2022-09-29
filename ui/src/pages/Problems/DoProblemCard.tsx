import DoProblem from '@/components/AssignmentProblems/DoProblem';
import { ErrorBoundary } from '@/components/Boundary';
import Card from '@/components/Card';
import { Form } from 'antd';
import { connect, useIntl } from 'umi';

interface IDoProblem {
  disabled?: boolean;
}

const DoProblemCard: React.FC<IDoProblem> = ({ disabled }) => {
  const [form] = Form.useForm();
  const intl = useIntl();

  const handleSubmit = (values: any) => {
    return;
  };

  return (
    <ErrorBoundary>
      <Card
        cardTitle={intl.formatMessage({ id: 'problem.do-problem.title' })}
        cardDescription={
          disabled ? intl.formatMessage({ id: 'exception.assignment.no-do' }) : undefined
        }
      >
        <DoProblem onFinish={handleSubmit} form={form} notAllowedDo={disabled} />
      </Card>
    </ErrorBoundary>
  );
};

export default connect()(DoProblemCard);
