<?php



require_once __DIR__ . '/../config/db.php';


class LoginController
{

    private $db;
    public function __construct($db) { $this->db = $db; }


    public function showLogin()
    {
        
        if (isset($_SESSION['user_id'])) {
            header("Location:/../frontend/dashboard.php");
            exit;
        }

        
        $error = $_SESSION['login_error'] ?? '';
        unset($_SESSION['login_error']); 

        require __DIR__ . '/../frontend/login.php';
    }

    public function processLogin()
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            header("Location: login.php");
            exit;
        }

        $username = trim($_POST['username'] ?? '');
        $password = $_POST['password'] ?? '';

        $error = '';

        if ($username === '' || $password === '') {
            $error = 'Bitte beide Felder ausfüllen.';
        } else {
            try {
                $stmt = $this->db->prepare("SELECT uid, username, password FROM user WHERE username = ?");
                $stmt->execute([$username]);
                $user = $stmt->fetch();

                if ($user && password_verify($password, $user['password'])) {
                    $_SESSION['user_id']   = $user['uid'];
                    $_SESSION['username']  = $user['username'];
                    $_SESSION['logged_in'] = true;

                    session_regenerate_id(true);
                    header("Location: dashboard.php");
                    exit;
                } else {
                    $error = 'Falscher Benutzername oder Passwort.';
                }
            } catch (PDOException $e) {
                $error = 'Technischer Fehler – bitte später erneut versuchen.';
                error_log($e->getMessage());
            }
        }

        // Bei Fehler → zurück zum Formular mit Meldung
        $_SESSION['login_error'] = $error;
        header("Location: login.php");
        exit;
    }
}