import api from "./axios";

export const authApi = {
  register: async (userData) => {
    const response = await api.post("auth/register/", userData);
    return response.data;
  },
  login: async (credentials) => {
    const response = await api.post("auth/login/", credentials);
    return response.data;
  },
  getUsers: async (params) => {
    const response = await api.get("auth/users/", { params });
    return response.data;
  },
};
