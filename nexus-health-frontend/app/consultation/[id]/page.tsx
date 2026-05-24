"use client";

import { useEffect, useState, useRef, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import apiClient from "@/lib/api";
import { Loader2, Mic, MicOff, Video, VideoOff, PhoneOff, UserRound, PhoneCall } from "lucide-react";
import AgoraRTC, {
  IAgoraRTCClient,
  IAgoraRTCRemoteUser,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
} from "agora-rtc-sdk-ng";

// Disable Agora logs in production
AgoraRTC.setLogLevel(1);

const APP_ID = process.env.NEXT_PUBLIC_AGORA_APP_ID || "";

export default function ConsultationPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const appointmentId = unwrappedParams.id;
  const { user } = useAuth();
  const router = useRouter();

  const [error, setError] = useState("");
  const [joined, setJoined] = useState(false);
  const [left, setLeft] = useState(false); // tracks if user has left the call

  // Agora state
  const clientRef = useRef<IAgoraRTCClient | null>(null);
  const localVideoTrackRef = useRef<ICameraVideoTrack | null>(null);
  const localAudioTrackRef = useRef<IMicrophoneAudioTrack | null>(null);

  const [remoteUsers, setRemoteUsers] = useState<IAgoraRTCRemoteUser[]>([]);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [localVideoReady, setLocalVideoReady] = useState(false);

  // Core join function — can be called multiple times (initial + rejoin)
  const joinCall = useCallback(async () => {
    if (!user || !APP_ID) return;

    setError("");
    setLeft(false);
    setJoined(false);
    setRemoteUsers([]);
    setLocalVideoReady(false);
    setMicOn(true);
    setCamOn(true);

    try {
      // 1. Fetch a fresh token every time we join
      const res = await apiClient.get(`/consultations/video-token/${appointmentId}`);
      const { token, channelName, uid } = res.data;
      console.log("Token fetched:", { channel: channelName, uid });

      // 2. Create a fresh Agora client
      const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
      clientRef.current = client;

      // 3. Register event handlers BEFORE joining
      client.on("user-published", async (remoteUser: IAgoraRTCRemoteUser, mediaType: "audio" | "video") => {
        console.log(`>>> Remote user published: UID=${remoteUser.uid}, type=${mediaType}`);
        await client.subscribe(remoteUser, mediaType);

        if (mediaType === "video") {
          setRemoteUsers((prev) => {
            const filtered = prev.filter((u) => u.uid !== remoteUser.uid);
            return [...filtered, remoteUser];
          });
        }
        if (mediaType === "audio") {
          remoteUser.audioTrack?.play();
        }
      });

      client.on("user-unpublished", (remoteUser: IAgoraRTCRemoteUser, mediaType: "audio" | "video") => {
        if (mediaType === "video") {
          setRemoteUsers((prev) => prev.filter((u) => u.uid !== remoteUser.uid));
        }
      });

      client.on("user-left", (remoteUser: IAgoraRTCRemoteUser) => {
        setRemoteUsers((prev) => prev.filter((u) => u.uid !== remoteUser.uid));
      });

      client.on("connection-state-change", (curState, prevState) => {
        console.log(`>>> Connection state: ${prevState} -> ${curState}`);
      });

      // 4. Join the channel
      console.log(`Joining channel: ${channelName} with UID: ${uid}`);
      await client.join(APP_ID, channelName, token, uid);
      console.log("✅ Successfully joined Agora channel");

      // 5. Notify doctor that patient has joined
      try {
        await apiClient.post(`/appointments/${appointmentId}/notify-doctor`);
        console.log("Notified doctor successfully");
      } catch (e) {
        console.error("Failed to notify doctor:", e);
      }

      // 6. Create and publish local tracks
      try {
        const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
        localAudioTrackRef.current = audioTrack;
        localVideoTrackRef.current = videoTrack;

        await client.publish([audioTrack, videoTrack]);
        console.log("✅ Published local audio + video tracks");
        setLocalVideoReady(true);
      } catch (mediaErr: any) {
        console.warn("Camera/mic not available, joining without media:", mediaErr.message);
      }

      setJoined(true);
    } catch (err: any) {
      console.error("Failed to join:", err);
      setError("Failed to connect to the video call: " + (err.message || err));
    }
  }, [appointmentId, user]);

  // Auto-join on mount
  useEffect(() => {
    if (!user) return;
    joinCall();

    // Cleanup on unmount
    return () => {
      const cleanup = async () => {
        localAudioTrackRef.current?.close();
        localVideoTrackRef.current?.close();
        localAudioTrackRef.current = null;
        localVideoTrackRef.current = null;
        if (clientRef.current) {
          const state = clientRef.current.connectionState;
          if (state === "CONNECTED" || state === "CONNECTING") {
            await clientRef.current.leave();
          }
          clientRef.current.removeAllListeners();
          clientRef.current = null;
        }
      };
      cleanup();
    };
  }, [user, joinCall]);

  const toggleMic = useCallback(() => {
    if (localAudioTrackRef.current) {
      localAudioTrackRef.current.setMuted(micOn);
      setMicOn(!micOn);
    }
  }, [micOn]);

  const toggleCam = useCallback(() => {
    if (localVideoTrackRef.current) {
      localVideoTrackRef.current.setMuted(camOn);
      setCamOn(!camOn);
    }
  }, [camOn]);

  const leaveCall = useCallback(async () => {
    // Close local tracks
    localAudioTrackRef.current?.close();
    localVideoTrackRef.current?.close();
    localAudioTrackRef.current = null;
    localVideoTrackRef.current = null;

    // Leave Agora channel
    if (clientRef.current?.connectionState === "CONNECTED") {
      await clientRef.current.leave();
    }
    clientRef.current?.removeAllListeners();
    clientRef.current = null;

    // Clear the "patient waiting" flag so doctor's dashboard updates
    try {
      await apiClient.post(`/appointments/${appointmentId}/clear-waiting`);
    } catch (e) {
      // ignore
    }

    // Reset UI state — show the "Rejoin" screen instead of navigating away
    setJoined(false);
    setLeft(true);
    setRemoteUsers([]);
    setLocalVideoReady(false);
  }, [appointmentId]);

  const goBack = useCallback(() => {
    router.back();
  }, [router]);

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-900 text-white">
        <div className="text-center space-y-4">
          <div className="text-red-500 text-xl font-bold">Access Denied</div>
          <p className="text-gray-400">{error}</p>
          <button
            onClick={goBack}
            className="px-6 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Show "Rejoin" screen after leaving the call
  if (left && !joined) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-gray-900 text-white gap-6">
        <div className="text-center space-y-2">
          <PhoneOff className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold">You left the call</h2>
          <p className="text-gray-400">You can rejoin at any time until the appointment is completed.</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={joinCall}
            className="flex items-center gap-2 px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-emerald-900/30 hover:scale-105"
          >
            <PhoneCall className="w-5 h-5" />
            Rejoin Call
          </button>
          <button
            onClick={goBack}
            className="px-8 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-medium transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Loading / connecting state
  if (!joined) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-gray-900 text-white">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500 mb-4" />
        <p className="text-gray-400">Connecting to secure server...</p>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full bg-black overflow-hidden flex flex-col">
      {/* Header */}
      <div className="absolute top-0 w-full p-4 z-10 bg-gradient-to-b from-black/70 to-transparent flex justify-between items-center">
        <div className="text-white font-medium flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
          Secure Telehealth Consultation
        </div>
        <div className="text-sm text-gray-400">
          {remoteUsers.length > 0 ? "🟢 Connected" : "⏳ Waiting for participant..."}
        </div>
      </div>

      {/* Main Video Area (Remote User) */}
      <div className="flex-1 flex items-center justify-center w-full h-full relative">
        {remoteUsers.length > 0 ? (
          remoteUsers.map((remoteUser) => (
            <RemoteVideoPlayer key={remoteUser.uid} user={remoteUser} />
          ))
        ) : (
          <div className="text-gray-400 flex flex-col items-center">
            <Loader2 className="w-12 h-12 animate-spin mb-4 text-gray-600" />
            <p>Waiting for the other person to join...</p>
          </div>
        )}

        {/* Picture-in-Picture Local Video */}
        <div className="absolute bottom-24 right-6 w-48 h-72 bg-gray-800 rounded-xl overflow-hidden shadow-2xl border-2 border-gray-700/50 z-20">
          {localVideoReady && localVideoTrackRef.current ? (
            <LocalVideoPlayer track={localVideoTrackRef.current} camOn={camOn} />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500">
              <VideoOff className="w-8 h-8" />
            </div>
          )}
        </div>
      </div>

      {/* Control Bar */}
      <div className="absolute bottom-0 w-full p-6 bg-gradient-to-t from-black/90 to-transparent z-10">
        <div className="max-w-md mx-auto flex items-center justify-center gap-6">
          <button
            onClick={toggleMic}
            className={`p-4 rounded-full transition-all ${
              micOn ? "bg-gray-800 hover:bg-gray-700 text-white" : "bg-red-500 hover:bg-red-600 text-white"
            }`}
          >
            {micOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
          </button>

          <button
            onClick={leaveCall}
            className="p-5 bg-red-600 hover:bg-red-700 text-white rounded-full transition-all shadow-lg shadow-red-900/50 hover:scale-105"
          >
            <PhoneOff className="w-8 h-8" />
          </button>

          <button
            onClick={toggleCam}
            className={`p-4 rounded-full transition-all ${
              camOn ? "bg-gray-800 hover:bg-gray-700 text-white" : "bg-red-500 hover:bg-red-600 text-white"
            }`}
          >
            {camOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
          </button>
        </div>
      </div>
    </div>
  );
}

// Component to render remote user video
function RemoteVideoPlayer({ user }: { user: IAgoraRTCRemoteUser }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user.videoTrack && containerRef.current) {
      user.videoTrack.play(containerRef.current);
    }
    return () => {
      user.videoTrack?.stop();
    };
  }, [user, user.videoTrack]);

  return (
    <div className="w-full h-full relative">
      <div ref={containerRef} className="w-full h-full" />
      {!user.videoTrack && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/80 text-white">
          <UserRound className="w-24 h-24 mb-4 opacity-50" />
          <p>User has disabled video</p>
        </div>
      )}
    </div>
  );
}

// Component to render local video
function LocalVideoPlayer({ track, camOn }: { track: ICameraVideoTrack; camOn: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (track && containerRef.current) {
      track.play(containerRef.current);
    }
    return () => {
      track?.stop();
    };
  }, [track]);

  return (
    <div className="w-full h-full relative">
      <div ref={containerRef} className="w-full h-full" />
      {!camOn && (
        <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
          <VideoOff className="w-8 h-8 text-gray-500" />
        </div>
      )}
    </div>
  );
}
