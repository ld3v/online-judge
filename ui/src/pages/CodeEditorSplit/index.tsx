import { connect, Location, useLocation } from 'umi';
import styles from './styles.less';
import React, { useEffect, useState } from 'react';
import ProblemView from './ProblemView';
import { TAccountRole } from '@/types/account';
import SolutionView from './SolutionView';
import { TCodeEditorLang } from '@/components/Code/CodeEditor/language';

interface ICodeEditorSplit {
  currentAccountRole: TAccountRole;
  dispatch: any;
}
type TProblemSolvingQueryParams = {
  ass?: string;
  prob?: string;
};
const CodeEditorSplit: React.FC<ICodeEditorSplit> = ({ currentAccountRole, dispatch }) => {
  const location: Location = useLocation();
  const [warnMsg, setWarnMsg] = useState<string | undefined>(undefined);
  const [loadingView, setLoadingView] = useState<boolean>(false);

  const { ass: queryAssignmentId, prob: queryProblemId }: TProblemSolvingQueryParams =
    location.query || {};

  const handleGetData = async () => {
    if (!queryProblemId) {
      return;
    }
    if (!currentAccountRole) {
      setWarnMsg('exception.account.notfound');
      return;
    }
    setLoadingView(true);
    const resGetProblems = queryAssignmentId
      ? await dispatch({
          type: 'assignments/getProblems',
          payload: {
            id: queryAssignmentId,
          },
        })
      : undefined;
    if (resGetProblems) {
      // Handle when error
      if (resGetProblems.isError) {
        setWarnMsg(`exception.${resGetProblems.messageId}`);
        setLoadingView(false);
        return;
      }
      // Handle when success but problemId not included in problemIds
      if (
        Array.isArray(resGetProblems.problemIds) &&
        !resGetProblems.problemIds.includes(queryProblemId)
      ) {
        setWarnMsg('exception.problem-solving.problem-not-in-assignment');
        setLoadingView(false);
        return;
      }
    }
    // Handle get problem data when current account is `admin` & get problem-list success.
    const resGetProblemData =
      currentAccountRole === 'admin' && resGetProblems && Array.isArray(resGetProblems.problemIds)
        ? await dispatch({
            type: 'problem/getById',
            payload: { id: queryProblemId },
          })
        : undefined;
    if (resGetProblemData) {
      // Get problem-by-id => Error
      if (resGetProblemData.isError) {
        setWarnMsg(`exception.${resGetProblemData.messageId}`);
        setLoadingView(false);
        return;
      }
    }
    setWarnMsg(undefined);
    setLoadingView(false);
  };
  const handleSubmitCode = async (
    code: string,
    langExt: TCodeEditorLang,
    cleanCode?: () => void,
  ) => {
    dispatch({
      type: 'submission/createWithCode',
      payload: {
        assignmentId: queryAssignmentId,
        problemId: queryProblemId,
        languageExtension: langExt,
        code,
      },
    });
  };

  useEffect(() => {
    handleGetData();
  }, []);

  if (warnMsg || !queryProblemId) {
    return <ProblemView warningMsg={warnMsg || 'exception.problem-solving.no-problem-selected'} />;
  }
  if (loadingView) {
    return <ProblemView loadingMsg="problem-solving.loading-content" />;
  }
  // const problemWidthCSSVariable = {
  //   '--resize-problemView-width': problemViewWidth,
  // } as React.CSSProperties;
  return (
    <div className={styles.CodeEditorSplitWrapper}>
      <ProblemView problemId={queryProblemId} />
      <SolutionView problemId={queryProblemId} onRunCode={handleSubmitCode} />
    </div>
  );
};

export default connect(({ account }: any) => ({
  currentAccountRole: account.dic[account.current]?.role,
}))(CodeEditorSplit);
