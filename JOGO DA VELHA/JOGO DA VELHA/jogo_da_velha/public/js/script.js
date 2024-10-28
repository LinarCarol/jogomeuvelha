const socket = io("http://localhost:3000"); // Substitua pelo IP do servidor se for remoto
let roomCode = null; // Esta variável armazenará o código da sala;

// Seleciona a caixa de seleção de jogadores e outros elementos da interface
const selecBox = document.querySelector(".select-box"),
    playBoard = document.querySelector(".play-board"),
    allBox = document.querySelectorAll("section span"),
    players = document.querySelector(".players"),
    resultBox = document.querySelector(".result-box"),
    wonText = resultBox.querySelector(".won-text"),
    replayBtn = resultBox.querySelector("[data-replay-button]"),
    exitBtn = resultBox.querySelector("[data-exit-button]"),
    playerXScoreElem = document.getElementById("player-x-score"),
    playerOScoreElem = document.getElementById("player-o-score"),
    scoreBoard = document.querySelector(".score-board"),
    roomBox = document.querySelector(".room-box"),
    enterRoomBtn = document.getElementById("enter-room"),
    useCodeBtn = document.getElementById("codigo-room"),
    codeInputBox = document.querySelector(".code-input-box"),
    backToWelcomeBtn = document.getElementById("back-to-welcome"),
    submitCodeBtn = document.getElementById("submit-code"),
    roomCodeInput = document.getElementById("room-code-input"),
    playerXBtn = document.querySelector(".playerX"),
    playerOBtn = document.querySelector(".playerO");

// Variáveis de controle do jogo
let playerSign = "X";
let gameOver = false;
let playerXWins = 0;
let playerOWins = 0;
let lastWinner = null;

// Evento executado quando a página é carregada
window.onload = () => {
    console.log('Página carregada');

    allBox.forEach(box => {
        box.addEventListener('click', () => clickedBox(box));
    });

    enterRoomBtn.onclick = createRoom;
    useCodeBtn.onclick = () => toggleScreens(roomBox, codeInputBox);
    backToWelcomeBtn.onclick = () => toggleScreens(codeInputBox, roomBox);
    playerXBtn.onclick = () => startGameWithPlayer("X", false);
    playerOBtn.onclick = () => startGameWithPlayer("O", true);
    submitCodeBtn.onclick = joinRoomWithCode;
    replayBtn.onclick = resetGame;

    updateScore();
};

// Função para alternar entre telas
function toggleScreens(hideScreen, showScreen) {
    hideScreen.classList.add("hide");
    showScreen.classList.remove("hide");
}

//Cria uma sala nova de jogo
async function createRoom() {
    enterRoomBtn.disabled = true;
    enterRoomBtn.innerHTML = "Criando sala...";
    
    try {
        //faz requisição e cria a sala
        const response = await fetch("/server/create_room.php");
        const data = await response.json();
    
        if (data.code) {
            roomCode = data.code;
            alert(`Sala criada! Código: ${roomCode}`);
            toggleScreens(roomBox, selecBox);
            socket.emit("joinRoom", roomCode);  // Envia um evento para o servidor para entrar na sala
        } else {
            alert("Erro ao criar a sala. Tente novamente.");
        }
    } catch (error) {
        console.error("Erro ao criar sala:", error);
        alert("Erro ao criar a sala. Verifique sua conexão e tente novamente.");
    } finally {
        enterRoomBtn.disabled = false;
        enterRoomBtn.innerHTML = "Criar Sala";
    }
}

// Entra em uma sala existente com o código fornecido
async function joinRoomWithCode(e) {
    e.preventDefault();
    const code = roomCodeInput.value;
    
    try {
        const response = await fetch("/server/join_room.php", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({ code })
        });
        const data = await response.json();

        if (data.success) {
            //entrada da sla bem sucedido
            alert("Entrou na sala!");
            startGame(data.state, data.turn);
            roomCodeInput.value = "";
            toggleScreens(codeInputBox, playBoard);
            scoreBoard.classList.add("show");
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error("Erro ao entrar na sala:", error);
        alert("Erro ao entrar na sala. Tente novamente.");
    }
}

// Inicia o jogo com o jogador escolhido
function startGameWithPlayer(sign, isO) {
    playerSign = sign; //Define o jogador atual
    players.classList.toggle("active", isO);
    toggleScreens(selecBox, playBoard);
    scoreBoard.classList.add("show"); // Mostra o placar
    startGame();
}

