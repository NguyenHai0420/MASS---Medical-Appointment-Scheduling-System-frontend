import React from 'react';
import { Calendar2, Clock, Person, HeartPulse } from 'react-bootstrap-icons';

const statusConfig = {
  PENDING_PAYMENT: {
    label: 'Chờ thanh toán',
    className: 'appt-badge-pending',
    borderColor: '#f59e0b',
  },
  WAITING_CHECK_IN: {
    label: 'Chờ check-in',
    className: 'appt-badge-waiting-checkin',
    borderColor: '#1d4ed8',
  },
  WAITING_FOR_TURN: {
    label: 'Chờ đến lượt',
    className: 'appt-badge-waiting-turn',
    borderColor: '#6d28d9',
  },
  COMPLETED: {
    label: 'Hoàn thành',
    className: 'appt-badge-completed',
    borderColor: '#15803d',
  },
  CANCELLED: {
    label: 'Đã hủy',
    className: 'appt-badge-cancelled',
    borderColor: '#94a3b8',
  },
  NO_SHOW: {
    label: 'Không đến khám',
    className: 'appt-badge-noshow',
    borderColor: '#dc2626',
  },
};

const paymentConfig = {
  COMPLETED: { label: 'Đã thanh toán', className: 'appt-badge-paid' },
  PENDING: { label: 'Chờ thanh toán', className: 'appt-badge-unpaid' },
  FAILED: { label: 'Thanh toán thất bại', className: 'appt-badge-noshow' },
};

const defaultStatus = { label: 'Không xác định', className: 'appt-badge-cancelled', borderColor: '#94a3b8' };
const defaultPayment = { label: 'Chưa thanh toán', className: 'appt-badge-unpaid' };

const AppointmentCard = ({ appointment, onViewDetail, onCheckIn, onPayment, onCancel }) => {
  const status = statusConfig[appointment.appointmentStatus] || defaultStatus;
  const payment = appointment.paymentStatus
    ? paymentConfig[appointment.paymentStatus] || defaultPayment
    : defaultPayment;

  const isWalkIn = appointment.appointmentType === 'WALK_IN';

  const renderActions = () => {
    const { appointmentStatus } = appointment;

    return (
      <div className="appt-card-actions">
        <button className="appt-btn-detail" onClick={() => onViewDetail?.(appointment)}>
          Xem chi tiết
        </button>

        {appointmentStatus === 'PENDING_PAYMENT' && (
          <button className="appt-btn-payment" onClick={() => onPayment?.(appointment)}>
            💳 Thanh toán
          </button>
        )}

        {appointmentStatus === 'WAITING_CHECK_IN' && (
          <button className="appt-btn-checkin" onClick={() => onCheckIn?.(appointment)}>
            ✓ Check-in
          </button>
        )}

        {appointmentStatus === 'PENDING_PAYMENT' && (
          <button className="appt-btn-cancel" onClick={() => onCancel?.(appointment)}>
            Hủy
          </button>
        )}
      </div>
    );
  };

  return (
    <div
      className="appt-card"
      style={{ borderLeft: `5px solid ${status.borderColor}` }}
    >
      {}
      <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
        <div>
          <div className="appt-card-id">#{appointment.appointmentId}</div>
          <div className="appt-card-patient">{appointment.patientName}</div>
          <div className="appt-card-phone">{appointment.patientPhone}</div>
        </div>
        <span className={`appt-badge ${status.className}`}>{status.label}</span>
      </div>

      {}
      <div className="appt-card-meta">
        <span>
          <HeartPulse size={13} className="me-1 text-primary" />
          <strong>Chuyên khoa:</strong> {appointment.specialtyName}
        </span>
        <span>
          <Person size={13} className="me-1 text-secondary" />
          <strong>Bác sĩ:</strong> {appointment.doctorName}
        </span>
        <span>
          <Calendar2 size={13} className="me-1 text-secondary" />
          <strong>Ngày khám:</strong> {appointment.appointmentDate}
        </span>
        <span>
          <Clock size={13} className="me-1 text-secondary" />
          <strong>Giờ khám:</strong> {appointment.startTime}
          {appointment.queueNumber && ` – STT: ${appointment.queueNumber}`}
        </span>
      </div>

      {}
      <div className="d-flex flex-wrap gap-2 mb-2">
        <span className={`appt-badge ${payment.className}`}>{payment.label}</span>
        <span className={`appt-badge ${isWalkIn ? 'appt-badge-walkin' : 'appt-badge-online'}`}>
          {isWalkIn ? 'Walk-in' : 'Online'}
        </span>
      </div>

      {}
      {renderActions()}
    </div>
  );
};

export default AppointmentCard;
