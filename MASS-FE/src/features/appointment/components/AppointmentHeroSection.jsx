import React from 'react';
import { Row, Col } from 'react-bootstrap';
import { appointmentStatuses } from '../services/appointment.service';

const AppointmentHeroSection = ({
  keyword,
  setKeyword,
  dispatch,
  specialties,
  filters,
}) => {
  return (
    <section className="appt-hero">
      <div className="container">
        <div className="appt-hero-content">
          <h1 className="fw-bold mb-2">Appointment List</h1>
          <p className="text-white-50 mb-4">
            Danh sách lịch hẹn bệnh nhân – tìm kiếm, lọc trạng thái và theo dõi thanh toán.
          </p>

          {}
          <div className="appt-search-box mx-auto mb-4">
            <input
              type="text"
              className="appt-search-input"
              placeholder="Tìm theo tên bệnh nhân, SĐT, bác sĩ..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
            <button className="appt-search-btn">Tìm kiếm</button>
          </div>

          {}
          <Row className="justify-content-center g-2 mx-auto" style={{ maxWidth: 900 }}>
            {}
            <Col xs={12} sm={6} md={3}>
              <input
                type="date"
                className="appt-filter-select w-100"
                value={filters.date}
                onChange={(e) => dispatch({ type: 'SET_DATE', payload: e.target.value })}
                title="Lọc theo ngày khám"
              />
            </Col>

            {}
            <Col xs={12} sm={6} md={3}>
              <select
                className="appt-filter-select w-100"
                value={filters.specialtyId}
                onChange={(e) => dispatch({ type: 'SET_SPECIALTY', payload: e.target.value })}
              >
                <option value="ALL">Tất cả chuyên khoa</option>
                {specialties.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </Col>

            {}
            <Col xs={12} sm={6} md={3}>
              <select
                className="appt-filter-select w-100"
                value={filters.status}
                onChange={(e) => dispatch({ type: 'SET_STATUS', payload: e.target.value })}
              >
                {appointmentStatuses.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </Col>

            {}
            <Col xs={12} sm={6} md="auto">
              <button
                className="appt-filter-select fw-semibold"
                style={{ cursor: 'pointer', background: 'rgba(255,255,255,0.22)', width: '100%' }}
                onClick={() => {
                  setKeyword('');
                  dispatch({ type: 'RESET' });
                }}
              >
                ↺ Reset
              </button>
            </Col>
          </Row>
        </div>
      </div>
    </section>
  );
};

export default AppointmentHeroSection;
