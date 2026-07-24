import { useState, useEffect } from "react";
import { Container, Table, Badge, Row, Col, Card, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../../shared/components/DashboardLayout";
import doctorService from "../services/doctorService";

// Hàm trả về màu badge theo trạng thái
function getStatusBadge(status) {
    switch (status) {
        case "CONFIRMED": return "primary";
        case "PENDING": return "warning";
        case "COMPLETED": return "success";
        case "CANCELLED": return "danger";
        default: return "secondary";
    }
}

export default function DoctorDashboard() {
    const [appointments, setAppointments] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const data = await doctorService.getMyAppointments();

            const todayStr = new Date().toLocaleDateString('en-CA');
            const todayAppointments = data.filter(a =>
                a.scheduleDate === todayStr && a.status !== "COMPLETED"
            );
            setAppointments(todayAppointments);
        } catch (error) {
            console.error("Lỗi tải lịch hẹn:", error);
        }
    };

    const total = appointments.length;
    const pending = appointments.filter((a) => a.status === "PENDING" || a.status === "CONFIRMED").length;
    const completed = appointments.filter((a) => a.status === "COMPLETED").length;

    return (
        <DashboardLayout>
            <Container fluid>
                <h4 className="mb-4">📋 Dashboard Bác sĩ — Hôm nay</h4>

                {}
                <Row className="g-3 mb-4">
                    <Col md={4}>
                        <Card className="text-center border-primary">
                            <Card.Body>
                                <h3 className="text-primary">{total}</h3>
                                <Card.Text>Tổng cuộc hẹn</Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={4}>
                        <Card className="text-center border-warning">
                            <Card.Body>
                                <h3 className="text-warning">{pending}</h3>
                                <Card.Text>Chờ khám</Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={4}>
                        <Card className="text-center border-success">
                            <Card.Body>
                                <h3 className="text-success">{completed}</h3>
                                <Card.Text>Đã khám</Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                {}
                <h5>Danh sách hẹn hôm nay</h5>
                <Table striped bordered hover responsive>
                    <thead>
                        <tr>
                            <th>STT</th>
                            <th>Bệnh nhân</th>
                            <th>Giờ hẹn</th>
                            <th>Lý do khám</th>
                            <th>Trạng thái</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {appointments.map((a, index) => (
                            <tr key={a.id}>
                                <td>{a.queueNumber || (index + 1)}</td>
                                <td>{a.patientName}</td>
                                <td>{a.scheduleStartTime?.substring(0, 5)} - {a.scheduleEndTime?.substring(0, 5)}</td>
                                <td>{a.reason}</td>
                                <td>
                                    <Badge bg={getStatusBadge(a.status)}>
                                        {a.status}
                                    </Badge>
                                </td>
                                <td>
                                    {a.status === "WAITING_FOR_TURN" && (
                                        <Button
                                            variant="success"
                                            size="sm"
                                            onClick={() => navigate(`/doctor/medical-record/${a.id}`)}
                                        >
                                            ⚡ Khám xong (Process)
                                        </Button>
                                    )}
                                    {a.status === "COMPLETED" && (
                                        <Button
                                            variant="outline-secondary"
                                            size="sm"
                                            onClick={() => navigate(`/doctor/medical-record/${a.id}`)}
                                        >
                                            Xem kết quả
                                        </Button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {appointments.length === 0 && (
                            <tr>
                                <td colSpan="6" className="text-center text-muted py-3">
                                    Không có cuộc hẹn nào trong ngày hôm nay.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            </Container>
        </DashboardLayout>
    );
}
