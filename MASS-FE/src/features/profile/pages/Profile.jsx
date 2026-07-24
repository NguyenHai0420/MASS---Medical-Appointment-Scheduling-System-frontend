import React, { useContext } from "react";
import { AuthContext } from "../../../app/providers/AuthProvider";
import PatientProfile from "./PatientProfile";
import DoctorProfile from "./DoctorProfile";
import BaseProfileForm from "../components/BaseProfileForm";
import { Container, Row, Col } from "react-bootstrap";

const Profile = () => {
  const { user } = useContext(AuthContext);

  if (!user) {
    return null;
  }

  if (user.role === "ROLE_PATIENT") {
    return <PatientProfile />;
  }

  if (user.role === "ROLE_DOCTOR") {
    return <DoctorProfile />;
  }

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8}>
          <BaseProfileForm />
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;
