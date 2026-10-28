import api from "./main";

export const getUsersApi = async () => {
  const response = await api.get("/users");
  return response.data;
};
