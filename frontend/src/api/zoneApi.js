import api from "./axios";

export const zoneApi = {
  list: async () => {
    const response = await api.get("zones/");
    return response.data;
  },
  retrieve: async (id) => {
    const response = await api.get(`zones/${id}/`);
    return response.data;
  },
  create: async (zoneData) => {
    const response = await api.post("zones/", zoneData);
    return response.data;
  },
  update: async (id, zoneData) => {
    const response = await api.put(`zones/${id}/`, zoneData);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`zones/${id}/`);
    return response.data;
  },
};
