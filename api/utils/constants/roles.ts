const MAP_ROLE_LEVEL = {
  admin: 0,
  user: 1,
};
const ROLES = ['admin', 'user'];

const isAdmin = (role: string): boolean =>
  role && ROLES.includes(role) && MAP_ROLE_LEVEL[role] <= 0;

const isNeedAdminCheck = (role: string): boolean =>
  role && ROLES.includes(role) && MAP_ROLE_LEVEL[role] > 0;

const rolesCanView = (role: string): string[] =>
  role && ROLES.includes(role)
    ? ROLES.filter((_, i) => i >= MAP_ROLE_LEVEL[role])
    : [];

export {
  MAP_ROLE_LEVEL,
  ROLES,
  isAdmin,
  isNeedAdminCheck,
  rolesCanView,
};
