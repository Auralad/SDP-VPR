<?php

require_once __DIR__ . "/../config/db.php";
require_once __DIR__ . "/../controllers/KontenController.php";

$db = (new DB())->connect();
$controller = new KontenController($db);

switch ($_SERVER["REQUEST_METHOD"]) {
    case "GET":
        echo json_encode($controller->getAll());
        break;

    case "POST":
        $data = json_decode(file_get_contents("php://input"), true);
        echo json_encode($controller->create($data));
        break;

    default:
        echo json_encode(["error" => "Method not allowed"]);
}
