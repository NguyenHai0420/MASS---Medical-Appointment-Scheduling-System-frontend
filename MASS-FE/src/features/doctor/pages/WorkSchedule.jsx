import { useState, useEffect } from "react";
import { Container, Table } from "react-bootstrap";
import toast, { Toaster } from "react-hot-toast";
import DashboardLayout from "../../../shared/components/DashboardLayout";
import doctorService from "../services/doctorService";

export default function WorkSchedule() {
    const [schedules, setSchedules] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const data = await doctorService.getMySchedules();
            setSchedules(data);
        } catch (error) {
            toast.error("Không thể tải lịch làm việc!");
        }
    };

    return (
        <DashboardLayout>
            <Container fluid>
                <Toaster />
                <h4 className="mb-3">📅 Lịch làm việc</h4>

                <Table striped bordered hover responsive>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Ngày</th>
                            <th>Giờ bắt đầu</th>
                            <th>Giờ kết thúc</th>
                            <th>Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody>
                        {schedules.map((item, index) => (
                            <tr key={item.id}>
                                <td>{index + 1}</td>
                                <td>{item.date}</td>
                                <td>{item.startTime}</td>
                                <td>{item.endTime}</td>
                                <td>
                                    {item.available ? (
                                        <span className="badge text-bg-success">Còn trống</span>
                                    ) : (
                                        <span className="badge text-bg-secondary">Đã đặt</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {schedules.length === 0 && (
                            <tr>
                                <td colSpan="5" className="text-center text-muted py-3">
                                    Chưa có lịch làm việc được phân công.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            </Container>
        </DashboardLayout>
    );
}
