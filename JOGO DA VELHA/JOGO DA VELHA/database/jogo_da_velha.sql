USE jogo_da_velha;

CREATE TABLE rooms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(6) UNIQUE NOT NULL,
    board_state TEXT NOT NULL DEFAULT '["", "", "", "", "", "", "", "", ""]',
    current_turn CHAR(1) DEFAULT 'X',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE moves (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_code VARCHAR(10) NOT NULL,
    box_index INT NOT NULL,
    player_sign CHAR(1) NOT NULL
);
