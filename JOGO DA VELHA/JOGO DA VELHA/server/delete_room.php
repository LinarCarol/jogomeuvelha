<?php
include 'db.php';

$stmt = $pdo->prepare("DELETE FROM rooms WHERE created_at < NOW() - INTERVAL 3 MINUTE");
$stmt->execute();
?>