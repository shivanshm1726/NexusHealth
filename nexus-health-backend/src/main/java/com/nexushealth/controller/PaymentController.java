package com.nexushealth.controller;

import com.nexushealth.service.PaymentService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/payments")
public class PaymentController {

    private final PaymentService paymentService;

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @GetMapping("/config")
    public ResponseEntity<Map<String, String>> getConfig() {
        // Only return the public key ID to the frontend
        return ResponseEntity.ok(Map.of("keyId", razorpayKeyId));
    }

    @PostMapping("/create-order")
    public ResponseEntity<Map<String, Object>> createOrder(@RequestBody Map<String, String> body) {
        UUID appointmentId = UUID.fromString(body.get("appointmentId"));
        return ResponseEntity.ok(paymentService.createOrder(appointmentId));
    }

    @PostMapping("/verify")
    public ResponseEntity<Map<String, String>> verifyPayment(@RequestBody Map<String, String> body) {
        paymentService.verifyPayment(body);
        return ResponseEntity.ok(Map.of("message", "Payment verified successfully"));
    }
}
