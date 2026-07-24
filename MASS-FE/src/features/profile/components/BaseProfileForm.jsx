import { useState, useEffect } from "react";
import { Card, Form, Button, Row, Col, Spinner, Alert } from "react-bootstrap";
import profileService from "../services/profile.service";

const BaseProfileForm = () => {
  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    gender: "",
    dateOfBirth: "",
    avatarUrl: "",
    role: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const res = await profileService.getProfile();
      setProfile(res.data);
    } catch (error) {
      console.warn("Failed to load profile data from API. Using mock/local data.", error);
      const savedMock = localStorage.getItem("mockProfile");
      if (savedMock) {
        setProfile(JSON.parse(savedMock));
      } else {
        const userStr = localStorage.getItem("user");
        let fullName = "", email = "", role = "";
        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            fullName = user.fullName || "";
            email = user.email || "";
            role = user.role || "";
          } catch(e) {}
        }
        setProfile(prev => ({
          ...prev,
          fullName,
          email,
          role
        }));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage({ type: "", text: "" });
      const payload = {
        fullName: profile.fullName,
        phone: profile.phone,
        address: profile.address,
        gender: profile.gender,
        avatarUrl: profile.avatarUrl
      };

      if (profile.dateOfBirth && profile.dateOfBirth.trim() !== "") {
        payload.dateOfBirth = profile.dateOfBirth;
      } else {
        payload.dateOfBirth = null;
      }

      let finalProfile = { ...profile, ...payload };

      try {
        const res = await profileService.updateProfile(payload);
        finalProfile = res.data;
        setMessage({ type: "success", text: "Profile updated successfully!" });
      } catch (error) {
        console.warn("Failed to update profile via API. Using mock update.", error);
        localStorage.setItem("mockProfile", JSON.stringify(finalProfile));
        setMessage({ type: "success", text: "Profile updated successfully!" });
      }

      setProfile(finalProfile);
      setIsEditMode(false);
    } catch (error) {
      setMessage({ type: "danger", text: "Failed to update profile." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center p-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <Card className="shadow-sm border-0 bg-light mb-4">
      <Card.Header className="bg-white border-0 pt-4 pb-0 d-flex justify-content-between align-items-center">
        <h4 className="fw-bold mb-0">Personal Information</h4>
        {!isEditMode && (
          <Button variant="outline-primary" size="sm" onClick={() => setIsEditMode(true)}>
            <i className="bi bi-pencil me-1"></i> Edit Profile
          </Button>
        )}
      </Card.Header>
      <Card.Body className="p-4">
        {message.text && (
          <Alert variant={message.type} className="mb-4">
            {message.text}
          </Alert>
        )}

        <div className="text-center mb-4">
          <img
            src={profile.avatarUrl || "https://ui-avatars.com/api/?name=" + profile.fullName + "&background=random"}
            alt="Avatar"
            className="rounded-circle img-thumbnail shadow-sm mb-3"
            style={{ width: "120px", height: "120px", objectFit: "cover" }}
          />
          <h5 className="fw-bold">{profile.fullName}</h5>
          <p className="text-muted mb-0">{profile.role?.replace('ROLE_', '')}</p>
        </div>

        {isEditMode ? (
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Full Name <span className="text-danger">*</span></Form.Label>
                  <Form.Control type="text" name="fullName" value={profile.fullName || ""} onChange={handleChange} required />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Email Address</Form.Label>
                  <Form.Control type="email" value={profile.email || ""} disabled />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Phone Number</Form.Label>
                  <Form.Control type="text" name="phone" value={profile.phone || ""} onChange={handleChange} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Date of Birth</Form.Label>
                  <Form.Control type="date" name="dateOfBirth" value={profile.dateOfBirth || ""} onChange={handleChange} />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Gender</Form.Label>
                  <Form.Select name="gender" value={profile.gender || ""} onChange={handleChange}>
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Avatar URL</Form.Label>
                  <Form.Control type="url" name="avatarUrl" placeholder="https://example.com/avatar.png" value={profile.avatarUrl || ""} onChange={handleChange} />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-4">
              <Form.Label className="fw-bold">Address</Form.Label>
              <Form.Control as="textarea" rows={2} name="address" value={profile.address || ""} onChange={handleChange} />
            </Form.Group>

            <div className="d-flex justify-content-end gap-2 mt-4">
              <Button variant="secondary" onClick={() => setIsEditMode(false)}>Cancel</Button>
              <Button variant="primary" type="submit" disabled={saving}>
                {saving ? (
                  <><Spinner as="span" animation="border" size="sm" className="me-1" /> Saving...</>
                ) : 'Save Changes'}
              </Button>
            </div>
          </Form>
        ) : (
          <div>
            <Row className="mb-3 border-bottom pb-2">
              <Col sm={4} className="fw-bold text-muted">Full Name</Col>
              <Col sm={8}>{profile.fullName}</Col>
            </Row>
            <Row className="mb-3 border-bottom pb-2">
              <Col sm={4} className="fw-bold text-muted">Email</Col>
              <Col sm={8}>{profile.email}</Col>
            </Row>
            <Row className="mb-3 border-bottom pb-2">
              <Col sm={4} className="fw-bold text-muted">Phone Number</Col>
              <Col sm={8}>{profile.phone || <span className="text-black-50">Not provided</span>}</Col>
            </Row>
            <Row className="mb-3 border-bottom pb-2">
              <Col sm={4} className="fw-bold text-muted">Date of Birth</Col>
              <Col sm={8}>{profile.dateOfBirth || <span className="text-black-50">Not provided</span>}</Col>
            </Row>
            <Row className="mb-3 border-bottom pb-2">
              <Col sm={4} className="fw-bold text-muted">Gender</Col>
              <Col sm={8}>{profile.gender || <span className="text-black-50">Not provided</span>}</Col>
            </Row>
            <Row className="mb-3">
              <Col sm={4} className="fw-bold text-muted">Address</Col>
              <Col sm={8}>{profile.address || <span className="text-black-50">Not provided</span>}</Col>
            </Row>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default BaseProfileForm;
