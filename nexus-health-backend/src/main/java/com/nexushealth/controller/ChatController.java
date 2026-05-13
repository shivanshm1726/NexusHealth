package com.nexushealth.controller;

import com.nexushealth.entity.ChatMessage;
import com.nexushealth.entity.User;
import com.nexushealth.repository.ChatMessageRepository;
import com.nexushealth.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
public class ChatController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;

    public ChatController(SimpMessagingTemplate messagingTemplate, ChatMessageRepository chatMessageRepository, UserRepository userRepository) {
        this.messagingTemplate = messagingTemplate;
        this.chatMessageRepository = chatMessageRepository;
        this.userRepository = userRepository;
    }

    @MessageMapping("/chat")
    public void processMessage(@Payload Map<String, String> payload, Principal principal) {
        String senderEmail = principal.getName();
        User sender = userRepository.findByEmail(senderEmail).orElseThrow();
        User receiver = userRepository.findById(UUID.fromString(payload.get("receiverId"))).orElseThrow();

        ChatMessage chatMessage = ChatMessage.builder()
                .sender(sender)
                .receiver(receiver)
                .content(payload.get("content"))
                .build();
        
        chatMessageRepository.save(chatMessage);

        Map<String, String> response = new HashMap<>();
        response.put("id", chatMessage.getId().toString());
        response.put("senderId", sender.getId().toString());
        response.put("receiverId", receiver.getId().toString());
        response.put("content", chatMessage.getContent());
        response.put("timestamp", chatMessage.getTimestamp().toString());

        // Send to receiver
        messagingTemplate.convertAndSendToUser(
                receiver.getEmail(), "/queue/messages", response);
        // Send to sender so their client updates reliably
        messagingTemplate.convertAndSendToUser(
                sender.getEmail(), "/queue/messages", response);
    }

    @GetMapping("/chat/history/{receiverId}")
    public ResponseEntity<List<Map<String, String>>> getChatHistory(@PathVariable UUID receiverId, Principal principal) {
        User sender = userRepository.findByEmail(principal.getName()).orElseThrow();
        List<ChatMessage> messages = chatMessageRepository.findConversation(sender.getId(), receiverId);
        
        List<Map<String, String>> response = messages.stream().map(m -> {
            Map<String, String> map = new HashMap<>();
            map.put("id", m.getId().toString());
            map.put("senderId", m.getSender().getId().toString());
            map.put("receiverId", m.getReceiver().getId().toString());
            map.put("content", m.getContent());
            map.put("timestamp", m.getTimestamp().toString());
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/chat/users/{role}")
    public ResponseEntity<List<Map<String, String>>> getUsersByRole(@PathVariable String role) {
        List<User> users = userRepository.findAll().stream()
                .filter(u -> u.getRole().name().equalsIgnoreCase(role))
                .collect(Collectors.toList());

        List<Map<String, String>> response = users.stream().map(u -> {
            Map<String, String> map = new HashMap<>();
            map.put("id", u.getId().toString());
            map.put("fullName", u.getFullName());
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }
}
