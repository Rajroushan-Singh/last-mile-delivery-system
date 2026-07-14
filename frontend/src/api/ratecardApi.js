import api from "./axios";

export const ratecardApi = {
  list: async () => {
    const response = await api.get("ratecards/");
    return response.data;
  },
  retrieve: async (id) => {
    const response = await api.get(`ratecards/${id}/`);
    return response.data;
  },
  create: async (ratecardData) => {
    const response = await api.post("ratecards/", ratecardData);
    return response.data;
  },
  update: async (id, ratecardData) => {
    const response = await api.put(`ratecards/${id}/`, ratecardData);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`ratecards/${id}/`);
    return response.data;
  },
};
