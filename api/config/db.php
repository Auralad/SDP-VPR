<?php

class DB {
    private $host = "localhost";
    private $db   = "ezfinanzes";
    private $user = "root";
    private $pass = "root";

    public function connect() {
        try {
            $pdo = new PDO(
                "mysql:host={$this->host};dbname={$this->db};charset=utf8",
                $this->user,
                $this->pass
            );
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            return $pdo;

        } catch (PDOException $e) {
            die(json_encode(["error" => $e->getMessage()]));
        }
    }
}
