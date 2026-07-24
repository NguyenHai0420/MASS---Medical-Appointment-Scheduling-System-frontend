import React, { useEffect, useState } from 'react';
import { Modal, Form, Row, Col, Alert, Spinner } from 'react-bootstrap';
import appointmentService from '../services/appointment.service';

const WalkInModal = ({ show, onHide, onSuccess }) => {
  const [form, setForm] = useState({
    patientName: '',
    patientPhone: '',
    patientEmail: '',
    patientGender: '',
    specialtyId: '',
    appointmentDate: '',
    doctorProfileId: '',
    reason: '',
    dateOfBirth: '',
    address: '',
  });

  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);

  const [specialties, setSpecialties] = useState([]);
  const [loadingSpecialties, setLoadingSpecialties] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchSpecialties() {
      setLoadingSpecialties(true);
      try {
        const res = await appointmentService.getAllSpecialties();
        setSpecialties(res.data || []);
      } catch (err) {
        console.error('Lỗi tải danh sách chuyên khoa:', err);
        setSpecialties([]);
      } finally {
        setLoadingSpecialties(false);
      }
    }
    fetchSpecialties();
  }, []);

  useEffect(() => {
    async function fetchDoctors() {
      if (!form.specialtyId) {
        setDoctors([]);

        setForm(prev => ({ ...prev, doctorProfileId: '' }));
        return;
      }
      setLoadingDoctors(true);
      try {
        const res = await appointmentService.getDoctorsBySpecialty(form.specialtyId);
        setDoctors(res.data || []);
      } catch (err) {
        console.error('Lỗi tải danh sách bác sĩ:', err);
        setDoctors([]);
      } finally {
        setLoadingDoctors(false);
      }
    }
    fetchDoctors();
  }, [form.specialtyId]);

  useEffect(() => {
    async function fetchSlots() {
      if (!form.specialtyId || !form.appointmentDate) {
        setAvailableSlots([]);
        setSelectedSlot(null);
        return;
      }

      setLoadingSlots(true);
      setSelectedSlot(null);

      try {
        const params = {
          specialtyId: form.specialtyId,
          date: form.appointmentDate,
        };
        if (form.doctorProfileId) params.doctorProfileId = form.doctorProfileId;

        const res = await appointmentService.getAvailableSchedules(params);
        setAvailableSlots(res.data || []);
      } catch (err) {
        console.error('Lỗi tải slot:', err);
        setAvailableSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    }

    fetchSlots();
  }, [form.specialtyId, form.appointmentDate, form.doctorProfileId]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.patientName.trim()) return setError('Vui lòng nhập tên bệnh nhân.');
    if (!form.patientPhone.trim()) return setError('Vui lòng nhập số điện thoại.');
    if (!form.patientEmail.trim()) return setError('Vui lòng nhập email bệnh nhân.');
    if (!form.patientGender) return setError('Vui lòng chọn giới tính.');
    if (!form.dateOfBirth) return setError('Vui lòng nhập ngày sinh.');
    if (!form.address.trim()) return setError('Vui lòng nhập địa chỉ.');
    if (!form.specialtyId) return setError('Vui lòng chọn chuyên khoa.');
    if (!form.appointmentDate) return setError('Vui lòng chọn ngày khám.');
    if (!form.reason.trim()) return setError('Vui lòng nhập lý do khám.');

    setSubmitting(true);
    setError('');

    try {
      const payload = {
        patientName: form.patientName.trim(),
        patientPhone: form.patientPhone.trim(),
        patientEmail: form.patientEmail.trim(),
        patientGender: form.patientGender,
        dateOfBirth: form.dateOfBirth,
        address: form.address.trim(),
        specialtyId: Number(form.specialtyId),
        appointmentDate: form.appointmentDate,
        reason: form.reason.trim(),
      };

      if (form.doctorProfileId) {
        payload.doctorProfileId = Number(form.doctorProfileId);
      }

      const res = await appointmentService.createWalkIn(payload);
      onSuccess?.(res.data);
      handleClose();
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Tạo lịch walk-in thất bại. Vui lòng thử lại.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setForm({
      patientName: '',
      patientPhone: '',
      patientEmail: '',
      specialtyId: '',
      appointmentDate: '',
      doctorProfileId: '',
      reason: '',
      dateOfBirth: '',
      address: ''
    });
    setAvailableSlots([]);
    setSelectedSlot(null);
    setDoctors([]);
    setError('');
    onHide();
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton style={{ borderBottom: '1px solid #f1f5f9' }}>
        <Modal.Title className="appt-modal-title">
          🚶 Đặt lịch Walk-in tại quầy
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-4">
        {error && (
          <Alert variant="danger" className="py-2 px-3 mb-3" style={{ fontSize: 14 }}>
            {error}
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <Row className="g-3">
            {}
            <Col md={12}>
              <h6 className="fw-bold mb-0 text-primary">Thông tin Bệnh nhân (Tạo mới / Tìm tự động qua email)</h6>
              <hr className="mt-2 mb-3" />
            </Col>

            <Col md={4}>
              <Form.Group>
                <Form.Label className="appt-modal-label">Họ và tên *</Form.Label>
                <Form.Control
                  className="appt-modal-control"
                  type="text"
                  placeholder="Nhập tên bệnh nhân"
                  value={form.patientName}
                  onChange={(e) => handleChange('patientName', e.target.value)}
                />
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group>
                <Form.Label className="appt-modal-label">Số điện thoại *</Form.Label>
                <Form.Control
                  className="appt-modal-control"
                  type="tel"
                  placeholder="Nhập SĐT"
                  value={form.patientPhone}
                  onChange={(e) => handleChange('patientPhone', e.target.value)}
                />
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group>
                <Form.Label className="appt-modal-label">Email *</Form.Label>
                <Form.Control
                  className="appt-modal-control"
                  type="email"
                  placeholder="Nhập email"
                  value={form.patientEmail}
                  onChange={(e) => handleChange('patientEmail', e.target.value)}
                />
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group>
                <Form.Label className="appt-modal-label">Ngày sinh *</Form.Label>
                <Form.Control
                  className="appt-modal-control"
                  type="date"
                  max={today}
                  value={form.dateOfBirth}
                  onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                />
              </Form.Group>
            </Col>

            <Col md={3}>
              <Form.Group>
                <Form.Label className="appt-modal-label">Giới tính *</Form.Label>
                <Form.Select
                  className="appt-modal-control"
                  value={form.patientGender}
                  onChange={(e) => handleChange('patientGender', e.target.value)}
                >
                  <option value="">Chọn giới tính</option>
                  <option value="Male">Nam</option>
                  <option value="Female">Nữ</option>
                  <option value="Other">Khác</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={5}>
              <Form.Group>
                <Form.Label className="appt-modal-label">Địa chỉ *</Form.Label>
                <Form.Control
                  className="appt-modal-control"
                  type="text"
                  placeholder="Nhập địa chỉ"
                  value={form.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                />
              </Form.Group>
            </Col>

            <Col md={12}>
              <h6 className="fw-bold mb-0 text-primary mt-2">Thông tin Khám bệnh</h6>
              <hr className="mt-2 mb-3" />
            </Col>

            {}
            <Col md={6}>
              <Form.Group>
                <Form.Label className="appt-modal-label">Chuyên khoa *</Form.Label>
                <Form.Select
                  className="appt-modal-control"
                  value={form.specialtyId}
                  onChange={(e) => handleChange('specialtyId', e.target.value)}
                >
                  <option value="">-- {loadingSpecialties ? 'Đang tải...' : 'Chọn chuyên khoa'} --</option>
                  {specialties.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            {}
            <Col md={6}>
              <Form.Group>
                <Form.Label className="appt-modal-label">Bác sĩ (Tuỳ chọn)</Form.Label>
                <Form.Select
                  className="appt-modal-control"
                  value={form.doctorProfileId}
                  onChange={(e) => handleChange('doctorProfileId', e.target.value)}
                  disabled={!form.specialtyId || loadingDoctors}
                >
                  <option value="">-- {loadingDoctors ? 'Đang tải...' : 'Tự động phân công / Chọn bác sĩ'} --</option>
                  {doctors.map((doc) => (
                    <option key={doc.doctorProfileId} value={doc.doctorProfileId}>
                      {doc.fullName}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            {}
            <Col md={12}>
              <Form.Group>
                <Form.Label className="appt-modal-label">Ngày khám *</Form.Label>
                <Form.Control
                  className="appt-modal-control"
                  type="date"
                  min={today}
                  value={form.appointmentDate}
                  onChange={(e) => handleChange('appointmentDate', e.target.value)}
                />
              </Form.Group>
            </Col>

            {}
            <Col md={12}>
              <Form.Group>
                <Form.Label className="appt-modal-label">Lý do khám *</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  className="appt-modal-control"
                  placeholder="Mô tả triệu chứng hoặc lý do khám..."
                  value={form.reason}
                  onChange={(e) => handleChange('reason', e.target.value)}
                />
              </Form.Group>
            </Col>

            {}
            {(form.specialtyId && form.appointmentDate) && (
              <Col md={12}>
                <Form.Label className="appt-modal-label">Slot trống trong ngày</Form.Label>

                {loadingSlots ? (
                  <div className="d-flex align-items-center gap-2 text-muted" style={{ fontSize: 14 }}>
                    <Spinner size="sm" /> Đang tải slot...
                  </div>
                ) : availableSlots.length === 0 ? (
                  <p className="text-muted" style={{ fontSize: 13 }}>
                    Không còn slot trống trong ngày này. Hệ thống sẽ tự chọn slot gần nhất.
                  </p>
                ) : (
                  <Row className="g-2 mt-1">
                    {availableSlots.map((slot) => (
                      <Col xs={6} sm={4} md={3} key={slot.scheduleId}>
                        <div
                          className={`appt-slot-card w-100 h-100 ${selectedSlot?.scheduleId === slot.scheduleId ? 'selected' : ''}`}
                          onClick={() => setSelectedSlot(slot)}
                        >
                          {slot.startTime}
                          <br />
                          <span style={{ fontSize: 11, color: '#64748b' }}>STT {slot.queueNumber}</span>
                          {slot.doctorName && (
                            <>
                              <br />
                              <span style={{ fontSize: 11, color: '#64748b' }}>{slot.doctorName}</span>
                            </>
                          )}
                        </div>
                      </Col>
                    ))}
                  </Row>
                )}
              </Col>
            )}
          </Row>

          {}
          <div className="d-flex justify-content-end gap-3 mt-4 pt-3" style={{ borderTop: '1px solid #f1f5f9' }}>
            <button
              type="button"
              className="btn btn-light px-4 fw-semibold"
              style={{ borderRadius: 10 }}
              onClick={handleClose}
              disabled={submitting}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="btn appt-modal-submit text-white px-4"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Spinner size="sm" className="me-2" />
                  Đang tạo...
                </>
              ) : (
                '✓ Tạo lịch hẹn'
              )}
            </button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default WalkInModal;
