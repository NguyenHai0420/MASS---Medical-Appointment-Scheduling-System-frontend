import axiosClient from "../../../shared/services/axiosClient";

const adminService = {

  getDashboardStats: async () => {
    const res = await axiosClient.get("/api/statistics/dashboard");
    return res.data;
  },
  getDoctorStats: async () => {
    const res = await axiosClient.get("/api/statistics/doctors");
    return res.data;
  },
  getPatientStats: async () => {
    const res = await axiosClient.get("/api/statistics/patients");
    return res.data;
  },
  getSpecialtyStats: async () => {
    const res = await axiosClient.get("/api/statistics/specialties");
    return res.data;
  },

  getClinicInfo: async () => {
    const res = await axiosClient.get("/api/admin/clinic");
    return res.data;
  },
  createClinicInfo: async (data) => {
    const res = await axiosClient.post("/api/admin/clinic", data);
    return res.data;
  },
  updateClinicInfo: async (id, data) => {
    const res = await axiosClient.put(`/api/admin/clinic/${id}`, data);
    return res.data;
  },

  getAllSpecialties: async () => {
    const res = await axiosClient.get("/api/specialties");
    return res.data;
  },
  createSpecialty: async (data) => {
    const res = await axiosClient.post("/api/specialties", data);
    return res.data;
  },
  updateSpecialty: async (id, data) => {
    const res = await axiosClient.put(`/api/specialties/${id}`, data);
    return res.data;
  },
  deleteSpecialty: async (id) => {
    const res = await axiosClient.delete(`/api/specialties/${id}`);
    return res.data;
  },

  getAllDoctors: async () => {
    const res = await axiosClient.get("/api/admin/doctors");
    return res.data;
  },
  createDoctor: async (data) => {
    const res = await axiosClient.post("/api/admin/doctors", data);
    return res.data;
  },
  updateDoctor: async (id, data) => {
    const res = await axiosClient.put(`/api/admin/doctors/${id}`, data);
    return res.data;
  },
  deleteDoctor: async (id) => {
    const res = await axiosClient.delete(`/api/admin/doctors/${id}`);
    return res.data;
  },

  getAllUsers: async () => {
    const res = await axiosClient.get("/api/admin/users");
    return res.data;
  },
  updateUser: async (id, data) => {
    const res = await axiosClient.put(`/api/admin/users/${id}`, data);
    return res.data;
  },
  deleteUser: async (id) => {
    const res = await axiosClient.delete(`/api/admin/users/${id}`);
    return res.data;
  },
};

export default adminService;
