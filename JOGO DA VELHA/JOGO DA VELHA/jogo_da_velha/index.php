
 <!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="/jogo_da_velha/public/css/style.css">
    <title>Jogo da Velha Multiplayer</title>
</head>
<body>

    <div class="room-box">
        <header>Bem-vindo!</header>
        <div class="content">
            <button id="enter-room">Criar Sala</button>
            <button id="codigo-room">Usar Código</button>
        </div>
    </div>

    <div class="code-input-box hide">
        <header>Código da Sala</header>
        <form>
            <input type="text" id="room-code-input" placeholder="Digite o código" required />
            <button id="submit-code">Entrar na sala</button>
        </form>
    </div>

    <script src="/jogo_da_velha/public/js/script.js"></script>
</body>
</html>