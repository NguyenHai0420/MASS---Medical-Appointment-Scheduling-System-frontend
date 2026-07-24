import { useState, useEffect } from "react";
import { Container, Table, Button, Badge, Modal, Form } from "react-bootstrap";
import { useForm } from "react-hook-form";
import toast, { Toaster } from "react-hot-toast";
import DashboardLayout from "../../../shared/components/DashboardLayout";
import adminService from "../services/adminService";

function getRoleBadge(role) {
    if (role === "ADMIN" || role === "ROLE_ADMIN") return "danger";
    if (role === "DOCTOR" || role === "ROLE_DOCTOR") return "primary";
    if (role === "RECEPTIONIST" || role === "ROLE_RECEPTIONIST") return "warning";
    return "success";
}

export default function ManageUsers() {
    const [users, setUsers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editItem, setEditItem] = useState(null);

    const { register, handleSubmit, formState: { errors }, reset } = useForm();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const data = await adminService.getAllUsers();
            setUsers(data);
        } catch (error) {
            toast.error("Không thể tải danh sách người dùng!");
        }
    };

    const handleShowEdit = (item) => {
        setEditItem(item);
        reset({
            ...item,
            active: item.active !== false ? "true" : "false"
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
                active: data.active === "true" || data.active === true
            };
            await adminService.updateUser(editItem.id, payload);
            toast.success("Cập nhật người dùng thành công!");
            handleClose();
            fetchData();
        } catch (error) {
            toast.error("Có lỗi xảy ra!");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Bạn có chắc muốn khóa tài khoản này?")) return;
        try {
            await adminService.deleteUser(id);
            toast.success("Khóa tài khoản thành công!");
            fetchData();
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.message || error.message || "Khóa tài khoản thất bại!";
            toast.error(msg);
        }
    };

    const handleRestore = async (id) => {
        try {
            await adminService.updateUser(id, { active: true });
            toast.success("Mở khóa tài khoản thành công!");
            fetchData();
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.message || error.message || "Có lỗi xảy ra!";
            toast.error(msg);
        }
    };

    return (
        <DashboardLayout>
            <Container fluid>
                <Toaster />
                <h4 className="mb-3">Quản lý Người dùng</h4>

                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Họ tên</th>
                            <th>Email</th>
                            <th>Số điện thoại</th>
                            <th>Role</th>
                            <th>Trạng thái</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((item, index) => (
                            <tr key={item.id}>
                                <td>{index + 1}</td>
                                <td>{item.fullName}</td>
                                <td>{item.email}</td>
                                <td>{item.phone}</td>
                                <td>
                                    <Badge bg={getRoleBadge(item.role)}>
                                        {item.role}
                                    </Badge>
                                </td>
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
                                            onClick={() => handleRestore(item.id)}
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
                        <Modal.Title>Sửa thông tin người dùng</Modal.Title>
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
                                <Form.Label>Số điện thoại</Form.Label>
                                <Form.Control
                                    type="text"
                                    {...register("phone")}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Role</Form.Label>
                                <Form.Select {...register("role")}>
                                    <option value="ROLE_PATIENT">PATIENT (Bệnh nhân)</option>
                                    <option value="ROLE_DOCTOR">DOCTOR (Bác sĩ)</option>
                                    <option value="ROLE_RECEPTIONIST">RECEPTIONIST (Lễ tân)</option>
                                </Form.Select>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Trạng thái</Form.Label>
                                <Form.Select {...register("active")}>
                                    <option value="true">Hoạt động</option>
                                    <option value="false">Đã khóa</option>
                                </Form.Select>
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
