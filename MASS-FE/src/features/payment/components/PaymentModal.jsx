import React, { useEffect, useState } from 'react';
import { Modal, Spinner, Alert } from 'react-bootstrap';
import { CheckCircleFill, Clipboard2 } from 'react-bootstrap-icons';
import paymentService from '../services/payment.service';

const PaymentModal = ({ show, onHide, appointment, onPaymentSuccess }) => {
  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (show && appointment) {
      fetchPaymentLink();
    }

    return () => {
      if (!show) {
        setPaymentData(null);
        setError('');
        setCopied(false);
      }
    };
  }, [show, appointment]);

  useEffect(() => {
    let intervalId;
    if (show && paymentData && appointment) {
      intervalId = setInterval(async () => {
        try {
          const res = await paymentService.checkStatus(appointment.appointmentId);
          if (res.data === 'WAITING_CHECK_IN' || res.data === 'WAITING_FOR_TURN' || res.data === 'COMPLETED') {
            clearInterval(intervalId);
            if (onPaymentSuccess) {
              onPaymentSuccess();
            }
            onHide();
          }
        } catch (err) {
          console.error("Error polling payment status", err);
        }
      }, 3000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [show, paymentData, appointment, onHide, onPaymentSuccess]);

  const fetchPaymentLink = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await paymentService.createPaymentLink(appointment.appointmentId);
      setPaymentData(res.data);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Không thể tạo link thanh toán. Vui lòng thử lại.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    if (!paymentData?.checkoutUrl) return;
    try {
      await navigator.clipboard.writeText(paymentData.checkoutUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {

    }
  };

  const handleClose = () => {
    setPaymentData(null);
    setError('');
    setCopied(false);
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} centered size="sm">
      <Modal.Header closeButton style={{ borderBottom: '1px solid #f1f5f9' }}>
        <Modal.Title className="appt-modal-title">💳 Thanh toán lịch hẹn</Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-4">
        {}
        {loading && (
          <div className="text-center py-5">
            <Spinner animation="border" style={{ color: '#1b6ca8' }} />
            <p className="mt-3 text-muted" style={{ fontSize: 14 }}>
              Đang tạo link thanh toán PayOS...
            </p>
          </div>
        )}

        {}
        {!loading && error && (
          <>
            <Alert variant="danger" style={{ fontSize: 14 }}>
              {error}
            </Alert>
            <div className="text-center mt-2">
              <button
                className="btn appt-modal-submit text-white px-4"
                onClick={fetchPaymentLink}
              >
                Thử lại
              </button>
            </div>
          </>
        )}

        {}
        {!loading && !error && paymentData && (
          <div className="text-center">
            {}
            <p className="text-muted mb-1" style={{ fontSize: 13 }}>
              Lịch hẹn #{appointment?.appointmentId} – {appointment?.patientName}
            </p>

            {}
            <div className="appt-payment-amount mb-3">
              {paymentData.amount ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(paymentData.amount) : "10000 VND"}
            </div>

            {}
            {paymentData.qrCode && (
              <div className="appt-qr-wrapper mb-3">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(paymentData.qrCode)}&size=220x220`}
                  alt="QR Code thanh toán"
                  className="appt-qr-img"
                />
                <p className="text-muted mt-2" style={{ fontSize: 12 }}>
                  Quét QR để thanh toán qua PayOS
                </p>
              </div>
            )}

            {}
            <div
              className="d-flex align-items-center gap-2 p-2 mb-3 rounded"
              style={{ background: '#f8fafc', border: '1px solid #e2e8f0', fontSize: 12 }}
            >
              <span
                className="text-truncate flex-grow-1 text-start"
                style={{ color: '#475569', maxWidth: '220px' }}
              >
                {paymentData.checkoutUrl}
              </span>
              <button
                className="btn appt-copy-btn d-flex align-items-center gap-1"
                onClick={handleCopyLink}
              >
                {copied ? (
                  <>
                    <CheckCircleFill size={13} color="#16a34a" /> Đã chép
                  </>
                ) : (
                  <>
                    <Clipboard2 size={13} /> Copy
                  </>
                )}
              </button>
            </div>

            {}
            <a
              href={paymentData.checkoutUrl}
              target="_blank"
              rel="noreferrer"
              className="btn appt-modal-submit text-white w-100"
            >
              Mở trang thanh toán →
            </a>

            <p className="text-muted mt-3" style={{ fontSize: 12 }}>
              Sau khi thanh toán thành công, hệ thống sẽ tự động cập nhật trạng thái và gửi email xác nhận.
            </p>
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default PaymentModal;
