package com.nexushealth.controller;

import com.nexushealth.entity.ChatMessage;
import com.nexushealth.entity.User;
import com.nexushealth.repository.ChatMessageRepository;
import com.nexushealth.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.*;
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

    /**
     * Returns patients sorted by most recent message.
     * Patients with no messages appear at the bottom.
     */
    @GetMapping("/chat/users/patient/sorted")
    public ResponseEntity<List<Map<String, Object>>> getPatientsSortedByLastMessage(Principal principal) {
        User currentUser = userRepository.findByEmail(principal.getName()).orElseThrow();

        // Get conversation partners sorted by last message timestamp
        List<Object[]> sorted = chatMessageRepository.findConversationPartnersSorted(currentUser.getId());

        // Build a map of partnerId -> lastMessageTime
        Map<UUID, LocalDateTime> lastMessageMap = new LinkedHashMap<>();
        for (Object[] row : sorted) {
            UUID partnerId = (UUID) row[0];
            LocalDateTime lastMsg = (LocalDateTime) row[1];
            lastMessageMap.put(partnerId, lastMsg);
        }

        // Get all patients
        List<User> allPatients = userRepository.findAll().stream()
                .filter(u -> u.getRole().name().equalsIgnoreCase("PATIENT"))
                .collect(Collectors.toList());

        // Split into patients with messages (sorted) and without
        List<Map<String, Object>> result = new ArrayList<>();

        // First: patients who have messages, sorted by recency
        for (UUID partnerId : lastMessageMap.keySet()) {
            allPatients.stream()
                .filter(p -> p.getId().equals(partnerId))
                .findFirst()
                .ifPresent(p -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", p.getId().toString());
                    map.put("fullName", p.getFullName());
                    map.put("lastMessageTime", lastMessageMap.get(p.getId()).toString());
                    result.add(map);
                });
        }

        // Then: patients with no messages
        Set<UUID> withMessages = lastMessageMap.keySet();
        allPatients.stream()
            .filter(p -> !withMessages.contains(p.getId()))
            .forEach(p -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", p.getId().toString());
                map.put("fullName", p.getFullName());
                map.put("lastMessageTime", null);
                result.add(map);
            });

        return ResponseEntity.ok(result);
    }

    @DeleteMapping("/chat/conversation/{partnerId}")
    @Transactional
    public ResponseEntity<Map<String, String>> deleteConversation(@PathVariable UUID partnerId, Principal principal) {
        User currentUser = userRepository.findByEmail(principal.getName()).orElseThrow();
        chatMessageRepository.deleteConversation(currentUser.getId(), partnerId);
        return ResponseEntity.ok(Map.of("message", "Conversation deleted successfully"));
    }
}

