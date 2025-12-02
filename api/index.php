<?php

header("Content-Type: application/json");

$route = $_GET["route"] ?? "";

// Falls kein route übergeben → nichts machen
if ($route === "") {
    echo json_encode(["error" => "No route specified"]);
    exit;
}

// absolute Pfade – Windows-sicher
$base = __DIR__;

$routes = [
    "users"         => $base . "/routes/users.php",
    "konten"        => $base . "/routes/konten.php",
    "externe"       => $base . "/routes/externe.php",
    "transaktionen" => $base . "/routes/transaktionen.php",
];

// existiert die Route?
if (array_key_exists($route, $routes)) {
    require $routes[$route];
} else {
    echo json_encode(["error" => "Route not found"]);
}
