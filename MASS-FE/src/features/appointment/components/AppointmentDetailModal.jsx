import React, { useEffect, useState } from 'react';
import { Modal, Row, Col, Badge, Spinner, Alert } from 'react-bootstrap';
import appointmentService from '../services/appointment.service';

const statusLabel = {
  PENDING_PAYMENT: 'Chờ thanh toán',
  WAITING_CHECK_IN: 'Chờ check-in',
  WAITING_FOR_TURN: 'Chờ đến lượt',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
  NO_SHOW: 'Không đến',
};

const statusVariant = {
  PENDING_PAYMENT: 'warning',
  WAITING_CHECK_IN: 'primary',
  WAITING_FOR_TURN: 'info',
  COMPLETED: 'success',
  CANCELLED: 'secondary',
  NO_SHOW: 'danger',
};

const AppointmentDetailModal = ({ show, onHide, appointmentId, onCheckIn, onCancel }) => {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checkingIn, setCheckingIn] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelInput, setShowCancelInput] = useState(false);

  useEffect(() => {
    if (show && appointmentId) {
      fetchDetail();
    }
    return () => {
      if (!show) {
        setDetail(null);
        setError('');
        setShowCancelInput(false);
        setCancelReason('');
      }
    };
  }, [show, appointmentId]);

  const fetchDetail = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await appointmentService.getById(appointmentId);
      setDetail(res.data);
    } catch (err) {
      setError('Không thể tải thông tin lịch hẹn.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    setCheckingIn(true);
    try {
      await appointmentService.checkIn(appointmentId);
      onCheckIn?.();
      onHide();
    } catch (err) {
      const msg = err.response?.data?.message || 'Check-in thất bại.';
      setError(msg);
    } finally {
      setCheckingIn(false);
    }
  };

  const handleCancel = async () => {
    if (!cancelReason.trim()) {
      setError('Vui lòng nhập lý do hủy lịch.');
      return;
    }
    setCancelling(true);
    try {
      await appointmentService.cancel(appointmentId, cancelReason.trim());
      onCancel?.();
      onHide();
    } catch (err) {
      const msg = err.response?.data?.message || 'Hủy lịch thất bại.';
      setError(msg);
    } finally {
      setCancelling(false);
    }
  };

  const InfoRow = ({ label, value }) => (
    <div className="d-flex mb-2">
      <span style={{ width: 160, color: '#64748b', fontSize: 13, flexShrink: 0 }}>{label}</span>
      <span style={{ fontWeight: 600, color: '#0f172a', fontSize: 14 }}>{value || '–'}</span>
    </div>
  );

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton style={{ borderBottom: '1px solid #f1f5f9' }}>
        <Modal.Title className="appt-modal-title">
          📋 Chi tiết lịch hẹn {appointmentId ? `#${appointmentId}` : ''}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-4">
        {loading && (
          <div className="text-center py-5">
            <Spinner animation="border" style={{ color: '#1b6ca8' }} />
          </div>
        )}

        {!loading && error && (
          <Alert variant="danger" style={{ fontSize: 14 }}>
            {error}
          </Alert>
        )}

        {!loading && detail && (
          <>
            <Row className="g-4">
              {}
              <Col md={6}>
                <div
                  className="p-3 rounded-3"
                  style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}
                >
                  <h6 className="fw-bold mb-3" style={{ color: '#0f4c75' }}>
                    👤 Thông tin bệnh nhân
                  </h6>
                  <InfoRow label="Họ tên:" value={detail.patientName} />
                  <InfoRow label="Email:" value={detail.patientEmail} />
                  <InfoRow label="SĐT:" value={detail.patientPhone} />
                  <InfoRow label="Giới tính:" value={detail.patientGender} />
                  <InfoRow label="Ngày sinh:" value={detail.patientDateOfBirth} />
                  <InfoRow label="Địa chỉ:" value={detail.patientAddress} />
                </div>
              </Col>

              {}
              <Col md={6}>
                <div
                  className="p-3 rounded-3"
                  style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}
                >
                  <h6 className="fw-bold mb-3" style={{ color: '#0f4c75' }}>
                    🩺 Thông tin bác sĩ & lịch
                  </h6>
                  <InfoRow label="Bác sĩ:" value={detail.doctorName} />
                  <InfoRow label="Học hàm:" value={detail.doctorDegree} />
                  <InfoRow label="Chuyên môn:" value={detail.doctorExpertise} />
                  <InfoRow label="Chuyên khoa:" value={detail.specialtyName} />
                  <InfoRow label="Ngày khám:" value={detail.appointmentDate} />
                  <InfoRow label="Giờ khám:" value={`${detail.startTime} – ${detail.endTime}`} />
                  <InfoRow label="Số thứ tự:" value={detail.queueNumber} />
                </div>
              </Col>

              {}
              <Col md={12}>
                <div
                  className="p-3 rounded-3"
                  style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}
                >
                  <h6 className="fw-bold mb-3" style={{ color: '#0f4c75' }}>
                    💳 Trạng thái & Thanh toán
                  </h6>
                  <Row>
                    <Col md={6}>
                      <InfoRow label="Loại lịch:" value={detail.appointmentType === 'WALK_IN' ? 'Walk-in tại quầy' : 'Đặt lịch online'} />
                      <div className="d-flex mb-2">
                        <span style={{ width: 160, color: '#64748b', fontSize: 13 }}>Trạng thái:</span>
                        <Badge bg={statusVariant[detail.appointmentStatus] || 'secondary'} className="px-3 py-1">
                          {statusLabel[detail.appointmentStatus] || detail.appointmentStatus}
                        </Badge>
                      </div>
                      <InfoRow label="Lý do khám:" value={detail.reason} />
                      <InfoRow label="Tạo lúc:" value={detail.createdAt?.replace('T', ' ')?.substring(0, 16)} />
                    </Col>
                    <Col md={6}>
                      <InfoRow label="Số tiền:" value={detail.paymentAmount ? `${Number(detail.paymentAmount).toLocaleString('vi-VN')} VND` : null} />
                      <InfoRow label="Phương thức:" value={detail.paymentMethod} />
                      <InfoRow label="Mã giao dịch:" value={detail.transactionId} />
                      <InfoRow label="Ngày thanh toán:" value={detail.paymentDate?.replace('T', ' ')?.substring(0, 16)} />
                      <div className="d-flex mb-2">
                        <span style={{ width: 160, color: '#64748b', fontSize: 13 }}>Đã thanh toán:</span>
                        <Badge bg={detail.paid ? 'success' : 'warning'} className="px-3 py-1">
                          {detail.paid ? 'Đã thanh toán' : 'Chưa thanh toán'}
                        </Badge>
                      </div>
                    </Col>
                  </Row>
                </div>
              </Col>
            </Row>

            {}
            <div className="d-flex flex-wrap gap-2 mt-4 pt-3" style={{ borderTop: '1px solid #f1f5f9' }}>
              {detail.appointmentStatus === 'WAITING_CHECK_IN' && (
                <button
                  className="appt-btn-checkin"
                  onClick={handleCheckIn}
                  disabled={checkingIn}
                >
                  {checkingIn ? 'Đang check-in...' : '✓ Check-in bệnh nhân'}
                </button>
              )}

              {(detail.appointmentStatus === 'PENDING_PAYMENT' || detail.appointmentStatus === 'WAITING_CHECK_IN') && (
                <>
                  {!showCancelInput ? (
                    <button
                      className="appt-btn-cancel"
                      onClick={() => setShowCancelInput(true)}
                    >
                      Hủy lịch
                    </button>
                  ) : (
                    <div className="d-flex gap-2 align-items-center w-100">
                      <input
                        type="text"
                        className="appt-modal-control flex-grow-1"
                        placeholder="Nhập lý do hủy lịch..."
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                      />
                      <button
                        className="appt-btn-cancel"
                        onClick={handleCancel}
                        disabled={cancelling}
                      >
                        {cancelling ? 'Đang hủy...' : 'Xác nhận hủy'}
                      </button>
                      <button
                        className="appt-btn-detail"
                        onClick={() => { setShowCancelInput(false); setCancelReason(''); }}
                      >
                        Bỏ
                      </button>
                    </div>
                  )}
                </>
              )}

              <button className="appt-btn-detail ms-auto" onClick={onHide}>
                Đóng
              </button>
            </div>
          </>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default AppointmentDetailModal;
