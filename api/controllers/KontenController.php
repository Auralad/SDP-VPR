<?php
//mika
class KontenController {
    
    private $db;
    private $hardCodedUID=1;
    public function __construct($db) { $this->db = $db; }


    public function getAll() {
        $stmt = $this->db->prepare("SELECT * FROM konten WHERE uid = :uid");
        $stmt->execute([":uid" => $this->hardCodedUID]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
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
