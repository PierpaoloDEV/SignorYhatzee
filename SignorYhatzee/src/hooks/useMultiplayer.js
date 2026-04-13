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

  const onStateUpdateRef = useRef(null);
  const onActionReceiveRef = useRef(null);

  useEffect(() => {
    const newSocket = io(BACKEND_URL);
    setSocket(newSocket);

    newSocket.on('connect', () => setIsConnected(true));
    newSocket.on('disconnect', () => setIsConnected(false));

    newSocket.on('room_created', ({ code }) => {
      setRoomCode(code);
      setIsHost(true);
    });

    newSocket.on('joined_successfully', ({ code, players }) => {
      setRoomCode(code);
      setPlayers(players);
      setIsHost(false);
    });

    // In caso di migrazione host o disconnessioni
    newSocket.on('room_updated', ({ players, hostId }) => {
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
      // Pulisci l'errore dopo un po' se non è bloccante
      if (message.includes('disconnesso') || message.includes('chiuso')) {
         setRoomCode(null);
         setPlayers([]);
         setIsHost(false);
      }
    });

    newSocket.on('state_updated', ({ state }) => {
      if (onStateUpdateRef.current) onStateUpdateRef.current(state);
    });

    newSocket.on('receive_action', ({ action, payload, from }) => {
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
    }
  }, [socket, isHost, roomCode]);

  const sendAction = useCallback((action, payload) => {
    if (socket && roomCode) {
      socket.emit('send_action', { code: roomCode, action, payload });
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

  const setOnStateUpdate = (fn) => { onStateUpdateRef.current = fn; };
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
    setOnStateUpdate,
    setOnActionReceive,
    setError,
    notification,
    socketId: socket?.id
  };
}
