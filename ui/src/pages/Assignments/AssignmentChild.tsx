import { Skeleton } from 'antd';
import { connect, Redirect, useHistory, useParams } from 'umi';
import MyAssignments from './MyAssignments';

interface IAssignmentChild {
  className?: string;
  noSelectMessage: React.ReactNode;
  notFoundMessage: React.ReactNode;
  childName: 'problems' | 'submissions' | 'score-boards';
  children: React.ReactNode;
  childLoading?: boolean;
  dispatch: any;
  selected?: any;
  currentAccount?: any;
}

const AssignmentChild: React.FC<IAssignmentChild> = ({
  selected,
  noSelectMessage,
  notFoundMessage,
  currentAccount,
  className,
  children,
  childName,
  childLoading,
}) => {
  const history = useHistory();
  const { assignmentId: id }: any = useParams();

  const handleSelectAssignment = (id: string) => {
    history.replace(`/${childName}/${id}`);
  };

  if (!id && currentAccount.selectedAssignment) {
    return <Redirect to={`/${childName}/${currentAccount.selectedAssignment}`} />;
  }

  if (!id && !currentAccount.selectedAssignment) {
    return (
      <div className={className || ''}>
        {noSelectMessage}
        <MyAssignments onView={(id) => handleSelectAssignment(id)} />
      </div>
    );
  }

  if (id && childLoading) {
    return (
      <div className={className || ''}>
        <Skeleton active />
      </div>
    );
  }

  if (id && !selected) {
    <div className={className || ''}>
      {notFoundMessage}
      <MyAssignments onView={(id) => handleSelectAssignment(id)} />
    </div>;
  }

  return <div className={className || ''}>{children}</div>;
};

export default connect(({ assignments, problem, account, loading }: any) => {
  const { participants, problems, ...selectedInfo } = assignments.selected
    ? assignments.dic[assignments.selected]
    : { participants: [], problems: [] };
  return {
    currentAccount: account.dic[account.current],
    selected: assignments.selected
      ? {
          ...selectedInfo,
          problems: (problems || []).map((id: string) => problem.dic[id]),
          participants: (participants || []).map((id: string) => account.dic[id]),
        }
      : undefined,
  };
})(AssignmentChild);
