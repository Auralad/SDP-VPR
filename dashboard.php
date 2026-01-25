<?php
//Marius
session_start();

if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
    header("Location:/../controllers/LoginController.php");
    exit;
}

require_once 'db.php';


$stmt = $pdo->prepare("SELECT forename, lastname, bundesland FROM user WHERE uid = ?");
$stmt->execute([$_SESSION['user_id']]);
$user = $stmt->fetch();
?>
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="utf-8">
    <title>Dashboard</title>
</head>
<body>

<h1>Hallo <?= htmlspecialchars($user['forename'] ?? $_SESSION['username']) ?>!</h1>

<p>Du bist eingeloggt.</p>

<ul>
    <li><a href="logout.php">Ausloggen</a></li>
</ul>

</body>
</html>