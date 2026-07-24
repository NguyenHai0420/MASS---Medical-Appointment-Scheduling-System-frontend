import { useState, useEffect } from "react";
import { Container, Row, Col, Card, Spinner } from "react-bootstrap";
import DashboardLayout from "../../../shared/components/DashboardLayout";
import adminService from "../services/adminService";

const StatCard = ({ icon, label, value, color }) => (
  <Card className="border-0 shadow-sm h-100">
    <Card.Body className="d-flex align-items-center gap-3 p-4">
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 14,
          backgroundColor: color + "20",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 26,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div>
        <div className="text-muted" style={{ fontSize: 13 }}>{label}</div>
        <div className="fw-bold" style={{ fontSize: 28, color }}>
          {value ?? <Spinner animation="border" size="sm" />}
        </div>
      </div>
    </Card.Body>
  </Card>
);

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    adminService
      .getDashboardStats()
      .then((data) => setStats(data))
      .catch(() => setError("Không thể tải dữ liệu thống kê."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout>
      <Container fluid className="py-2">
        {}
        <div className="mb-4">
          <h4 className="fw-bold mb-1">📊 Dashboard Tổng quan</h4>
          <p className="text-muted mb-0" style={{ fontSize: 14 }}>
            Thống kê hệ thống MASS Clinic
          </p>
        </div>

        {error && (
          <div className="alert alert-danger">{error}</div>
        )}

        {}
        <Row className="g-3 mb-4">
          <Col xs={12} sm={6} xl={3}>
            <StatCard
              icon="👨‍⚕️"
              label="Tổng số Bác sĩ"
              value={loading ? null : stats?.totalDoctors}
              color="#0d6efd"
            />
          </Col>
          <Col xs={12} sm={6} xl={3}>
            <StatCard
              icon="🧑‍🤝‍🧑"
              label="Tổng số Bệnh nhân"
              value={loading ? null : stats?.totalPatients}
              color="#198754"
            />
          </Col>
          <Col xs={12} sm={6} xl={3}>
            <StatCard
              icon="📅"
              label="Tổng lịch hẹn"
              value={loading ? null : stats?.totalAppointments}
              color="#fd7e14"
            />
          </Col>
          <Col xs={12} sm={6} xl={3}>
            <StatCard
              icon="🏥"
              label="Chuyên khoa"
              value={loading ? null : stats?.totalSpecialties}
              color="#6f42c1"
            />
          </Col>
        </Row>

        {}
        <Row className="g-3">
          <Col xs={12} sm={6}>
            <Card className="border-0 shadow-sm">
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <p className="text-muted mb-1" style={{ fontSize: 13 }}>Lịch hẹn đang chờ</p>
                    <h3 className="fw-bold text-warning mb-0">
                      {loading ? <Spinner animation="border" size="sm" /> : stats?.pendingAppointments ?? 0}
                    </h3>
                  </div>
                  <span style={{ fontSize: 40 }}>⏳</span>
                </div>
                <div className="mt-3">
                  <div className="d-flex justify-content-between mb-1">
                    <small className="text-muted">Tỷ lệ chờ</small>
                    <small className="text-muted">
                      {stats ? Math.round((stats.pendingAppointments / (stats.totalAppointments || 1)) * 100) : 0}%
                    </small>
                  </div>
                  <div className="progress" style={{ height: 6 }}>
                    <div
                      className="progress-bar bg-warning"
                      style={{
                        width: stats
                          ? `${Math.round((stats.pendingAppointments / (stats.totalAppointments || 1)) * 100)}%`
                          : "0%",
                      }}
                    />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col xs={12} sm={6}>
            <Card className="border-0 shadow-sm">
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <p className="text-muted mb-1" style={{ fontSize: 13 }}>Lịch hẹn hoàn thành</p>
                    <h3 className="fw-bold text-success mb-0">
                      {loading ? <Spinner animation="border" size="sm" /> : stats?.completedAppointments ?? 0}
                    </h3>
                  </div>
                  <span style={{ fontSize: 40 }}>✅</span>
                </div>
                <div className="mt-3">
                  <div className="d-flex justify-content-between mb-1">
                    <small className="text-muted">Tỷ lệ hoàn thành</small>
                    <small className="text-muted">
                      {stats ? Math.round((stats.completedAppointments / (stats.totalAppointments || 1)) * 100) : 0}%
                    </small>
                  </div>
                  <div className="progress" style={{ height: 6 }}>
                    <div
                      className="progress-bar bg-success"
                      style={{
                        width: stats
                          ? `${Math.round((stats.completedAppointments / (stats.totalAppointments || 1)) * 100)}%`
                          : "0%",
                      }}
                    />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {}
        <Row className="g-3 mt-1">
          <Col xs={12}>
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white border-0 pt-3 pb-0">
                <h6 className="fw-bold mb-0">🚀 Truy cập nhanh</h6>
              </Card.Header>
              <Card.Body className="d-flex flex-wrap gap-2 pt-2">
                <a href="/admin/doctors" className="btn btn-outline-primary btn-sm">
                  👨‍⚕️ Quản lý Bác sĩ
                </a>
                <a href="/admin/specialties" className="btn btn-outline-purple btn-sm" style={{ borderColor: "#6f42c1", color: "#6f42c1" }}>
                  🏥 Quản lý Chuyên khoa
                </a>
                <a href="/admin/users" className="btn btn-outline-success btn-sm">
                  👥 Quản lý Người dùng
                </a>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </DashboardLayout>
  );
}
