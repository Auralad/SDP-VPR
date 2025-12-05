<?php

class UsersController {

    private $db;
    public function __construct($db) { $this->db = $db; }

    public function getAll() {
        return $this->db->query("SELECT * FROM user")->fetchAll(PDO::FETCH_ASSOC);
    }

    public function create($data) {
        $stmt = $this->db->prepare("
            INSERT INTO user (forename, lastname, bundesland, birth, username, password)
            VALUES (:forename, :lastname, :bundesland, :birth, :username, :password)
        ");
        $stmt->execute([
            ":forename" => $data["forename"],
            ":lastname" => $data["lastname"],
            ":bundesland" => $data["bundesland"],
            ":birth" => $data["birth"],
            ":username" => $data["username"],
            ":password" => $data["password"] // DU sagtest: keine Verschlüsselung notwendig
        ]);
        return ["message" => "User created"];
    }
}
