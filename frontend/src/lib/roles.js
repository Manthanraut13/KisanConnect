// Where each logged-in role lands after login / when hitting a route they can't access
export const roleHome = {
  admin: '/admin',
  logistics: '/driver',
  farmer: '/farmer/dashboard',
  fpo_admin: '/farmer/dashboard',
  consumer: '/marketplace',
  bulk_buyer: '/marketplace',
};

export const getRoleHome = (role) => roleHome[role] || '/';