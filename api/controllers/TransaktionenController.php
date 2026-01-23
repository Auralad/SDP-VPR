<?php
//mika
class TransaktionenController {

    private $db;
    private $hardCodedUID=1;
    private $hardCodedKID=[101,106,107];
    public function __construct($db) { $this->db = $db; }

public function getAll() {

    $in = implode(',', array_fill(0, count($this->hardCodedKID), '?'));

    $sql = "
        SELECT t.*,
               fu.forename AS from_forename,
               fu.lastname AS from_lastname,
               fe.name AS from_extern_name,
               tu.forename AS to_forename,
               tu.lastname AS to_lastname,
               te.name AS to_extern_name
        FROM transaktionen t

        LEFT JOIN konten fk ON t.from_kid = fk.kid
        LEFT JOIN user fu ON fk.uid = fu.uid
        LEFT JOIN externe_kontakte fe ON t.from_extern = fe.kontaktid
        LEFT JOIN konten tk ON t.to_kid = tk.kid
        LEFT JOIN user tu ON tk.uid = tu.uid
        LEFT JOIN externe_kontakte te ON t.to_extern = te.kontaktid

        WHERE t.from_kid IN ($in) OR t.to_kid   IN ($in)
        ORDER BY t.trans_date DESC
    ";

    $stmt = $this->db->prepare($sql);

    $stmt->execute([
        ...$this->hardCodedKID,
        ...$this->hardCodedKID
    ]);

    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}
public function searchContacts(string $q) {
    $sql = "
        SELECT
            k.kid        AS id,
            'intern'     AS type,
            CONCAT(u.forename, ' ', u.lastname) AS label
        FROM user u
        JOIN konten k ON k.uid = u.uid
        WHERE u.forename LIKE :q
           OR u.lastname LIKE :q

        UNION ALL

        SELECT
            kontaktid    AS id,
            'extern'     AS type,
            name         AS label
        FROM externe_kontakte
        WHERE name LIKE :q

        ORDER BY label
        LIMIT 10
    ";

    $stmt = $this->db->prepare($sql);
    $stmt->execute(['q' => "%$q%"]);
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

    public function create($data) {

    if (empty($data['from_kid'])) {
        throw new Exception("Kein Absenderkonto angegeben");
    }

    $fromKid = (int)$data['from_kid'];

    if (!in_array($fromKid, $this->hardCodedKID, true)) {
        throw new Exception("Ungültiges Absenderkonto");
    }

    if (empty($data['to_kid']) && empty($data['to_extern'])) {
        throw new Exception("Kein Empfänger angegeben");
    }

    $stmt = $this->db->prepare("
        INSERT INTO transaktionen
        (from_kid, from_extern, to_kid, to_extern, trans_value, trans_date, trans_message)
        VALUES
        (:from_kid, NULL, :to_kid, :to_extern, :trans_value, NOW(), :trans_message)
    ");

    $stmt->execute([
        ":from_kid"      => $fromKid,
        ":to_kid"        => $data["to_kid"] ?? null,
        ":to_extern"     => $data["to_extern"] ?? null,
        ":trans_value"   => abs($data["trans_value"]),
        ":trans_message" => $data["trans_message"] ?? null
    ]);

    return ["message" => "Transaktion erstellt"];
}

}
