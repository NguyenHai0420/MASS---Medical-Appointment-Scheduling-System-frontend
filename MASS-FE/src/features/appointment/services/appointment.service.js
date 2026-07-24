import axiosClient from '@/shared/services/axiosClient';

const appointmentService = {

  getAll: async (params = {}) => {
    return axiosClient.get('/api/receptionist/appointments', { params });
  },

  getById: async (appointmentId) => {
    return axiosClient.get(`/api/receptionist/appointments/${appointmentId}`);
  },

  getAvailableSchedules: async (params = {}) => {
    return axiosClient.get('/api/receptionist/appointments/available-scheduels', { params });
  },

  createWalkIn: async (data) => {
    return axiosClient.post('/api/receptionist/appointments/walk-in', data);
  },

  checkIn: async (appointmentId) => {
    return axiosClient.patch(`/api/receptionist/appointments/${appointmentId}/check-in`);
  },

  updateStatus: async (appointmentId, appointmentStatus) => {
    return axiosClient.patch(`/api/receptionist/appointments/${appointmentId}/status`, {
      appointmentStatus,
    });
  },

  cancel: async (appointmentId, cancelReason) => {
    return axiosClient.patch(`/api/receptionist/appointments/${appointmentId}/cancel`, {
      cancelReason,
    });
  },

  getById: async (appointmentId) => {
    return axiosClient.get(`/api/receptionist/appointments/${appointmentId}`);
  },

  update: async (appointmentId, data) => {
    return axiosClient.put(`/api/receptionist/appointments/${appointmentId}`, data);
  },

  getDoctorsBySpecialty: async (specialtyId) => {
    return axiosClient.get('/api/receptionist/appointments/doctors', {
      params: { specialtyId }
    });
  },

  getAllSpecialties: async () => {
    return axiosClient.get('/api/receptionist/appointments/specialties');
  },
};

export const appointmentStatuses = [
  { value: 'ALL', label: 'Tất cả trạng thái' },
  { value: 'PENDING_PAYMENT', label: 'Chờ thanh toán' },
  { value: 'WAITING_CHECK_IN', label: 'Chờ check-in' },
  { value: 'WAITING_FOR_TURN', label: 'Chờ đến lượt' },
  { value: 'COMPLETED', label: 'Hoàn thành' },
  { value: 'CANCELLED', label: 'Đã hủy' },
  { value: 'NO_SHOW', label: 'Không đến khám' },
];

export default appointmentService;
