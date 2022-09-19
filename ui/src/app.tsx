import { PageLoading } from '@ant-design/pro-layout';
import AppWrapper from './components/AppWrapper';
import UnaccessiblePage from './pages/Exceptions/403';
import type { TAccount } from './types/account';

/** 获取用户信息比较慢的时候会展示一个 loading */
export const initialStateConfig = {
  loading: <PageLoading />,
};

export const getInitialState: () => {
  account?: TAccount;
  loading?: boolean;
  getAuthInfo?: () => Promise<TAccount | undefined>;
} = () => ({
  account: undefined,
  loading: true,
});

export const layout = ({ initialState }: any) => {
  return {
    rightContentRender: () => null,
    disableContentMargin: false,
    footerRender: () => null,
    title: 'UIT Contest',
    // Customize the 403 page
    unAccessible: <UnaccessiblePage />,
    ...initialState?.settings,
    childrenRender: (children: any, props: any) => {
      return <AppWrapper {...props}>{children}</AppWrapper>;
    },
  };
};
