import { useState, useEffect } from "react";
import { Container, Form, Button, Card, Row, Col } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast, { Toaster } from "react-hot-toast";
import DashboardLayout from "../../../shared/components/DashboardLayout";
import doctorService from "../services/doctorService";

export default function MedicalRecordPage() {
    const { appointmentId } = useParams();
    const navigate = useNavigate();
    const [appointment, setAppointment] = useState(null);
    const [recordId, setRecordId] = useState(null);

    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        defaultValues: {
            diagnosis: "",
            notes: "",
            prescription: "",
        },
    });

    useEffect(() => {
        fetchAppointment();
    }, [appointmentId]);

    const fetchAppointment = async () => {
        try {
            const appts = await doctorService.getMyAppointments();
            const appt = appts.find(a => a.id === Number(appointmentId));
            if (!appt) {
                toast.error("Không tìm thấy cuộc hẹn này!");
                return;
            }
            setAppointment(appt);

            try {
                const record = await doctorService.getMedicalRecord(appointmentId);
                if (record) {
                    setRecordId(record.id);
                    reset({
                        diagnosis: record.diagnosis || "",
                        notes: record.notes || "",
                        prescription: record.prescription || "",
                    });
                }
            } catch (err) {

                setRecordId(null);
                reset({ diagnosis: "", notes: "", prescription: "" });
            }
        } catch (error) {
            toast.error("Không thể tải thông tin cuộc hẹn!");
        }
    };

    const onSubmit = async (data) => {
        try {
            const payload = {
                ...data,
                appointmentId: Number(appointmentId)
            };

            if (recordId) {
                await doctorService.updateMedicalRecord(recordId, payload);
            } else {
                await doctorService.createMedicalRecord(payload);
            }

            toast.success("Lưu kết quả khám thành công!");

            setTimeout(() => {
                navigate("/doctor/appointments");
            }, 700);
        } catch (error) {
            toast.error(error.response?.data || "Lưu kết quả thất bại!");
        }
    };

    return (
        <DashboardLayout>
            <Container fluid>
                <Toaster />
                <h4 className="mb-3">🩺 Nhập kết quả khám bệnh</h4>

                {}
                {appointment && (
                    <Card className="mb-4 border-info">
                        <Card.Header className="bg-info text-white">
                            Thông tin bệnh nhân
                        </Card.Header>
                        <Card.Body>
                            <Row>
                                <Col md={4}>
                                    <strong>Bệnh nhân:</strong> {appointment.patientName}
                                </Col>
                                <Col md={4}>
                                    <strong>Ngày hẹn:</strong> {appointment.scheduleDate} — {appointment.scheduleStartTime?.substring(0, 5)} - {appointment.scheduleEndTime?.substring(0, 5)}
                                </Col>
                                <Col md={4}>
                                    <strong>Lý do khám:</strong> {appointment.reason}
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                )}

                {}
                <Card>
                    <Card.Body>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <Form.Group className="mb-3">
                                <Form.Label>Chẩn đoán</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    placeholder="Nhập chẩn đoán..."
                                    {...register("diagnosis", { required: true })}
                                />
                                {errors.diagnosis && (
                                    <p className="text-danger">Chẩn đoán không được để trống</p>
                                )}
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Ghi chú</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={2}
                                    placeholder="Ghi chú thêm (không bắt buộc)..."
                                    {...register("notes")}
                                />
                            </Form.Group>

                            <Form.Group className="mb-4">
                                <Form.Label>Đơn thuốc</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    placeholder="Nhập đơn thuốc..."
                                    {...register("prescription")}
                                />
                            </Form.Group>

                            <Button
                                variant="secondary"
                                className="me-2"
                                onClick={() => navigate("/doctor/appointments")}
                            >
                                Quay lại
                            </Button>
                            <Button variant="primary" type="submit">
                                Lưu kết quả
                            </Button>
                        </form>
                    </Card.Body>
                </Card>
            </Container>
        </DashboardLayout>
    );
}
