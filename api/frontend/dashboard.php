<?php
if(!isset($controller) || !$controller->isLoggedIn()) {
    header("Location: login");
    exit();
}
?>

<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <title>Dashboard</title>
</head>
<body>
    <h1>Willkommen, <?php echo htmlspecialchars($_SESSION['username']); ?>!</h1>
    <p>Eingeloggt seit: <?php echo date('d.m.Y H:i:s', $_SESSION['login_time']); ?></p>
    <p>User ID: <?php echo $_SESSION['user_id']; ?></p>
    <a href="?action=logout">Logout</a>
</body>
</html>