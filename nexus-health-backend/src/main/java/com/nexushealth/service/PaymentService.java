package com.nexushealth.service;

import com.nexushealth.entity.Appointment;
import com.nexushealth.entity.Payment;
import com.nexushealth.entity.enums.AppointmentStatus;
import com.nexushealth.exception.BadRequestException;
import com.nexushealth.exception.ResourceNotFoundException;
import com.nexushealth.repository.AppointmentRepository;
import com.nexushealth.repository.PaymentRepository;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final AppointmentRepository appointmentRepository;
    private final RazorpayClient razorpayClient;

    @Value("${razorpay.key.secret}")
    private String razorpaySecret;

    public PaymentService(PaymentRepository pr, AppointmentRepository ar,
                          @Value("${razorpay.key.id}") String keyId,
                          @Value("${razorpay.key.secret}") String keySecret) throws RazorpayException {
        this.paymentRepository = pr;
        this.appointmentRepository = ar;
        this.razorpayClient = new RazorpayClient(keyId, keySecret);
    }

    @Transactional
    public Map<String, Object> createOrder(UUID appointmentId) {
        Appointment apt = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", appointmentId));

        if (apt.getStatus() != AppointmentStatus.PENDING_PAYMENT) {
            throw new BadRequestException("Appointment is not pending payment");
        }

        try {
            JSONObject orderRequest = new JSONObject();
            // amount in paise (multiply by 100)
            int amountInPaise = apt.getAmount().multiply(new BigDecimal("100")).intValue();
            orderRequest.put("amount", amountInPaise);
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "rcpt_" + apt.getId().toString().substring(0, 8));

            Order razorpayOrder = razorpayClient.orders.create(orderRequest);

            Payment payment = Payment.builder()
                    .appointment(apt)
                    .razorpayOrderId(razorpayOrder.get("id"))
                    .amount(apt.getAmount())
                    .status("CREATED")
                    .build();
            paymentRepository.save(payment);

            Map<String, Object> response = new HashMap<>();
            response.put("orderId", payment.getRazorpayOrderId());
            response.put("amount", amountInPaise);
            response.put("currency", "INR");
            return response;
        } catch (RazorpayException e) {
            throw new RuntimeException("Error creating Razorpay order: " + e.getMessage());
        }
    }

    @Transactional
    public void verifyPayment(Map<String, String> payload) {
        String razorpayOrderId = payload.get("razorpay_order_id");
        String razorpayPaymentId = payload.get("razorpay_payment_id");
        String razorpaySignature = payload.get("razorpay_signature");

        Payment payment = paymentRepository.findByRazorpayOrderId(razorpayOrderId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", "orderId", razorpayOrderId));

        try {
            JSONObject options = new JSONObject();
            options.put("razorpay_order_id", razorpayOrderId);
            options.put("razorpay_payment_id", razorpayPaymentId);
            options.put("razorpay_signature", razorpaySignature);

            boolean isValid = Utils.verifyPaymentSignature(options, razorpaySecret);

            if (isValid) {
                payment.setStatus("SUCCESS");
                payment.setRazorpayPaymentId(razorpayPaymentId);
                payment.setRazorpaySignature(razorpaySignature);
                paymentRepository.save(payment);

                Appointment apt = payment.getAppointment();
                apt.setStatus(AppointmentStatus.CONFIRMED);
                appointmentRepository.save(apt);
            } else {
                payment.setStatus("FAILED");
                paymentRepository.save(payment);
                throw new BadRequestException("Invalid payment signature");
            }
        } catch (RazorpayException e) {
            throw new RuntimeException("Error verifying payment signature: " + e.getMessage());
        }
    }
}
