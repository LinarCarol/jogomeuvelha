
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const mysql = require('mysql2');

const app = express();
const server = http.createServer(app);
const io = new socketIO.Server(server, {
    cors: { origin: "*" } // Permite conexões de qualquer origem (apenas para desenvolvimento)
});

// Servir arquivos estáticos (como a interface front-end)
app.use(express.static('public'));

// Configuração de conexão com o banco de dados MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',       // Substitua pelo seu usuário do MySQL
    password: '',       // Substitua pela sua senha do MySQL, se houver
    database: 'jogo_da_velha'
});

db.connect((err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err);
        return;
    }
    console.log('Conectado ao banco de dados MySQL');
});

// Comunicação em tempo real com Socket.IO
io.on('connection', (socket) => {
    console.log('Um jogador conectou:', socket.id);

    // Evento de entrada em uma sala com código específico
    socket.on("joinRoom", (roomCode) => {
        socket.join(roomCode);
        console.log(`Jogador ${socket.id} entrou na sala ${roomCode}`);
        
        // Carrega o estado do jogo para a sala, se houver
        loadGameState(roomCode, (err, gameState) => {
            if (!err && gameState) {
                socket.emit("loadGameState", gameState);
            }
        });
    });

    // Evento de jogada e retransmissão para os outros jogadores na sala
    socket.on("playMove", ({ roomCode, boxIndex, playerSign }) => {
        // Envia a jogada para todos os outros jogadores na sala
        socket.to(roomCode).emit("receiveMove", { boxIndex, playerSign });
        
        // Salva a jogada no banco de dados
        saveMove(roomCode, boxIndex, playerSign);
    });

    // Evento de desconexão
    socket.on("disconnect", () => {
        console.log("Jogador desconectado:", socket.id);
    });
});

// Função para salvar a jogada no banco de dados
function saveMove(roomCode, boxIndex, playerSign) {
    const query = `INSERT INTO moves (room_code, box_index, player_sign) VALUES (?, ?, ?)`;
    db.query(query, [roomCode, boxIndex, playerSign], (err) => {
        if (err) {
            console.error('Erro ao salvar a jogada:', err);
        } else {
            console.log('Jogada salva no banco de dados');
        }
    });
}

// Função para carregar o estado atual do jogo a partir do banco de dados
function loadGameState(roomCode, callback) {
    const query = `SELECT box_index, player_sign FROM moves WHERE room_code = ?`;
    db.query(query, [roomCode], (err, results) => {
        if (err) {
            console.error('Erro ao carregar o estado do jogo:', err);
            callback(err, null);
        } else {
            // Preenche o tabuleiro com as jogadas salvas
            const gameState = Array(9).fill(null);
            results.forEach(row => {
                gameState[row.box_index] = row.player_sign;
            });
            callback(null, gameState);
        }
    });
}

// Iniciar o servidor na porta configurada
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
