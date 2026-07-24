import { useState, useEffect } from "react";
import { Container, Tabs, Tab, Table, Card, Row, Col, Badge } from "react-bootstrap";
import toast, { Toaster } from "react-hot-toast";
import DashboardLayout from "../../../shared/components/DashboardLayout";
import adminService from "../services/adminService";

export default function ManageStatisticsPage() {
    const [activeTab, setActiveTab] = useState("doctors");
    const [doctorStats, setDoctorStats] = useState([]);
    const [patientStats, setPatientStats] = useState(null);
    const [specialtyStats, setSpecialtyStats] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadData(activeTab);
    }, [activeTab]);

    const loadData = async (tab) => {
        setLoading(true);
        try {
            if (tab === "doctors") {
                const data = await adminService.getDoctorStats();
                setDoctorStats(data);
            } else if (tab === "patients") {
                const data = await adminService.getPatientStats();
                setPatientStats(data);
            } else if (tab === "specialties") {
                const data = await adminService.getSpecialtyStats();
                setSpecialtyStats(data);
            }
        } catch (error) {
            toast.error("Không thể tải thông tin thống kê!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <Container fluid className="py-2">
                <Toaster />
                <div className="mb-4">
                    <h4 className="fw-bold mb-1">📊 Thống kê Báo cáo Hệ thống</h4>
                    <p className="text-muted mb-0" style={{ fontSize: 14 }}>
                        Theo dõi chi tiết số liệu Bác sĩ, Bệnh nhân & Chuyên khoa
                    </p>
                </div>

                <Card className="border-0 shadow-sm">
                    <Card.Body className="p-4">
                        <Tabs
                            id="statistics-tabs"
                            activeKey={activeTab}
                            onSelect={(k) => setActiveTab(k)}
                            className="mb-4"
                        >
                            {}
                            <Tab eventKey="doctors" title="👨‍⚕️ Thống kê Bác sĩ">
                                {loading ? (
                                    <div className="text-center py-5">Đang tải dữ liệu...</div>
                                ) : (
                                    <Table striped bordered hover responsive>
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Bác sĩ</th>
                                                <th>Chuyên khoa</th>
                                                <th>Tổng lịch hẹn</th>
                                                <th>Đã hoàn thành</th>
                                                <th>Đang chờ</th>
                                                <th>Đã hủy</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {doctorStats.map((item, index) => (
                                                <tr key={item.doctorProfileId || index}>
                                                    <td>{index + 1}</td>
                                                    <td className="fw-bold">{item.doctorName}</td>
                                                    <td>{item.specialtyName}</td>
                                                    <td>
                                                        <Badge bg="primary">{item.totalAppointments}</Badge>
                                                    </td>
                                                    <td>
                                                        <Badge bg="success">{item.completedAppointments}</Badge>
                                                    </td>
                                                    <td>
                                                        <Badge bg="warning" text="dark">{item.pendingAppointments}</Badge>
                                                    </td>
                                                    <td>
                                                        <Badge bg="danger">{item.cancelledAppointments}</Badge>
                                                    </td>
                                                </tr>
                                            ))}
                                            {doctorStats.length === 0 && (
                                                <tr>
                                                    <td colSpan="7" className="text-center text-muted py-3">Không có dữ liệu</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </Table>
                                )}
                            </Tab>

                            {}
                            <Tab eventKey="patients" title="🧑‍🤝‍🧑 Thống kê Bệnh nhân">
                                {loading ? (
                                    <div className="text-center py-5">Đang tải dữ liệu...</div>
                                ) : (
                                    patientStats && (
                                        <Row className="g-3">
                                            <Col md={4}>
                                                <Card className="text-center border-0 bg-light p-3 h-100 shadow-sm">
                                                    <Card.Body>
                                                        <h3 className="text-success fw-bold">{patientStats.totalPatients}</h3>
                                                        <Card.Text className="text-muted">Tổng số bệnh nhân</Card.Text>
                                                    </Card.Body>
                                                </Card>
                                            </Col>
                                            <Col md={4}>
                                                <Card className="text-center border-0 bg-light p-3 h-100 shadow-sm">
                                                    <Card.Body>
                                                        <h3 className="text-primary fw-bold">{patientStats.totalAppointments}</h3>
                                                        <Card.Text className="text-muted">Tổng số lượt khám</Card.Text>
                                                    </Card.Body>
                                                </Card>
                                            </Col>
                                            <Col md={4}>
                                                <Card className="text-center border-0 bg-light p-3 h-100 shadow-sm">
                                                    <Card.Body>
                                                        <h3 className="text-info fw-bold">
                                                            {patientStats.totalAppointments ? Math.round((patientStats.completedAppointments / patientStats.totalAppointments) * 100) : 0}%
                                                        </h3>
                                                        <Card.Text className="text-muted">Tỷ lệ hoàn thành khám</Card.Text>
                                                    </Card.Body>
                                                </Card>
                                            </Col>

                                            <Col md={12} className="mt-4">
                                                <h5 className="fw-bold mb-3">Chi tiết trạng thái lịch hẹn của bệnh nhân</h5>
                                                <Table striped bordered hover>
                                                    <thead>
                                                        <tr>
                                                            <th>Trạng thái lịch</th>
                                                            <th>Số lượng</th>
                                                            <th>Tỷ lệ</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr>
                                                            <td><Badge bg="success">Đã hoàn thành</Badge></td>
                                                            <td>{patientStats.completedAppointments}</td>
                                                            <td>
                                                                {patientStats.totalAppointments ? Math.round((patientStats.completedAppointments / patientStats.totalAppointments) * 100) : 0}%
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td><Badge bg="warning" text="dark">Đang chờ</Badge></td>
                                                            <td>{patientStats.pendingAppointments}</td>
                                                            <td>
                                                                {patientStats.totalAppointments ? Math.round((patientStats.pendingAppointments / patientStats.totalAppointments) * 100) : 0}%
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td><Badge bg="danger">Đã hủy</Badge></td>
                                                            <td>{patientStats.cancelledAppointments}</td>
                                                            <td>
                                                                {patientStats.totalAppointments ? Math.round((patientStats.cancelledAppointments / patientStats.totalAppointments) * 100) : 0}%
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </Table>
                                            </Col>
                                        </Row>
                                    )
                                )}
                            </Tab>

                            {}
                            <Tab eventKey="specialties" title="🏥 Thống kê Chuyên khoa">
                                {loading ? (
                                    <div className="text-center py-5">Đang tải dữ liệu...</div>
                                ) : (
                                    <Table striped bordered hover responsive>
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Chuyên khoa</th>
                                                <th>Số lượng Bác sĩ</th>
                                                <th>Tổng lượt khám đăng ký</th>
                                                <th>Lượt khám đã hoàn thành</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {specialtyStats.map((item, index) => (
                                                <tr key={item.specialtyId || index}>
                                                    <td>{index + 1}</td>
                                                    <td className="fw-bold">{item.specialtyName}</td>
                                                    <td>
                                                        <Badge bg="secondary">{item.totalDoctors}</Badge>
                                                    </td>
                                                    <td>
                                                        <Badge bg="primary">{item.totalAppointments}</Badge>
                                                    </td>
                                                    <td>
                                                        <Badge bg="success">{item.completedAppointments}</Badge>
                                                    </td>
                                                </tr>
                                            ))}
                                            {specialtyStats.length === 0 && (
                                                <tr>
                                                    <td colSpan="5" className="text-center text-muted py-3">Không có dữ liệu</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </Table>
                                )}
                            </Tab>
                        </Tabs>
                    </Card.Body>
                </Card>
            </Container>
        </DashboardLayout>
    );
}
