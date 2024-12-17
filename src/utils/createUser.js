const createUser = (userData) => {
  return {
    username: userData.username,
    token: userData.access_token,
    role: userData.role,
  };
};

export default createUser;
