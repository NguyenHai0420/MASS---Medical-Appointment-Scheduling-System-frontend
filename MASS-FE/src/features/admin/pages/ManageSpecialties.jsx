import { useState, useEffect } from "react";
import { Container, Table, Button, Modal, Form } from "react-bootstrap";
import { useForm } from "react-hook-form";
import toast, { Toaster } from "react-hot-toast";
import DashboardLayout from "../../../shared/components/DashboardLayout";
import adminService from "../services/adminService";

export default function ManageSpecialtiesPage() {
    const [specialties, setSpecialties] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editItem, setEditItem] = useState(null);

    const { register, handleSubmit, formState: { errors }, reset } = useForm();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const data = await adminService.getAllSpecialties();
            setSpecialties(data);
        } catch (error) {
            toast.error("Không thể tải danh sách chuyên khoa!");
        }
    };

    const handleShowAdd = () => {
        setEditItem(null);
        reset({ name: "", description: "", imageUrl: "" });
        setShowModal(true);
    };

    const handleShowEdit = (item) => {
        setEditItem(item);
        reset(item);
        setShowModal(true);
    };

    const handleClose = () => {
        setShowModal(false);
        setEditItem(null);
        reset();
    };

    const onSubmit = async (data) => {
        try {
            if (editItem) {

                await adminService.updateSpecialty(editItem.id, data);
                toast.success("Cập nhật chuyên khoa thành công!");
            } else {

                await adminService.createSpecialty(data);
                toast.success("Thêm chuyên khoa thành công!");
            }
            handleClose();
            fetchData();
        } catch (error) {
            const errorMsg = error.response?.data?.message || "Có lỗi xảy ra!";
            toast.error(errorMsg);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Bạn có chắc muốn xoá chuyên khoa này?")) return;
        try {
            await adminService.deleteSpecialty(id);
            toast.success("Xoá thành công!");
            fetchData();
        } catch (error) {
            toast.error("Xoá thất bại!");
        }
    };

    return (
        <DashboardLayout>
            <Container fluid>
                <Toaster />
                <h4 className="mb-3">🏥 Quản lý Chuyên khoa</h4>

                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Tên chuyên khoa</th>
                            <th>Mô tả</th>
                            <th>
                                <Button variant="primary" size="sm" onClick={handleShowAdd}>
                                    + Thêm mới
                                </Button>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {specialties.map((item, index) => (
                            <tr key={item.id}>
                                <td>{index + 1}</td>
                                <td>{item.name}</td>
                                <td>{item.description}</td>
                                <td>
                                    <Button
                                        variant="warning"
                                        size="sm"
                                        className="me-2"
                                        onClick={() => handleShowEdit(item)}
                                    >
                                        Sửa
                                    </Button>
                                    <Button
                                        variant="danger"
                                        size="sm"
                                        onClick={() => handleDelete(item.id)}
                                    >
                                        Xoá
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>

                {}
                <Modal show={showModal} onHide={handleClose} backdrop="static">
                    <Modal.Header closeButton>
                        <Modal.Title>
                            {editItem ? "Sửa chuyên khoa" : "Thêm chuyên khoa mới"}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <Form.Group className="mb-3">
                                <Form.Label>Tên chuyên khoa</Form.Label>
                                <Form.Control
                                    type="text"
                                    {...register("name", { required: true })}
                                />
                                {errors.name && (
                                    <p className="text-danger">Tên không được để trống</p>
                                )}
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Mô tả</Form.Label>
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
