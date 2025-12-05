<?php

class TransaktionenController {

    private $db;
    public function __construct($db) { $this->db = $db; }

    public function getAll() {
        return $this->db->query("SELECT * FROM transaktionen")->fetchAll(PDO::FETCH_ASSOC);
    }

    public function create($data) {
        $stmt = $this->db->prepare("
            INSERT INTO transaktionen 
            (from_kid, from_extern, to_kid, to_extern, trans_value, trans_date, trans_message)
            VALUES
            (:from_kid, :from_extern, :to_kid, :to_extern, :trans_value, :trans_date, :trans_message)
        ");
        $stmt->execute([
            ":from_kid" => $data["from_kid"],
            ":from_extern" => $data["from_extern"],
            ":to_kid" => $data["to_kid"],
            ":to_extern" => $data["to_extern"],
            ":trans_value" => $data["trans_value"],
            ":trans_date" => $data["trans_date"],
            ":trans_message" => $data["trans_message"]
        ]);
        return ["message" => "Transaktion created"];
    }
}
