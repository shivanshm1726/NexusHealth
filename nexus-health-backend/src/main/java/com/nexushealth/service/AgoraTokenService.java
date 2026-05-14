package com.nexushealth.service;

import io.agora.media.RtcTokenBuilder2;
import io.agora.media.RtcTokenBuilder2.Role;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class AgoraTokenService {

    @Value("${agora.app-id}")
    private String appId;

    @Value("${agora.app-certificate}")
    private String appCertificate;

    // Default expiration time of 2 hours
    private static final int EXPIRATION_TIME_IN_SECONDS = 7200;

    /**
     * Generates an Agora RTC token for joining a video channel.
     * @param channelName The name of the channel (we will use the appointment ID)
     * @param uid The integer UID for the user (we'll hash their UUID into an integer, or just use 0 for string user accounts)
     *            Wait, Agora allows 0 to mean the server doesn't validate the UID.
     * @return The JWT token string
     */
    public String generateToken(String channelName, int uid) {
        RtcTokenBuilder2 tokenBuilder = new RtcTokenBuilder2();
        
        // Use Role.ROLE_PUBLISHER so both doctor and patient can send/receive
        return tokenBuilder.buildTokenWithUid(
                appId, 
                appCertificate, 
                channelName, 
                uid, 
                Role.ROLE_PUBLISHER, 
                EXPIRATION_TIME_IN_SECONDS, 
                EXPIRATION_TIME_IN_SECONDS
        );
    }
}
