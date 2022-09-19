import { connect, useHistory } from 'umi';
import MyAssignments from './MyAssignments';

const AssignmentPage = () => {
  const history = useHistory();
  return <MyAssignments onView={(id) => history.push(`/problems/${id}`)} />;
};

export default connect()(AssignmentPage);
