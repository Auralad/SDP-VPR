<?php

class ExterneController {

    private $db;
    public function __construct($db) { $this->db = $db; }

    public function getAll() {
        return $this->db->query("SELECT * FROM externe_kontakte")->fetchAll(PDO::FETCH_ASSOC);
    }

    public function create($data) {
        $stmt = $this->db->prepare("
            INSERT INTO externe_kontakte (uid, iban, name, bank)
            VALUES (:uid, :iban, :name, :bank)
        ");
        $stmt->execute([
            ":uid" => $data["uid"],
            ":iban" => $data["iban"],
            ":name" => $data["name"],
            ":bank" => $data["bank"]
        ]);
        return ["message" => "Kontakt created"];
    }
}
