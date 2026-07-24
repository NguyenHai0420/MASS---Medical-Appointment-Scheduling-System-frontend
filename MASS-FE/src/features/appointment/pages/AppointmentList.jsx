import React, { useCallback, useEffect, useState } from 'react';
import AppointmentHeroSection from '../components/AppointmentHeroSection';
import AppointmentListPosting from './AppointmentListPosting';
import WalkInModal from '../components/WalkInModal';
import PaymentModal from '@/features/payment/components/PaymentModal';
import AppointmentDetailModal from '../components/AppointmentDetailModal';
import appointmentService from '../services/appointment.service';
import useAppointmentFilter from '../hooks/useAppointmentFilter';
import '@/styles/appointment.css';

const AppointmentListPage = () => {

  const { filters, dispatch } = useAppointmentFilter();

  const [keyword, setKeyword] = useState('');

  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [showWalkIn, setShowWalkIn] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const [specialties, setSpecialties] = useState([]);

  useEffect(() => {
    appointmentService.getAllSpecialties()
      .then(res => setSpecialties(res.data || []))
      .catch(console.error);
  }, []);

  const fetchAppointments = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {
        page: filters.page,
        size: filters.size,
      };

      if (filters.date) params.date = filters.date;
      if (filters.specialtyId !== 'ALL') params.specialtyId = filters.specialtyId;
      if (filters.status !== 'ALL') params.status = filters.status;

      const res = await appointmentService.getAll(params);
      const data = res.data;

      setAppointments(data.content || []);
      setTotalElements(data.totalElements || 0);
      setTotalPages(data.totalPages || 0);
    } catch (error) {
      console.error('Lỗi tải danh sách lịch hẹn:', error);
      setAppointments([]);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const visibleAppointments = keyword.trim()
    ? appointments.filter((a) => {
      const q = keyword.trim().toLowerCase();
      return (
        a.patientName?.toLowerCase().includes(q) ||
        a.patientPhone?.toLowerCase().includes(q) ||
        a.patientEmail?.toLowerCase().includes(q) ||
        a.doctorName?.toLowerCase().includes(q) ||
        String(a.appointmentId).includes(q)
      );
    })
    : appointments;

  const handleViewDetail = (appointment) => {
    setSelectedAppointment(appointment);
    setShowDetail(true);
  };

  const handlePayment = (appointment) => {
    setSelectedAppointment(appointment);
    setShowPayment(true);
  };

  const handleCheckIn = async (appointment) => {
    try {
      await appointmentService.checkIn(appointment.appointmentId);
      fetchAppointments();
    } catch (err) {
      console.error('Check-in thất bại:', err);
    }
  };

  const handleCancel = (appointment) => {
    setSelectedAppointment(appointment);
    setShowDetail(true);
  };

  const handleWalkInSuccess = (newAppointment) => {
    console.log('Walk-in tạo thành công:', newAppointment);
    fetchAppointments();
    setShowWalkIn(false);
    setSelectedAppointment(newAppointment);
    setShowPayment(true);
  };

  const handlePageChange = (newPage) => {
    dispatch({ type: 'SET_PAGE', payload: newPage });
  };

  return (
    <main className="appt-page">
      {}
      <AppointmentHeroSection
        keyword={keyword}
        setKeyword={setKeyword}
        dispatch={dispatch}
        filters={filters}
        specialties={specialties}
      />

      {}
      <AppointmentListPosting
        appointments={visibleAppointments}
        isLoading={isLoading}
        totalElements={totalElements}
        currentPage={filters.page}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        onWalkInClick={() => setShowWalkIn(true)}
        onViewDetail={handleViewDetail}
        onCheckIn={handleCheckIn}
        onPayment={handlePayment}
        onCancel={handleCancel}
      />

      {}
      <WalkInModal
        show={showWalkIn}
        onHide={() => setShowWalkIn(false)}
        onSuccess={handleWalkInSuccess}
      />

      {}
      <PaymentModal
        show={showPayment}
        onHide={() => { setShowPayment(false); setSelectedAppointment(null); }}
        appointment={selectedAppointment}
        onPaymentSuccess={fetchAppointments}
      />

      {}
      <AppointmentDetailModal
        show={showDetail}
        onHide={() => { setShowDetail(false); setSelectedAppointment(null); }}
        appointmentId={selectedAppointment?.appointmentId}
        onCheckIn={fetchAppointments}
        onCancel={fetchAppointments}
      />
    </main>
  );
};

export default AppointmentListPage;
