<?php

class TransaktionenController {

    private $db;
    public function __construct($db) { $this->db = $db; }

public function getAll() {
    $sql = "
        SELECT 
            t.*,

            /* Absender */
            fu.forename AS from_forename,
            fu.lastname AS from_lastname,
            fe.name     AS from_extern_name,

            /* Empfänger */
            tu.forename AS to_forename,
            tu.lastname AS to_lastname,
            te.name     AS to_extern_name,

            /* Komfort: fertige Anzeigenamen */
            COALESCE(
                CONCAT(fu.forename, ' ', fu.lastname),
                fe.name
            ) AS from_name,

            COALESCE(
                CONCAT(tu.forename, ' ', tu.lastname),
                te.name
            ) AS to_name

        FROM transaktionen t

        LEFT JOIN konten fk ON t.from_kid = fk.kid
        LEFT JOIN `user` fu ON fk.uid = fu.uid
        LEFT JOIN externe_kontakte fe ON t.from_extern = fe.kontaktid

        LEFT JOIN konten tk ON t.to_kid = tk.kid
        LEFT JOIN `user` tu ON tk.uid = tu.uid
        LEFT JOIN externe_kontakte te ON t.to_extern = te.kontaktid
    ";

    return $this->db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
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
        $data['trans_date'] = date('Y-m-d ', time());

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
