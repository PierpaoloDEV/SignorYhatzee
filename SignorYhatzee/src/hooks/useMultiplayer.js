import { useState, useEffect, useCallback, useRef } from 'react';
import io from 'socket.io-client';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

export function useMultiplayer() {
  const [socket, setSocket] = useState(null);
  const [roomCode, setRoomCode] = useState(null);
  const [players, setPlayers] = useState([]);
  const [isHost, setIsHost] = useState(false);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notification, setNotification] = useState(null);

  // Invece di ref+callback, esponiamo lo stato direttamente
  const [lastReceivedState, setLastReceivedState] = useState(null);
  const [lastReceivedAction, setLastReceivedAction] = useState(null);

  // Ref per le callback (fallback legacy, mantenuto per compatibilita')
  const onActionReceiveRef = useRef(null);

  useEffect(() => {
    const newSocket = io(BACKEND_URL);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('[MP] Connected, socket.id:', newSocket.id);
      setIsConnected(true);
    });
    newSocket.on('disconnect', () => {
      console.log('[MP] Disconnected');
      setIsConnected(false);
    });

    newSocket.on('room_created', ({ code }) => {
      console.log('[MP] Room created:', code);
      setRoomCode(code);
      setIsHost(true);
    });

    newSocket.on('joined_successfully', ({ code, players }) => {
      console.log('[MP] Joined room:', code, 'players:', players);
      setRoomCode(code);
      setPlayers(players);
      setIsHost(false);
    });

    newSocket.on('room_updated', ({ players, hostId }) => {
      console.log('[MP] Room updated, hostId:', hostId, 'my id:', newSocket.id);
      setPlayers(players);
      if (hostId) {
        setIsHost(hostId === newSocket.id);
      }
    });

    newSocket.on('new_host', ({ message }) => {
      setIsHost(true);
      setNotification(message);
      setTimeout(() => setNotification(null), 5000);
    });

    newSocket.on('kicked', ({ message }) => {
      setRoomCode(null);
      setPlayers([]);
      setIsHost(false);
      setError(message);
    });

    newSocket.on('error_message', ({ message }) => {
      setError(message);
      if (message.includes('disconnesso') || message.includes('chiuso')) {
        setRoomCode(null);
        setPlayers([]);
        setIsHost(false);
      }
    });

    // Stato ricevuto dall'host: lo salviamo come stato React
    newSocket.on('state_updated', ({ state }) => {
      console.log('[MP] state_updated received, setup:', state?.setup, 'player:', state?.player, 'playerIds:', state?.playerIds);
      setLastReceivedState(state);
    });

    // Azione ricevuta (solo host)
    newSocket.on('receive_action', ({ action, payload, from }) => {
      console.log('[MP HOST] receive_action:', action, 'from:', from);
      // Aggiorniamo lo stato per triggerare useEffect nel gameState
      setLastReceivedAction({ action, payload, from, ts: Date.now() });
      // Chiamiamo anche il ref per compatibilita' legacy
      if (onActionReceiveRef.current) onActionReceiveRef.current({ action, payload, from });
    });

    return () => newSocket.close();
  }, []);

  const hostRoom = useCallback((playerName) => {
    if (socket) socket.emit('host_room', { playerName });
  }, [socket]);

  const joinRoom = useCallback((code, playerName) => {
    if (socket) socket.emit('join_room', { code, playerName });
  }, [socket]);

  const leaveRoom = useCallback(() => {
    if (socket && roomCode) {
      socket.emit('leave_room', { code: roomCode });
      setRoomCode(null);
      setPlayers([]);
      setIsHost(false);
    }
  }, [socket, roomCode]);

  const syncState = useCallback((state) => {
    if (socket && isHost && roomCode) {
      socket.emit('sync_state', { code: roomCode, state });
    } else {
      console.warn('[MP] syncState SKIPPED | socket:', !!socket, '| isHost:', isHost, '| roomCode:', roomCode);
    }
  }, [socket, isHost, roomCode]);


  const sendAction = useCallback((action, payload) => {
    if (socket && roomCode) {
      console.log('[MP GUEST] sendAction:', action, 'roomCode:', roomCode);
      socket.emit('send_action', { code: roomCode, action, payload });
    } else {
      console.warn('[MP GUEST] sendAction SKIPPED - socket:', !!socket, 'roomCode:', roomCode);
    }
  }, [socket, roomCode]);

  const kickPlayer = useCallback((targetId) => {
    if (socket && isHost && roomCode) {
      socket.emit('kick_player', { code: roomCode, targetId });
    }
  }, [socket, isHost, roomCode]);

  const closeRoom = useCallback(() => {
    if (socket && isHost && roomCode) {
      socket.emit('close_room', { code: roomCode });
    }
  }, [socket, isHost, roomCode]);

  const setOnActionReceive = (fn) => { onActionReceiveRef.current = fn; };

  return {
    isConnected,
    roomCode,
    players,
    isHost,
    error,
    hostRoom,
    joinRoom,
    syncState,
    sendAction,
    kickPlayer,
    closeRoom,
    leaveRoom,
    setOnActionReceive,
    setError,
    notification,
    socketId: socket?.id,
    lastReceivedState,
    lastReceivedAction,
  };
}
