import api from "./axios";

export const orderApi = {
  create: async (orderData) => {
    const response = await api.post("orders/", orderData);
    return response.data;
  },
  list: async () => {
    const response = await api.get("orders/");
    return response.data;
  },
  retrieve: async (id) => {
    const response = await api.get(`orders/${id}/`);
    return response.data;
  },
  pickup: async (id) => {
    const response = await api.patch(`orders/${id}/pickup/`);
    return response.data;
  },
  inTransit: async (id) => {
    const response = await api.patch(`orders/${id}/in-transit/`);
    return response.data;
  },
  outForDelivery: async (id) => {
    const response = await api.patch(`orders/${id}/out-for-delivery/`);
    return response.data;
  },
  delivered: async (id) => {
    const response = await api.patch(`orders/${id}/delivered/`);
    return response.data;
  },
};
