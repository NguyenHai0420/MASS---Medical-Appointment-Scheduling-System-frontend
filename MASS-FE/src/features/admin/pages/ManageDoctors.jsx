import { useState, useEffect } from "react";
import { Container, Table, Button, Modal, Form, Badge } from "react-bootstrap";
import { useForm } from "react-hook-form";
import toast, { Toaster } from "react-hot-toast";
import DashboardLayout from "../../../shared/components/DashboardLayout";
import adminService from "../services/adminService";

export default function ManageDoctorsPage() {
    const [doctors, setDoctors] = useState([]);
    const [specialties, setSpecialties] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editItem, setEditItem] = useState(null);

    const { register, handleSubmit, formState: { errors }, reset } = useForm();

    useEffect(() => {
        fetchData();
        fetchSpecialties();
    }, []);

    const fetchData = async () => {
        try {
            const data = await adminService.getAllDoctors();
            setDoctors(data);
        } catch (error) {
            toast.error("Không thể tải danh sách bác sĩ!");
        }
    };

    const fetchSpecialties = async () => {
        try {
            const data = await adminService.getAllSpecialties();
            setSpecialties(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleShowAdd = () => {
        setEditItem(null);
        reset({ fullName: "", email: "", specialtyId: "", degree: "", experience: "", description: "" });
        setShowModal(true);
    };

    const handleShowEdit = (item) => {
        setEditItem(item);
        reset({
            fullName: item.fullName,
            email: item.email,
            specialtyId: item.specialtyId,
            degree: item.degree,
            experience: item.experience,
            description: item.description
        });
        setShowModal(true);
    };

    const handleClose = () => {
        setShowModal(false);
        setEditItem(null);
        reset();
    };

    const onSubmit = async (data) => {
        try {
            const payload = {
                ...data,
                specialtyId: Number(data.specialtyId)
            };

            if (editItem) {
                await adminService.updateDoctor(editItem.id, payload);
                toast.success("Cập nhật bác sĩ thành công!");
            } else {
                await adminService.createDoctor(payload);
                toast.success("Thêm bác sĩ thành công! Mật khẩu mặc định: doctor@123");
            }
            handleClose();
            fetchData();
        } catch (error) {
            const errorMsg = error.response?.data?.message || "Có lỗi xảy ra!";
            toast.error(errorMsg);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Bạn có chắc muốn khóa bác sĩ này?")) return;
        try {
            await adminService.deleteDoctor(id);
            toast.success("Khóa bác sĩ thành công!");
            fetchData();
        } catch (error) {
            toast.error("Khóa thất bại!");
        }
    };

    const handleRestore = async (userId) => {
        try {
            await adminService.updateUser(userId, { active: true });
            toast.success("Mở khóa bác sĩ thành công!");
            fetchData();
        } catch (error) {
            toast.error("Có lỗi xảy ra!");
        }
    };

    return (
        <DashboardLayout>
            <Container fluid>
                <Toaster />
                <h4 className="mb-3">👨‍⚕️ Quản lý Bác sĩ</h4>

                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Họ tên</th>
                            <th>Email</th>
                            <th>Chuyên khoa</th>
                            <th>Bằng cấp</th>
                            <th>Kinh nghiệm</th>
                            <th>Trạng thái</th>
                            <th>
                                <Button variant="primary" size="sm" onClick={handleShowAdd}>
                                    + Thêm mới
                                </Button>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {doctors.map((item, index) => (
                            <tr key={item.id}>
                                <td>{index + 1}</td>
                                <td>{item.fullName}</td>
                                <td>{item.email}</td>
                                <td>{item.specialtyName}</td>
                                <td>{item.degree}</td>
                                <td>{item.experience}</td>
                                <td>
                                    {item.active !== false ? (
                                        <Badge bg="success">Hoạt động</Badge>
                                    ) : (
                                        <Badge bg="secondary">Đã khóa</Badge>
                                    )}
                                </td>
                                <td>
                                    <Button
                                        variant="warning"
                                        size="sm"
                                        className="me-2"
                                        onClick={() => handleShowEdit(item)}
                                    >
                                        Sửa
                                    </Button>
                                    {item.active !== false ? (
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            onClick={() => handleDelete(item.id)}
                                        >
                                            Khóa
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="success"
                                            size="sm"
                                            onClick={() => handleRestore(item.userId)}
                                        >
                                            Mở khóa
                                        </Button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>

                {}
                <Modal show={showModal} onHide={handleClose} backdrop="static">
                    <Modal.Header closeButton>
                        <Modal.Title>
                            {editItem ? "Sửa thông tin bác sĩ" : "Thêm bác sĩ mới"}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <Form.Group className="mb-3">
                                <Form.Label>Họ tên</Form.Label>
                                <Form.Control
                                    type="text"
                                    {...register("fullName", { required: true })}
                                />
                                {errors.fullName && (
                                    <p className="text-danger">Họ tên không được để trống</p>
                                )}
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Email</Form.Label>
                                <Form.Control
                                    type="email"
                                    {...register("email", { required: true })}
                                />
                                {errors.email && (
                                    <p className="text-danger">Email không được để trống</p>
                                )}
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Chuyên khoa</Form.Label>
                                <Form.Select {...register("specialtyId", { required: true })}>
                                    <option value="">-- Chọn chuyên khoa --</option>
                                    {specialties.map((s) => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </Form.Select>
                                {errors.specialtyId && (
                                    <p className="text-danger">Vui lòng chọn chuyên khoa</p>
                                )}
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Bằng cấp</Form.Label>
                                <Form.Control
                                    type="text"
                                    {...register("degree")}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Kinh nghiệm</Form.Label>
                                <Form.Control
                                    type="text"
                                    {...register("experience")}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Mô tả chi tiết</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    {...register("description")}
                                />
                            </Form.Group>

                            <Modal.Footer>
                                <Button variant="secondary" onClick={handleClose}>
                                    Đóng
                                </Button>
                                <Button variant="primary" type="submit">
                                    Lưu
                                </Button>
                            </Modal.Footer>
                        </form>
                    </Modal.Body>
                </Modal>
            </Container>
        </DashboardLayout>
    );
}
