import { Nav } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../app/providers/AuthProvider";
import ROLES from "../../constants/roles";

function Sidebar() {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    return (
        <div
            style={{
                width: "220px",
                minHeight: "100vh",
                backgroundColor: "#2c3e50",
                color: "white",
                padding: "20px 10px",
                display: "flex",
                flexDirection: "column",
            }}
        >
            {}
            <h5 className="text-center text-white mb-1">MASS</h5>
            <p className="text-center text-secondary mb-4" style={{ fontSize: "12px" }}>
                {user?.role}
            </p>
            <hr style={{ borderColor: "#555" }} />

            <Nav className="flex-column gap-1">
                {}
                {user?.role === ROLES.ADMIN && (
                    <>
                        <Nav.Link as={Link} to="/admin/dashboard" className="text-white">
                            Dashboard
                        </Nav.Link>
                        <Nav.Link as={Link} to="/admin/specialties" className="text-white">
                            Quản lý Chuyên khoa
                        </Nav.Link>
                        <Nav.Link as={Link} to="/admin/doctors" className="text-white">
                            Quản lý Bác sĩ
                        </Nav.Link>
                        <Nav.Link as={Link} to="/admin/users" className="text-white">
                            Quản lý Người dùng
                        </Nav.Link>
                        <Nav.Link as={Link} to="/admin/clinic" className="text-white">
                            Quản lý Phòng khám
                        </Nav.Link>
                        <Nav.Link as={Link} to="/admin/statistics" className="text-white">
                            Thống kê báo cáo
                        </Nav.Link>
                    </>
                )}

                {}
                {user?.role === ROLES.DOCTOR && (
                    <>
                        <Nav.Link as={Link} to="/doctor/dashboard" className="text-white">
                            📋 Dashboard
                        </Nav.Link>
                        <Nav.Link as={Link} to="/doctor/schedule" className="text-white">
                            📅 Lịch làm việc
                        </Nav.Link>
                        <Nav.Link as={Link} to="/doctor/appointments" className="text-white">
                            📝 Danh sách hẹn
                        </Nav.Link>
                    </>
                )}
            </Nav>

            {}
            <div className="mt-auto">
                <hr style={{ borderColor: "#555" }} />
                <p className="text-center text-secondary" style={{ fontSize: "13px" }}>
                    {user?.fullName}
                </p>
                <button
                    className="btn btn-outline-light btn-sm w-100"
                    onClick={handleLogout}
                >
                    Đăng xuất
                </button>
            </div>
        </div>
    );
}

export default Sidebar;
