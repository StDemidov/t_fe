const createUser = (userData) => {
  return {
    token: userData.token,
    permissions: userData.user_permissions,
  };
};

export default createUser;
