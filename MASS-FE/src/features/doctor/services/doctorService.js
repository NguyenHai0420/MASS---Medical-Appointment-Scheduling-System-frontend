
import axiosClient from "../../../shared/services/axiosClient";

const doctorService = {

    getMyDoctorProfile: async () => {
        const response = await axiosClient.get("/api/doctors/profile/me");
        return response.data;
    },

    getMyAppointments: async () => {
        const response = await axiosClient.get("/api/doctor/appointments");
        return response.data;
    },

    getMySchedules: async () => {
        const response = await axiosClient.get("/api/doctor/schedules");
        return response.data;
    },

    createSchedule: async (data) => {
        const response = await axiosClient.post("/api/doctor/schedules", data);
        return response.data;
    },

    deleteSchedule: async (id) => {
        await axiosClient.delete(`/api/doctor/schedules/${id}`);
    },

    getMedicalRecord: async (appointmentId) => {
        const response = await axiosClient.get(`/api/medical-records/appointment/${appointmentId}`);
        return response.data;
    },

    createMedicalRecord: async (data) => {
        const response = await axiosClient.post("/api/medical-records", data);
        return response.data;
    },

    updateMedicalRecord: async (id, data) => {
        const response = await axiosClient.put(`/api/medical-records/${id}`, data);
        return response.data;
    },
};

export default doctorService;
