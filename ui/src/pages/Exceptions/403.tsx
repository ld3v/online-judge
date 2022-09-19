import type { FC } from 'react';
import { Redirect } from 'umi';

const UnaccessiblePage: FC = () => {
  console.error('[APP] You can not access this page!', window.location.pathname);
  return <Redirect to="/" />
};

export default UnaccessiblePage;
