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

    @Query(value = "SELECT partner_id, last_msg FROM (" +
           "  SELECT CASE WHEN sender_id = :userId THEN receiver_id ELSE sender_id END AS partner_id, " +
           "         MAX(timestamp) AS last_msg " +
           "  FROM chat_messages " +
           "  WHERE sender_id = :userId OR receiver_id = :userId " +
           "  GROUP BY partner_id" +
           ") sub ORDER BY last_msg DESC", nativeQuery = true)
    List<Object[]> findConversationPartnersSorted(UUID userId);
}
