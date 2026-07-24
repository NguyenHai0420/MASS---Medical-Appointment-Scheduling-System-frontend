import { Form, Button, Card, Container } from "react-bootstrap";
import authService from "../services/auth.service";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");
  const otp = searchParams.get("otp");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }
    try {
      await authService.resetPassword(email, otp, newPassword);
      setSuccess(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      setError("Failed to reset password.");
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
      <Card className="p-4 shadow-sm border rounded-4" style={{ width: "400px" }}>
        <h2 className="text-center mb-4">Set New Password</h2>
        {error && <div className="alert alert-danger p-2 text-center">{error}</div>}
        {success && <div className="alert alert-success p-2 text-center">Password reset successful! Redirecting...</div>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>New Password</Form.Label>
            <Form.Control type="password" minLength={6} required onChange={(e) => setNewPassword(e.target.value)} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Confirm Password</Form.Label>
            <Form.Control type="password" minLength={6} required onChange={(e) => setConfirmPassword(e.target.value)} />
          </Form.Group>
          <Button variant="success" type="submit" className="w-100">Reset Password</Button>
        </Form>
      </Card>
    </Container>
  );
};
export default ResetPassword;
