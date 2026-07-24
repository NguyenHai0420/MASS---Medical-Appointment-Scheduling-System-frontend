import { useState, useEffect } from "react";
import { Container, Table, Badge, Button } from "react-bootstrap";
import { Toaster } from "react-hot-toast";
import DashboardLayout from "../../../shared/components/DashboardLayout";
import doctorService from "../services/doctorService";
import MedicalRecordModal from "../components/MedicalRecordModal";

function getStatusBadge(status) {
    switch (status) {
        case "CONFIRMED": return "primary";
        case "PENDING": return "warning";
        case "COMPLETED": return "success";
        case "CANCELLED": return "danger";
        default: return "secondary";
    }
}

export default function AppointmentList() {
    const [appointments, setAppointments] = useState([]);

    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [selectedAppt, setSelectedAppt] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const data = await doctorService.getMyAppointments();
            setAppointments(data);
        } catch (error) {
            console.error("Lỗi tải danh sách hẹn:", error);
        }
    };

    const handleRecord = (appt) => {
        setSelectedAppt(appt);
        setShowModal(true);
    };

    const handleModalSuccess = () => {
        fetchData();
    };

    return (
        <DashboardLayout>
            <Container fluid>
                <Toaster />
                <h4 className="mb-3">📝 Danh sách cuộc hẹn</h4>

                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Bệnh nhân</th>
                            <th>Ngày hẹn</th>
                            <th>Giờ hẹn</th>
                            <th>Lý do khám</th>
                            <th>Trạng thái</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {appointments.map((a, index) => (
                            <tr key={a.id}>
                                <td>{index + 1}</td>
                                <td>{a.patientName}</td>
                                <td>{a.scheduleDate}</td>
                                <td>{a.scheduleStartTime?.substring(0, 5)} - {a.scheduleEndTime?.substring(0, 5)}</td>
                                <td>{a.reason}</td>
                                <td>
                                    <Badge bg={getStatusBadge(a.status)}>
                                        {a.status}
                                    </Badge>
                                </td>
                                <td>
                                    {}
                                    {a.status === "WAITING_FOR_TURN" && (
                                        <Button
                                            variant="success"
                                            size="sm"
                                            onClick={() => handleRecord(a)}
                                        >
                                            Nhập kết quả
                                        </Button>
                                    )}
                                    {a.status === "COMPLETED" && (
                                        <Button
                                            variant="outline-secondary"
                                            size="sm"
                                            onClick={() => handleRecord(a)}
                                        >
                                            Xem kết quả
                                        </Button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>

                {/* Pop-up xem / sửa kết quả khám bệnh */}
                <MedicalRecordModal
                    show={showModal}
                    onHide={() => setShowModal(false)}
                    appointment={selectedAppt}
                    onSuccess={handleModalSuccess}
                />
            </Container>
        </DashboardLayout>
    );
}