// Executado quando uma célula do tabuleiro é clicada
function clickedBox(element) {
    if (gameOver || element.innerHTML !== "") return; // Verifica se o jogo terminou ou se a célula já foi marcada

    const boxIndex = Array.from(allBox).indexOf(element);

     // Marca a célula com o símbolo do jogador atual
    element.innerHTML = `<i class="${playerSign === "X" ? "fas fa-times" : "far fa-circle"}"></i>`;
    element.setAttribute("id", playerSign);
    element.style.pointerEvents = "none";

    // Envia o movimento ao servidor
    socket.emit("playMove", {
        roomCode,
        boxIndex,
        playerSign
    });

    
    // Verifica se há um vencedor
    if (selectWinner()) return;

    togglePlayer();// Alterna para o próximo jogador
    
    // Verifica se o tabuleiro está completo e sem vencedores (empate)
    if (Array.from(allBox).every(box => box.id !== "")) {
        endGame("Empate!");
    }
}

// Alterna o jogador ativo
function togglePlayer() {
    playerSign = playerSign === "X" ? "O" : "X";
    players.classList.toggle("active");
}

// Recebe o movimento do outro jogador pelo servidor
socket.on("receiveMove", ({ boxIndex, playerSign }) => {
    const element = allBox[boxIndex];
    element.innerHTML = `<i class="${playerSign === "X" ? "fas fa-times" : "far fa-circle"}"></i>`;
    element.setAttribute("id", playerSign);
    element.style.pointerEvents = "none";

    if (!selectWinner()) {
        togglePlayer(); // Alterna o jogador caso não haja vencedor
    }
});
// Verifica padrões de vitória no tabuleiro
function selectWinner() {
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];
     // Verifica se algum padrão foi completado pelo jogador atual
    for (const pattern of winPatterns) {
        if (checkClass(...pattern)) {
            gameOver = true;
            lastWinner = playerSign;
            highlightWinningBoxes(pattern, showResult); // Destaca as células vencedoras e mostra o resultado
            return true;
        }
    }
    return false;
}
// Função auxiliar para verificar se as células contêm o mesmo símbolo
function checkClass(val1, val2, val3) {
    return getClass(val1) === playerSign && getClass(val2) === playerSign && getClass(val3) === playerSign;
}
// Retorna o símbolo da célula com o ID fornecido
function getClass(idname) {
    return allBox[idname].id;
}

// Destaca as células vencedoras e chama o callback para exibir o resultado
function highlightWinningBoxes(pattern, callback) {
    pattern.forEach(index => {
        allBox[index].classList.add("win-highlight");
    });
    setTimeout(callback, 1000);
}

// Exibe o resultado do jogo e atualiza o placar
function showResult() {
    playBoard.classList.remove("show");
    resultBox.classList.add("show");
    wonText.innerHTML = `
        <div class="winner-indicator">
            <i class="${lastWinner === 'X' ? 'fas fa-times' : 'far fa-circle'}"></i>
        </div>
        <p class="winner-message">Venceu!</p>`;
    if (lastWinner === "X") playerXWins++;
    else playerOWins++;
    updateScore(); // Atualiza o placar após a vitória
}
// Atualiza o placar exibido na interface
function updateScore() {
    playerXScoreElem.innerHTML = playerXWins;
    playerOScoreElem.innerHTML = playerOWins;
}

// Reinicia o tabuleiro e reseta o estado do jogo
function resetGame() {
    allBox.forEach(box => {
        box.innerHTML = "";
        box.setAttribute("id", "");
        box.classList.remove("win-highlight");
        box.style.pointerEvents = "auto";
    });
    gameOver = false;
    resultBox.classList.remove("show");
    playBoard.classList.add("show");
}

// Inicia o jogo com o estado atual e turno recebidos do servidor
function startGame(state, turn) {
    allBox.forEach((box, index) => {
        if (state[index]) {
            box.innerHTML = `<i class="${state[index] === "X" ? "fas fa-times" : "far fa-circle"}"></i>`;
            box.setAttribute("id", state[index]);
            box.style.pointerEvents = "none";
        }
    });
    playerSign = turn;
    players.classList.toggle("active", playerSign === "O");
    playBoard.classList.add("show");
    scoreBoard.classList.add("show");
}
//finaliza o jogo e exibe uma mensagem

function endGame(message) {
    gameOver = true;
    wonText.innerHTML = message;
    resultBox.classList.add("show");
}
