import api from "./axios";

export const agentApi = {
  list: async () => {
    const response = await api.get("agents/");
    return response.data;
  },
  retrieve: async (id) => {
    const response = await api.get(`agents/${id}/`);
    return response.data;
  },
  create: async (agentData) => {
    const response = await api.post("agents/", agentData);
    return response.data;
  },
  update: async (id, agentData) => {
    const response = await api.put(`agents/${id}/`, agentData);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`agents/${id}/`);
    return response.data;
  },
  dashboard: async (id) => {
    const response = await api.get(`agents/${id}/dashboard/`);
    return response.data;
  },
  updateStatus: async (id, statusData) => {
    const response = await api.patch(`agents/${id}/update_status/`, statusData);
    return response.data;
  },
  getAssignedOrders: async (id) => {
    const response = await api.get(`agents/${id}/orders/`);
    return response.data;
  },
};
