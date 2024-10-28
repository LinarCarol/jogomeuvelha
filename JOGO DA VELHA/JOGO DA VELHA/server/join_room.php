<?php
include 'db.php';

$code = $_POST['code'];
$stmt = $pdo->prepare("SELECT * FROM rooms WHERE code = :code");
$stmt->execute(['code' => $code]);
$room = $stmt->fetch(PDO::FETCH_ASSOC);

if ($room) {
    echo json_encode(['success' => true, 'state' => json_decode($room['board_state']), 'turn' => $room['current_turn']]);
} else {
    echo json_encode(['success' => false, 'message' => 'Sala não encontrada.']);
}
?>
