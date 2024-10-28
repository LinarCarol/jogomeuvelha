<?php
include 'db.php';

$code = $_POST['code'];
$boardState = json_encode($_POST['board']);
$currentTurn = $_POST['turn'];

$stmt = $pdo->prepare("UPDATE rooms SET board_state = :board, current_turn = :turn WHERE code = :code");
$stmt->execute(['board' => $boardState, 'turn' => $currentTurn]);

echo json_encode(['success' => true]);
?>
