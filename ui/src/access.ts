/**
 * @see https://umijs.org/zh-CN/plugins/plugin-access
 * */
export default function access(initialState: { account?: any } | undefined) {
  const { account } = initialState ?? {};
  return {
    isAdmin: account && account.role === 'admin',
    isUser: account && account.role === 'user',
  };
}
