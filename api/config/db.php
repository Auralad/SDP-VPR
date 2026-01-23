<?php

class DB {
   private $host = "mysql.pb.bib.de";
    private $db   = "pbd2h24asu";
    private $user = "pbd2h24asu";
    private $pass = "2Sj2PyUSvLtW";

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

