import { TAssignment } from '@/types/assignment';
import moment from 'moment';
import { connect, useIntl } from 'umi';
import AssignmentChild from '../Assignments/AssignmentChild';
import DoProblemCard from './DoProblemCard';

import styles from './styles.less';
import ProblemList from './ProblemList';

interface IProblemsPage {
  assignment: TAssignment;
}

const ProblemsPage: React.FC<IProblemsPage> = ({ assignment }) => {
  const intl = useIntl();

  const renderDoProblem = () => {
    const now = moment();
    if (assignment) {
      const isAssignmentDisabled =
        moment(assignment.startTime).isAfter(now) ||
        (!!assignment.finishTime &&
          moment(assignment.finishTime).add(assignment.extraTime, 'minutes').isBefore(now));

      return <DoProblemCard disabled={isAssignmentDisabled} />;
    }
    return null;
  };

  return (
    <AssignmentChild
      noSelectMessage={intl.formatMessage({ id: 'problem.my.no-assignment-selected' })}
      notFoundMessage={intl.formatMessage({ id: 'problem.my.assignment-not-found' })}
      childName="problems"
      className={styles.ProblemPage}
    >
      <ProblemList />
      {renderDoProblem()}
    </AssignmentChild>
  );
};

export default connect(({ assignments }: any) => {
  const assignmentData = assignments.selected
    ? assignments.dic[assignments.selected]
    : { problems: [] };
  return {
    assignment: assignments.selected ? assignmentData : undefined,
  };
})(ProblemsPage);
