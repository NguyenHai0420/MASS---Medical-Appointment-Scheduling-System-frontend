import React from 'react';
import { Container, Row, Col, Spinner } from 'react-bootstrap';
import AppointmentCard from '../components/AppointmentCard';

const AppointmentListPosting = ({
  appointments,
  isLoading,
  totalElements,
  currentPage,
  totalPages,
  onPageChange,
  onWalkInClick,
  onViewDetail,
  onCheckIn,
  onPayment,
  onCancel,
}) => {
  return (
    <Container className="py-5">
      {}
      <div className="appt-section-header">
        <div className="d-flex align-items-center gap-2">
          <h3 className="m-0 fw-bold" style={{ color: '#0f172a' }}>
            Danh sách lịch hẹn
          </h3>
          <span className="appt-count">{totalElements ?? appointments.length} lịch hẹn</span>
        </div>

        <button className="btn text-white appt-add-btn" onClick={onWalkInClick}>
          + Thêm Walk-in
        </button>
      </div>

      {}
      {isLoading && (
        <div className="text-center py-5">
          <Spinner animation="border" style={{ color: '#1b6ca8', width: 48, height: 48 }} />
          <p className="mt-3 text-muted">Đang tải danh sách lịch hẹn...</p>
        </div>
      )}

      {}
      {!isLoading && appointments.length === 0 && (
        <div className="appt-empty">
          <div className="appt-empty-icon">📅</div>
          <h5 className="fw-bold">Không tìm thấy lịch hẹn</h5>
          <p className="text-muted">Hãy thử đổi từ khóa hoặc bộ lọc trạng thái.</p>
          <button className="btn text-white appt-add-btn" onClick={onWalkInClick}>
            + Tạo lịch Walk-in
          </button>
        </div>
      )}

      {}
      {!isLoading && appointments.length > 0 && (
        <Row className="g-4">
          {appointments.map((appointment) => (
            <Col lg={6} key={appointment.appointmentId}>
              <AppointmentCard
                appointment={appointment}
                onViewDetail={onViewDetail}
                onCheckIn={onCheckIn}
                onPayment={onPayment}
                onCancel={onCancel}
              />
            </Col>
          ))}
        </Row>
      )}

      {}
      {!isLoading && totalPages > 1 && (
        <div className="appt-pagination">
          <button
            className="appt-page-btn"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 0}
          >
            ‹
          </button>

          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              className={`appt-page-btn ${currentPage === i ? 'active' : ''}`}
              onClick={() => onPageChange(i)}
            >
              {i + 1}
            </button>
          ))}

          <button
            className="appt-page-btn"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages - 1}
          >
            ›
          </button>
        </div>
      )}
    </Container>
  );
};

export default AppointmentListPosting;
