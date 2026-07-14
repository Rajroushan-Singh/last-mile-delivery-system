import api from "./axios";

export const areaApi = {
  list: async () => {
    const response = await api.get("areas/");
    return response.data;
  },
  retrieve: async (id) => {
    const response = await api.get(`areas/${id}/`);
    return response.data;
  },
  create: async (areaData) => {
    const response = await api.post("areas/", areaData);
    return response.data;
  },
  update: async (id, areaData) => {
    const response = await api.put(`areas/${id}/`, areaData);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`areas/${id}/`);
    return response.data;
  },
};
