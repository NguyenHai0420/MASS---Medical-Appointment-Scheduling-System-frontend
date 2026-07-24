import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Spinner, ListGroup, Badge } from "react-bootstrap";
import { Link } from "react-router-dom";
import BaseProfileForm from "../components/BaseProfileForm";
import patientService from "../../patient/services/patientService";

const STATUS_MAPPING = {
  PENDING_PAYMENT: { text: "Chờ thanh toán", bg: "warning" },
  PAID: { text: "Đã thanh toán", bg: "success" },
  CANCELED: { text: "Đã hủy", bg: "danger" }
};

const PatientProfile = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await patientService.getMyAppointments();
        setAppointments(response.data);
      } catch (err) {
        console.error("Failed to fetch appointments", err);

        setAppointments([
          { id: 1, doctorName: "Dr. Nguyen Van A", date: "2026-07-20", time: "08:00 - 08:30", status: "PENDING_PAYMENT" },
          { id: 2, doctorName: "Dr. Tran Thi B", date: "2026-07-21", time: "14:00 - 14:30", status: "PAID" },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  return (
    <Container className="py-5">
      <Row>
        {}
        <Col md={7}>
          <BaseProfileForm />
        </Col>

        {}
        <Col md={5}>
          <Card className="shadow-sm border-0 bg-light mb-4">
            <Card.Header className="bg-white border-0 pt-4 pb-0 d-flex justify-content-between align-items-center">
              <h4 className="fw-bold mb-0">My Appointments</h4>
              <Link to="/my-appointments" className="btn btn-sm btn-outline-primary">Xem tất cả</Link>
            </Card.Header>
            <Card.Body className="p-3">
              {loading ? (
                <div className="text-center py-4">
                  <Spinner animation="border" variant="primary" size="sm" />
                </div>
              ) : appointments.length === 0 ? (
                <div className="text-center text-muted p-4">
                  <i className="bi bi-calendar2-x mb-2 d-block" style={{ fontSize: "2rem" }}></i>
                  <p className="mb-0">No upcoming appointments found.</p>
                </div>
              ) : (
                <ListGroup variant="flush">
                  {appointments.slice(0, 3).map(appt => {
                    const statusInfo = STATUS_MAPPING[appt.status] || { text: appt.status, bg: "secondary" };
                    return (
                      <ListGroup.Item key={appt.id} className="bg-transparent border-bottom px-0">
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <h6 className="mb-1 text-primary">{appt.doctorName}</h6>
                            <small className="text-muted"><i className="bi bi-calendar-event me-1"></i> {appt.date} | {appt.time}</small>
                          </div>
                          <Badge bg={statusInfo.bg}>{statusInfo.text}</Badge>
                        </div>
                      </ListGroup.Item>
                    );
                  })}
                </ListGroup>
              )}
            </Card.Body>
          </Card>

          <Card className="shadow-sm border-0 bg-light">
            <Card.Header className="bg-white border-0 pt-4 pb-0">
              <h4 className="fw-bold mb-0">Medical Records</h4>
            </Card.Header>
            <Card.Body className="p-4 text-center text-muted">
              <i className="bi bi-file-earmark-medical mb-2 d-block" style={{ fontSize: "2rem" }}></i>
              <p className="mb-0">Your medical history will appear here.</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default PatientProfile;
