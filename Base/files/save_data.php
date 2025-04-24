
<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

$json_file = __DIR__ . '/dados.json';

// Get POST data
$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!$data) {
    echo json_encode(['success' => false, 'error' => 'Invalid JSON data']);
    exit;
}

// Read existing data or create new array
if (file_exists($json_file)) {
    $current_data = json_decode(file_get_contents($json_file), true);
    if (!is_array($current_data)) {
        $current_data = [];
    }
} else {
    $current_data = [];
}

// Add new data
$current_data[] = $data;

// Save updated data
if (file_put_contents($json_file, json_encode($current_data, JSON_PRETTY_PRINT))) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'error' => 'Failed to save data']);
}
?>
