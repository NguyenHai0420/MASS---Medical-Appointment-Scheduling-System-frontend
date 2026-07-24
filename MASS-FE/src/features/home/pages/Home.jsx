import React, { useContext } from 'react';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../app/providers/AuthProvider';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  return (
    <>
      <div className="bg-light py-5">
        <Container>
          <Row className="align-items-center">
            <Col md={6}>
              <h1 className="display-4 fw-bold">Chăm sóc sức khỏe toàn diện</h1>
              <p className="lead text-muted">
                Đặt lịch khám bệnh với các chuyên gia y tế hàng đầu dễ dàng và nhanh chóng qua MASS Clinic.
              </p>
              <div className="d-flex gap-3">
                {(!user || user.role === 'ROLE_PATIENT') && (
                  <Button variant="primary" size="lg" onClick={() => navigate('/doctors')}>
                    Đặt lịch ngay
                  </Button>
                )}
                {!user && (
                  <Button variant="outline-primary" size="lg" onClick={() => navigate('/register')}>
                    Đăng ký
                  </Button>
                )}
              </div>
            </Col>
            <Col md={6} className="text-center mt-4 mt-md-0">
              {}
              <div className="bg-secondary rounded text-white d-flex align-items-center justify-content-center shadow-sm" style={{ height: '300px' }}>
                <h3>MASS Clinic Banner</h3>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      <Container className="py-5">
        <h2 className="text-center mb-4 fw-bold">Dịch vụ của chúng tôi</h2>
        <Row>
          <Col md={4} className="mb-4">
            <Card className="h-100 shadow-sm border-0 bg-light">
              <Card.Body className="text-center p-4">
                <i className="bi bi-person-badge text-primary mb-3" style={{ fontSize: "3rem" }}></i>
                <Card.Title className="fw-bold">Đội ngũ bác sĩ chuyên môn cao</Card.Title>
                <Card.Text className="text-muted">
                  Các bác sĩ tại MASS Clinic đều có nhiều năm kinh nghiệm trong nghề.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4} className="mb-4">
            <Card className="h-100 shadow-sm border-0 bg-light">
              <Card.Body className="text-center p-4">
                <i className="bi bi-calendar-check text-success mb-3" style={{ fontSize: "3rem" }}></i>
                <Card.Title className="fw-bold">Đặt lịch dễ dàng</Card.Title>
                <Card.Text className="text-muted">
                  Hệ thống cho phép bạn tra cứu và chọn lịch hẹn khám phù hợp nhất với thời gian của mình.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4} className="mb-4">
            <Card className="h-100 shadow-sm border-0 bg-light">
              <Card.Body className="text-center p-4">
                <i className="bi bi-credit-card text-info mb-3" style={{ fontSize: "3rem" }}></i>
                <Card.Title className="fw-bold">Thanh toán tiện lợi</Card.Title>
                <Card.Text className="text-muted">
                  Hỗ trợ nhiều phương thức thanh toán nhanh chóng, an toàn.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Home;
