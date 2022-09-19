import Card from '@/components/Card';
import { TAssignment } from '@/types/assignment';
import React from 'react';
import { connect, FormattedHTMLMessage, FormattedMessage, Redirect, useParams } from 'umi';

import { ROLES } from '@/utils/constants';
import AssignmentProblems from '@/components/AssignmentProblems';

import styles from './styles.less';

interface IProblemList {
  // From dispatch
  currentAccount?: any;
  assignment?: TAssignment;
  assignmentLoading?: boolean;
}

const ProblemList: React.FC<IProblemList> = ({ currentAccount, assignment, assignmentLoading }) => {
  const { assignmentId }: any = useParams();

  if (!assignmentId && currentAccount?.selectedAssignment) {
    return <Redirect to={`/problems/${currentAccount.selectedAssignment}`} />;
  }

  if (!assignmentId && !currentAccount?.selectedAssignment) {
    return (
      <Card className={styles.ProblemList}>
        <FormattedMessage id="problem.my.no-assignment-selected" />
      </Card>
    );
  }

  const assignmentPath =
    currentAccount.role === ROLES.admin ? '/assignments-manage' : '/assignments';

  return (
    <Card
      cardTitle={assignment ? assignment.name : ''}
      cardDescription={
        assignment ? (
          <FormattedHTMLMessage
            id="assignment.change-selected"
            values={{ name: assignment.name, link: assignmentPath }}
          />
        ) : (
          ''
        )
      }
      className={styles.ProblemList}
    >
      <AssignmentProblems assignmentId={assignmentId} />
    </Card>
  );
};

export default connect(({ assignments, account, loading }: any) => {
  const assignmentData = assignments.selected
    ? assignments.dic[assignments.selected]
    : { problems: [] };
  return {
    currentAccount: account.dic[account.current],
    assignment: assignments.selected ? assignmentData : undefined,
    assignmentLoading: loading.effects['assignments/getProblems'],
  };
})(ProblemList);
