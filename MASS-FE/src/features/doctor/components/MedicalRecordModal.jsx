import React, { useState, useEffect } from "react";
import { Modal, Form, Button, Row, Col, Card } from "react-bootstrap";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import doctorService from "../services/doctorService";

export default function MedicalRecordModal({ show, onHide, appointment, onSuccess }) {
    const [recordId, setRecordId] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        defaultValues: {
            diagnosis: "",
            notes: "",
            prescription: "",
        },
    });

    useEffect(() => {
        if (show && appointment) {
            fetchRecord();
        } else {
            resetForm();
        }
    }, [show, appointment]);

    const resetForm = () => {
        setRecordId(null);
        setIsEditing(false);
        reset({ diagnosis: "", notes: "", prescription: "" });
    };

    const fetchRecord = async () => {
        if (appointment.status === "WAITING_FOR_TURN") {

            setIsEditing(true);
            setRecordId(null);
            reset({ diagnosis: "", notes: "", prescription: "" });
            return;
        }

        try {
            const record = await doctorService.getMedicalRecord(appointment.id);
            if (record) {
                setRecordId(record.id);
                reset({
                    diagnosis: record.diagnosis || "",
                    notes: record.notes || "",
                    prescription: record.prescription || "",
                });
                setIsEditing(true);
            }
        } catch (err) {

            setRecordId(null);
            reset({ diagnosis: "", notes: "", prescription: "" });
            setIsEditing(true);
        }
    };

    const onSubmit = async (data) => {
        try {
            const payload = {
                ...data,
                appointmentId: Number(appointment.id)
            };

            if (recordId) {
                await doctorService.updateMedicalRecord(recordId, payload);
            } else {
                await doctorService.createMedicalRecord(payload);
            }

            toast.success("Lưu kết quả khám thành công!");
            onSuccess();
            onHide();
        } catch (error) {
            toast.error(error.response?.data || "Lưu kết quả thất bại!");
        }
    };

    return (
        <Modal show={show} onHide={onHide} size="lg" centered backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>
                    {isEditing ? "Nhập/Sửa kết quả khám bệnh" : "Chi tiết kết quả khám bệnh"}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
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
                <form id="medical-record-form" onSubmit={handleSubmit(onSubmit)}>
                    <Form.Group className="mb-3">
                        <Form.Label>Chẩn đoán</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            placeholder="Nhập chẩn đoán..."
                            disabled={!isEditing}
                            {...register("diagnosis", { required: true })}
                        />
                        {errors.diagnosis && isEditing && (
                            <p className="text-danger">Chẩn đoán không được để trống</p>
                        )}
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Ghi chú</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={2}
                            placeholder="Ghi chú thêm (không bắt buộc)..."
                            disabled={!isEditing}
                            {...register("notes")}
                        />
                    </Form.Group>

                    <Form.Group className="mb-4">
                        <Form.Label>Đơn thuốc</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            placeholder="Nhập đơn thuốc..."
                            disabled={!isEditing}
                            {...register("prescription")}
                        />
                    </Form.Group>
                </form>
            </Modal.Body>
            <Modal.Footer>
                {!isEditing ? (
                    <Button variant="warning" type="button" onClick={() => setIsEditing(true)}>
                        Sửa kết quả
                    </Button>
                ) : (
                    <Button variant="primary" type="submit" form="medical-record-form">
                        Lưu kết quả
                    </Button>
                )}
                <Button variant="secondary" type="button" onClick={onHide}>
                    Đóng
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
