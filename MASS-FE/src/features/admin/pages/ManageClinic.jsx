import { useState, useEffect } from "react";
import { Container, Card, Form, Button } from "react-bootstrap";
import { useForm } from "react-hook-form";
import toast, { Toaster } from "react-hot-toast";
import DashboardLayout from "../../../shared/components/DashboardLayout";
import adminService from "../services/adminService";

export default function ManageClinicPage() {
    const [clinic, setClinic] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const { register, handleSubmit, formState: { errors }, reset } = useForm();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const data = await adminService.getClinicInfo();

            const clinicData = Array.isArray(data) ? data[0] : data;
            if (clinicData) {
                setClinic(clinicData);
                reset({
                    name: clinicData.name || "",
                    address: clinicData.address || "",
                    phone: clinicData.phone || "",
                    email: clinicData.email || "",
                    workingHours: clinicData.workingHours || ""
                });
            }
        } catch (error) {
            console.error(error);
            toast.error("Không thể tải thông tin phòng khám!");
        }
    };

    const handleEditStart = () => {
        if (clinic) {
            reset({
                name: clinic.name || "",
                address: clinic.address || "",
                phone: clinic.phone || "",
                email: clinic.email || "",
                workingHours: clinic.workingHours || ""
            });
        }
        setIsEditing(true);
    };

    const onSubmit = async (data) => {
        try {
            const payload = {
                name: data.name,
                address: data.address,
                phone: data.phone || "",
                email: data.email || "",
                workingHours: data.workingHours || ""
            };

            if (clinic?.id) {
                const updated = await adminService.updateClinicInfo(clinic.id, payload);
                setClinic(updated);
                reset(updated);
                toast.success("Cập nhật thông tin thành công!");
            } else {
                const newClinic = await adminService.createClinicInfo(payload);
                setClinic(newClinic);
                reset(newClinic);
                toast.success("Tạo thông tin phòng khám thành công!");
            }
            setIsEditing(false);
        } catch (error) {
            console.error(error);
            const errorMsg = error.response?.data?.message || "Lưu thất bại!";
            toast.error(errorMsg);
        }
    };

    return (
        <DashboardLayout>
            <Container fluid className="py-2">
                <Toaster />
                <div className="mb-4">
                    <h4 className="fw-bold mb-1">🏥 Quản lý Thông tin Phòng khám</h4>
                    <p className="text-muted mb-0" style={{ fontSize: 14 }}>
                        Cập nhật hồ sơ công khai của phòng khám
                    </p>
                </div>

                <Card className="border-0 shadow-sm">
                    <Card.Body className="p-4">
                        <Form onSubmit={handleSubmit(onSubmit)}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">Tên phòng khám</Form.Label>
                                <Form.Control
                                    type="text"
                                    readOnly={!isEditing}
                                    className={!isEditing ? "bg-light" : ""}
                                    {...register("name", { required: "Tên phòng khám không được để trống" })}
                                />
                                {errors.name && (
                                    <p className="text-danger mt-1" style={{ fontSize: 13 }}>{errors.name.message}</p>
                                )}
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">Địa chỉ</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={2}
                                    readOnly={!isEditing}
                                    className={!isEditing ? "bg-light" : ""}
                                    {...register("address", { required: "Địa chỉ không được để trống" })}
                                />
                                {errors.address && (
                                    <p className="text-danger mt-1" style={{ fontSize: 13 }}>{errors.address.message}</p>
                                )}
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">Số điện thoại liên hệ</Form.Label>
                                <Form.Control
                                    type="text"
                                    readOnly={!isEditing}
                                    className={!isEditing ? "bg-light" : ""}
                                    {...register("phone")}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">Email</Form.Label>
                                <Form.Control
                                    type="email"
                                    readOnly={!isEditing}
                                    className={!isEditing ? "bg-light" : ""}
                                    {...register("email")}
                                />
                            </Form.Group>

                            <Form.Group className="mb-4">
                                <Form.Label className="fw-bold">Giờ làm việc</Form.Label>
                                <Form.Control
                                    type="text"
                                    readOnly={!isEditing}
                                    className={!isEditing ? "bg-light" : ""}
                                    placeholder="Ví dụ: Thứ 2 - Thứ 7: 8:00 - 17:30"
                                    {...register("workingHours")}
                                />
                            </Form.Group>

                            <div className="d-flex gap-2">
                                {!isEditing ? (
                                    <Button variant="primary" type="button" onClick={handleEditStart}>
                                        Chỉnh sửa thông tin
                                    </Button>
                                ) : (
                                    <>
                                        <Button variant="success" type="submit">
                                            Lưu thay đổi
                                        </Button>
                                        <Button variant="secondary" type="button" onClick={() => {
                                            setIsEditing(false);
                                            if (clinic) reset(clinic);
                                        }}>
                                            Hủy
                                        </Button>
                                    </>
                                )}
                            </div>
                        </Form>
                    </Card.Body>
                </Card>
            </Container>
        </DashboardLayout>
    );
}
