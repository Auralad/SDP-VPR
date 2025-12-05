<?php

header("Content-Type: application/json");

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
];

if (!array_key_exists($route, $routes)) {
    echo json_encode(["error" => "Route not found"]);
    exit;
}

require $routes[$route];
