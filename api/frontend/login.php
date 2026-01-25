<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <title>Login</title>
    <style>
        .container { max-width: 400px; margin: 50px auto; padding: 20px; }
        .error { color: #dc3545; background: #f8d7da; border: 1px solid #f5c6cb; padding: 10px; margin-bottom: 15px; border-radius: 4px; }
        .form-group { margin-bottom: 15px; }
        label { display: block; margin-bottom: 5px; }
        input[type="text"], input[type="password"] { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
        button { background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; }
        button:hover { background: #0056b3; }
    </style>
</head>
<body>
    <div class="container">
        <h2>Login</h2>
        
        <?php if(isset($errors) && !empty($errors)): ?>
            <div class="error">
                <?php foreach($errors as $error): ?>
                    <p><?php echo htmlspecialchars($error); ?></p>
                <?php endforeach; ?>
            </div>
        <?php endif; ?>
        
        <form method="POST" action="<?php echo htmlspecialchars($_SERVER['PHP_SELF']); ?>?action=login">
            <div class="form-group">
                <label for="username">Benutzername</label>
            <input type="text" name="username" id="username" required autofocus
                value="<?= htmlspecialchars($_POST['username'] ?? '') ?>">

            <label for="password">Passwort</label>
            <input type="password" name="password" id="password" required>

            <button type="submit">Einloggen</button>
        </form>
    </div>
</body>
</html>