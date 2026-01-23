<?php

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$route = $_GET["route"] ?? "";

if ($route === "") {
    echo json_encode(["error" => "No route specified"]);
    exit;
}

$base = __DIR__;

$routes = [
    "users"         => $base . "/routes/users.php",
    "konten"        => $base . "/routes/konten.php",
    "externe"       => $base . "/routes/externe.php",
    "transaktionen" => $base . "/routes/transaktionen.php",
    "login"         => $base . "/frontend/login.php",
];

if (!array_key_exists($route, $routes)) {
    echo json_encode(["error" => "Route not found"]);
    exit;
}

require $routes[$route];
