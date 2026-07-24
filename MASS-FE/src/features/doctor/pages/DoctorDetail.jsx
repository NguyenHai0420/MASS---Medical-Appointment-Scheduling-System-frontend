import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Spinner, Alert, Badge } from 'react-bootstrap';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import patientService from '../../patient/services/patientService';

const DoctorDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isReschedule, oldAppointmentId } = location.state || {};

  const [doctor, setDoctor] = useState(null);
  const getLocalDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [selectedDate, setSelectedDate] = useState(getLocalDate());
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [selectedSlot, setSelectedSlot] = useState(null);

  useEffect(() => {
    fetchDoctorDetail();
  }, [id]);

  useEffect(() => {
    if (doctor) {
      fetchSchedules();
    }
  }, [selectedDate, doctor]);

  const fetchDoctorDetail = async () => {
    try {
      setLoading(true);
      const response = await patientService.getDoctorById(id);
      setDoctor(response.data);
    } catch (err) {
      console.error("Failed to fetch doctor details", err);
      setError("Không thể lấy thông tin chi tiết bác sĩ.");
    } finally {
      setLoading(false);
    }
  };

  const fetchSchedules = async () => {
    try {
      setSlotsLoading(true);
      const response = await patientService.getDoctorSchedules(id, selectedDate);
      setSlots(response.data);
    } catch (err) {
      console.error("Failed to fetch schedules", err);
      setError("Không thể lấy lịch làm việc của bác sĩ.");
      setSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleSlotClick = (slot) => {
    if (slot.isBooked) return;
    navigate('/book-appointment', { state: { doctor, selectedDate, selectedSlot: slot, isReschedule, oldAppointmentId } });
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <Container className="py-4">
      {doctor && (
        <Row>
          <Col md={4} className="mb-4">
            <Card className="shadow-sm">
              <Card.Body className="text-center">
                <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: '100px', height: '100px', fontSize: '36px' }}>
                  {doctor.name.charAt(0)}
                </div>
                <Card.Title as="h3">{doctor.name}</Card.Title>
                <Card.Subtitle className="mb-3 text-muted">{doctor.specialtyName}</Card.Subtitle>
                <Card.Text className="text-start">
                  <strong>Học vị:</strong> {doctor.degree || 'Chưa cập nhật'}<br />
                  <strong>Kinh nghiệm:</strong> {doctor.experience || 'Chưa cập nhật'}<br />
                  <strong>Nơi công tác:</strong> {doctor.clinicName}<br />
                  <strong>Giới thiệu:</strong> {doctor.description || 'Chưa cập nhật'}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>

          <Col md={8}>
            <Card className="shadow-sm mb-4">
              <Card.Header className="bg-white">
                <h4 className="mb-0">Lịch làm việc</h4>
              </Card.Header>
              <Card.Body>
                <Form.Group className="mb-4" style={{ maxWidth: '250px' }}>
                  <Form.Label className="fw-bold">Chọn ngày khám</Form.Label>
                  <Form.Control
                    type="date"
                    value={selectedDate}
                    min={getLocalDate()}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </Form.Group>

                {slotsLoading ? (
                  <div className="text-center py-3">
                    <Spinner animation="border" size="sm" variant="primary" /> Đang tải lịch...
                  </div>
                ) : error ? (
                  <Alert variant="danger">{error}</Alert>
                ) : (
                  <div>
                    <h6 className="mb-3">Các khung giờ trong ngày {selectedDate}</h6>
                    {slots.length === 0 ? (
                      <Alert variant="warning">Bác sĩ không có lịch làm việc trong ngày này.</Alert>
                    ) : (
                      <Row className="g-2 mt-1">
                        {slots.map((slot, index) => {
                          return (
                            <Col xs={6} sm={4} md={3} key={slot.scheduleId || index}>
                              <div
                                className={`appt-slot-card w-100 h-100`}
                                style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                                onClick={() => handleSlotClick({ ...slot, isBooked: false })}
                              >
                                {slot.startTime}
                                <br />
                                <span style={{ fontSize: 11, color: '#64748b' }}>STT {slot.queueNumber}</span>
                                <br />
                                <span style={{ fontSize: 11, color: '#64748b' }}>{doctor.name}</span>
                              </div>
                            </Col>
                          );
                        })}
                      </Row>
                    )}

                    {}
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default DoctorDetail;
