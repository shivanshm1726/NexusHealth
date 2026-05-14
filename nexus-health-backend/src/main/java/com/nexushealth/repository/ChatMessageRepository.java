package com.nexushealth.repository;

import com.nexushealth.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, UUID> {
    
    @Query("SELECT m FROM ChatMessage m WHERE (m.sender.id = :user1 AND m.receiver.id = :user2) OR (m.sender.id = :user2 AND m.receiver.id = :user1) ORDER BY m.timestamp ASC")
    List<ChatMessage> findConversation(UUID user1, UUID user2);

    @Modifying
    @Query("DELETE FROM ChatMessage m WHERE (m.sender.id = :user1 AND m.receiver.id = :user2) OR (m.sender.id = :user2 AND m.receiver.id = :user1)")
    void deleteConversation(UUID user1, UUID user2);

    @Query("SELECT CASE WHEN m.sender.id = :userId THEN m.receiver.id ELSE m.sender.id END, MAX(m.timestamp) " +
           "FROM ChatMessage m WHERE m.sender.id = :userId OR m.receiver.id = :userId " +
           "GROUP BY CASE WHEN m.sender.id = :userId THEN m.receiver.id ELSE m.sender.id END " +
           "ORDER BY MAX(m.timestamp) DESC")
    List<Object[]> findConversationPartnersSorted(UUID userId);
}
