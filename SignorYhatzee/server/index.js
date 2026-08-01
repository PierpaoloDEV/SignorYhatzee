import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const rooms = new Map(); // RoomCode -> { hostId, players: [{id, name}] }

function generateRoomCode() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // --- HOSTING ---
  socket.on('host_room', ({ playerName }) => {
    let code;
    do {
      code = generateRoomCode();
    } while (rooms.has(code));

    rooms.set(code, {
      hostId: socket.id,
      players: [{ id: socket.id, name: playerName.trim() }]
    });

    socket.join(code);
    socket.emit('room_created', { code });
  });

  // --- JOINING ---
  socket.on('join_room', ({ code, playerName }) => {
    const room = rooms.get(code);
    if (!room) {
      socket.emit('error_message', { message: 'Stanza non trovata!' });
      return;
    }

    const cleanName = playerName.trim();

    // Gestione Riconnessione/Sostituzione Sessione
    const existingPlayerIndex = room.players.findIndex(p => p.name.toLowerCase() === cleanName.toLowerCase());

    if (existingPlayerIndex !== -1) {
      const existingPlayer = room.players[existingPlayerIndex];
      // Se è lo stesso socket, non fare nulla
      if (existingPlayer.id === socket.id) {
        socket.emit('joined_successfully', { code, players: room.players });
        return;
      }

      // Se è un nuovo socket con lo stesso nome, sostituisci il vecchio (Session Hijacking sicuro)
      console.log(`Replacing session for ${cleanName}: ${existingPlayer.id} -> ${socket.id}`);
      room.players[existingPlayerIndex].id = socket.id;

      // Se il vecchio era l'host, aggiorna l'hostId
      if (room.hostId === existingPlayer.id) {
        room.hostId = socket.id;
      }
    } else {
      // Nuovo giocatore unico
      if (room.players.length >= 8) {
        socket.emit('error_message', { message: 'Stanza piena!' });
        return;
      }
      room.players.push({ id: socket.id, name: cleanName });
    }

    socket.join(code);
    io.to(code).emit('room_updated', { players: room.players, hostId: room.hostId });
    socket.emit('joined_successfully', { code, players: room.players });
  });

  // rest of the code...
  socket.on('leave_room', ({ code }) => {
    const room = rooms.get(code);
    if (room) {
      room.players = room.players.filter(p => p.id !== socket.id);
      socket.leave(code);

      if (room.hostId === socket.id && room.players.length > 0) {
        const nextHost = room.players[0];
        room.hostId = nextHost.id;
        io.to(nextHost.id).emit('new_host', { message: 'L\'host è uscito. Ora sei tu l\'Host!' });
      } else if (room.hostId === socket.id) {
        rooms.delete(code);
      }
      io.to(code).emit('room_updated', { players: room.players, hostId: room.hostId });
    }
  });

  socket.on('kick_player', ({ code, targetId }) => {
    const room = rooms.get(code);
    if (room && room.hostId === socket.id) {
      const targetSocket = io.sockets.sockets.get(targetId);
      if (targetSocket) {
        targetSocket.leave(code);
        targetSocket.emit('kicked', { message: 'Sei stato rimosso dalla partita dall\'host.' });
      }
      room.players = room.players.filter(p => p.id !== targetId);
      io.to(code).emit('room_updated', { players: room.players, hostId: room.hostId });
    }
  });

  socket.on('close_room', ({ code }) => {
    const room = rooms.get(code);
    if (room && room.hostId === socket.id) {
      io.to(code).emit('kicked', { message: 'L\'host ha chiuso la partita.' });
      rooms.delete(code);
    }
  });

  socket.on('sync_state', ({ code, state }) => {
    const room = rooms.get(code);
    if (room && room.hostId === socket.id) {
      socket.to(code).emit('state_updated', { state });
    }
  });

  socket.on('send_action', ({ code, action, payload }) => {
    const room = rooms.get(code);
    if (room) {
      io.to(room.hostId).emit('receive_action', { action, payload, from: socket.id });
    }
  });

  socket.on('disconnect', () => {
    for (const [code, room] of rooms.entries()) {
      const playerIndex = room.players.findIndex(p => p.id === socket.id);
      if (playerIndex !== -1) {
        // Non rimuoviamo subito per permettere ricaricamento pagina? 
        // No, meglio rimuovere per evitare fantasmi, la sostituzione sessione gestisce il resto.
        room.players.splice(playerIndex, 1);
        if (room.hostId === socket.id && room.players.length > 0) {
          const nextHost = room.players[0];
          room.hostId = nextHost.id;
          io.to(nextHost.id).emit('new_host', { message: 'L\'host si è disconnesso. Ora sei tu l\'Host!' });
        } else if (room.hostId === socket.id) {
          rooms.delete(code);
        }
        io.to(code).emit('room_updated', { players: room.players, hostId: room.hostId });
      }
    }
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
