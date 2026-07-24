import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Form, Button, Spinner, Alert } from "react-bootstrap";
import { useNavigate } from 'react-router-dom';
import patientService from "../../patient/services/patientService";

const DoctorList = () => {
  const [doctors, setDoctors] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useState({ name: '', specialtyId: '' });

  const navigate = useNavigate();

  useEffect(() => {
    fetchSpecialties();
    fetchDoctors();
  }, []);

  const fetchSpecialties = async () => {
    try {
      const response = await patientService.getSpecialties();
      setSpecialties(response.data);
    } catch (err) {
      console.error("Failed to fetch specialties", err);
    }
  };

  const fetchDoctors = async (params = {}) => {
    setLoading(true);
    try {
      const response = await patientService.getDoctors(params.specialtyId, params.name);
      setDoctors(response.data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch doctors", err);

      setDoctors([
        { id: 1, name: "Dr. Nguyen Van A", specialtyName: "Tim mạch", clinicName: "Phòng khám 1" },
        { id: 2, name: "Dr. Tran Thi B", specialtyName: "Nhi khoa", clinicName: "Phòng khám 2" }
      ]);
      setError("Unable to connect to server. Showing mock data.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchDoctors(searchParams);
  };

  return (
    <Container className="py-5">
      <h2 className="fw-bold mb-4 text-center">Our Doctors</h2>

      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <Form onSubmit={handleSearch}>
            <Row>
              <Col md={5} className="mb-3 mb-md-0">
                <Form.Group>
                  <Form.Label>Tên bác sĩ</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Nhập tên bác sĩ..."
                    value={searchParams.name}
                    onChange={(e) => setSearchParams({...searchParams, name: e.target.value})}
                  />
                </Form.Group>
              </Col>
              <Col md={5} className="mb-3 mb-md-0">
                <Form.Group>
                  <Form.Label>Chuyên khoa</Form.Label>
                  <Form.Select
                    value={searchParams.specialtyId}
                    onChange={(e) => setSearchParams({...searchParams, specialtyId: e.target.value})}
                  >
                    <option value="">Tất cả chuyên khoa</option>
                    {specialties.map(spec => (
                      <option key={spec.id} value={spec.id}>{spec.name}</option>
                    ))}
                    {}
                    <option value="1">Tim mạch</option>
                    <option value="2">Nhi khoa</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={2} className="d-flex align-items-end">
                <Button variant="primary" type="submit" className="w-100">Tìm kiếm</Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {error && <Alert variant="warning">{error}</Alert>}

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : (
        <Row>
          {doctors.length === 0 ? (
            <Col>
              <Alert variant="info">Không tìm thấy bác sĩ nào phù hợp.</Alert>
            </Col>
          ) : (
            doctors.map(doctor => (
              <Col md={6} lg={4} key={doctor.id} className="mb-4">
                <Card className="h-100 shadow-sm hover-shadow">
                  <Card.Body>
                    <div className="d-flex align-items-center mb-3">
                      <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3" style={{width: '60px', height: '60px', fontSize: '24px'}}>
                        {doctor.name.charAt(0)}
                      </div>
                      <div>
                        <Card.Title className="mb-1">{doctor.name}</Card.Title>
                        <Card.Subtitle className="text-muted">{doctor.specialtyName}</Card.Subtitle>
                      </div>
                    </div>
                    <Card.Text>
                      <strong>Phòng khám:</strong> {doctor.clinicName}
                    </Card.Text>
                    <Button
                      variant="outline-primary"
                      className="w-100 mt-2"
                      onClick={() => navigate(`/doctors/${doctor.id}`)}
                    >
                      Xem chi tiết & Đặt lịch
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))
          )}
        </Row>
      )}
    </Container>
  );
};

export default DoctorList;
