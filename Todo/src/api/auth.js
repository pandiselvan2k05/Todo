
import api from "./main";

export const loginApi = async (formData) => {
  const response = await api.post("/login", formData);
  return response.data;
};

export const verifyApi = async () => {
  const response = await api.get("/verify");
  return response.data;
};

export const logoutApi = async () => {
  const response = await api.post("/logout");
  return response.data;
};
