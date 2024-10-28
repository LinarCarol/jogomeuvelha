<?php
include 'db.php';

$code = strtoupper(substr(md5(uniqid()), 0, 6));
$stmt = $pdo->prepare("INSERT INTO rooms (code) VALUES (:code)");
$stmt->execute(['code' => $code]);

echo json_encode(['code' => $code]);
?>