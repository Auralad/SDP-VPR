<?php

class KontenController {

    private $db;
    public function __construct($db) { $this->db = $db; }

    public function getAll() {
        return $this->db->query("SELECT * FROM konten")->fetchAll(PDO::FETCH_ASSOC);
    }

    public function create($data) {
        $stmt = $this->db->prepare("
            INSERT INTO konten (uid, balance)
            VALUES (:uid, :balance)
        ");
        $stmt->execute([
            ":uid" => $data["uid"],
            ":balance" => $data["balance"]
        ]);
        return ["message" => "Konto created"];
    }
}
