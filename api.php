<?php
// ============================================================
// api.php — Unibot REST API
// Full CRUD for: students, admins, attendance, seating, results
//
// Usage:
//   GET    /api.php?table=students           → list all
//   GET    /api.php?table=students&id=1      → get by id
//   POST   /api.php?table=students           → create
//   PUT    /api.php?table=students&id=1      → update
//   DELETE /api.php?table=students&id=1      → delete
// ============================================================

require_once 'db.php';

// --- CORS & JSON headers ---
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

// --- Router ---
$method = $_SERVER['REQUEST_METHOD'];
$table  = strtolower($_GET['table'] ?? '');
$id     = isset($_GET['id']) ? (int) $_GET['id'] : null;
$body   = json_decode(file_get_contents('php://input'), true) ?? [];
$db     = getDB();

// Allowed tables whitelist (security)
$allowed = ['students', 'admins', 'attendance', 'seating', 'results'];
if (!in_array($table, $allowed, true)) {
    respond(400, ['error' => "Invalid table. Allowed: " . implode(', ', $allowed)]);
}

// --- Dispatch ---
match ($method) {
    'GET'    => handleGet($db, $table, $id),
    'POST'   => handlePost($db, $table, $body),
    'PUT'    => handlePut($db, $table, $id, $body),
    'DELETE' => handleDelete($db, $table, $id),
    default  => respond(405, ['error' => 'Method not allowed']),
};

// ============================================================
// GET — Read
// ============================================================
function handleGet(mysqli $db, string $table, ?int $id): void {
    if ($id !== null) {
        $stmt = $db->prepare("SELECT * FROM `{$table}` WHERE id = ?");
        $stmt->bind_param('i', $id);
        $stmt->execute();
        $row = $stmt->get_result()->fetch_assoc();
        if (!$row) respond(404, ['error' => 'Record not found']);
        respond(200, $row);
    }

    // Optional filters via query params
    $where   = '';
    $params  = [];
    $types   = '';

    // Table-specific filter support
    if ($table === 'attendance') {
        if (!empty($_GET['student_id'])) {
            $where   = ' WHERE student_id = ?';
            $params  = [(int)$_GET['student_id']];
            $types   = 'i';
        } elseif (!empty($_GET['date'])) {
            $where   = ' WHERE date = ?';
            $params  = [$_GET['date']];
            $types   = 's';
        }
    } elseif ($table === 'results') {
        if (!empty($_GET['student_id'])) {
            $where   = ' WHERE student_id = ?';
            $params  = [(int)$_GET['student_id']];
            $types   = 'i';
        }
    } elseif ($table === 'students') {
        if (!empty($_GET['register_no'])) {
            $where   = ' WHERE register_no = ?';
            $params  = [$_GET['register_no']];
            $types   = 's';
        }
    }

    // Default fetch-all for other tables (e.g., seating)
    if ($table === 'seating') {
        $sql = "SELECT s.*, st.name, st.register_no 
                FROM seating s 
                JOIN students st ON s.student_id = st.id" . $where;
    } else {
        $sql = "SELECT * FROM `{$table}`" . $where;
    }

    $stmt = $db->prepare($sql);
    if ($types) {
        $stmt->bind_param($types, ...$params);
    }
    $stmt->execute();
    $rows = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    respond(200, ['data' => $rows, 'count' => count($rows)]);
}


// ============================================================
// POST — Create
// ============================================================
function handlePost(mysqli $db, string $table, array $body): void {
    switch ($table) {
        case 'students':
            required($body, ['name','phone','register_no','email']);
            $stmt = $db->prepare(
                "INSERT INTO students (name, phone, register_no, email, face_images, approved)
                 VALUES (?, ?, ?, ?, ?, ?)"
            );
            $approved = (int)($body['approved'] ?? 0);
            $faces    = $body['face_images'] ?? null;
            $stmt->bind_param('sssss i',
                $body['name'], $body['phone'], $body['register_no'],
                $body['email'], $faces, $approved
            );
            break;

        case 'admins':
            required($body, ['name','phone','email','password']);
            $hash = hash('sha256', $body['password']);
            $stmt = $db->prepare(
                "INSERT INTO admins (name, phone, email, password) VALUES (?, ?, ?, ?)"
            );
            $stmt->bind_param('ssss', $body['name'], $body['phone'], $body['email'], $hash);
            break;

        case 'attendance':
            required($body, ['student_id','date','status']);
            $stmt = $db->prepare(
                "INSERT INTO attendance (student_id, date, status) VALUES (?, ?, ?)
                 ON DUPLICATE KEY UPDATE status = VALUES(status)"
            );
            $stmt->bind_param('iss', $body['student_id'], $body['date'], $body['status']);
            break;

        case 'seating':
            required($body, ['student_id','seat_number']);
            $stmt = $db->prepare(
                "INSERT INTO seating (student_id, seat_number) VALUES (?, ?)
                 ON DUPLICATE KEY UPDATE seat_number = VALUES(seat_number)"
            );
            $stmt->bind_param('ii', $body['student_id'], $body['seat_number']);
            break;

        case 'results':
            required($body, ['student_id','subject','marks','exam_date']);
            $max  = $body['max_marks'] ?? 100;
            $stmt = $db->prepare(
                "INSERT INTO results (student_id, subject, marks, max_marks, exam_date) VALUES (?, ?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE marks = VALUES(marks), max_marks = VALUES(max_marks)"
            );
            $stmt->bind_param('isiis',
                $body['student_id'], $body['subject'],
                $body['marks'], $max, $body['exam_date']
            );
            break;
    }

    if (!$stmt->execute()) {
        respond(409, ['error' => $db->error]);
    }
    respond(201, ['message' => 'Created successfully', 'id' => $db->insert_id]);
}

// ============================================================
// PUT — Update
// ============================================================
function handlePut(mysqli $db, string $table, ?int $id, array $body): void {
    if (!$id) respond(400, ['error' => 'id is required for update']);

    switch ($table) {
        case 'students':
            $fields = buildUpdateFields($body, ['name','phone','register_no','email','face_images','approved']);
            if (!$fields['sql']) respond(400, ['error' => 'No valid fields to update']);
            $stmt = $db->prepare("UPDATE students SET {$fields['sql']} WHERE id = ?");
            $fields['types'] .= 'i';
            $fields['values'][] = $id;
            $stmt->bind_param($fields['types'], ...$fields['values']);
            break;

        case 'admins':
            $fields = buildUpdateFields($body, ['name','phone','email']);
            if (!empty($body['password'])) {
                $hash = hash('sha256', $body['password']);
                $fields['sql']    .= ($fields['sql'] ? ', ' : '') . 'password = ?';
                $fields['types']  .= 's';
                $fields['values'][] = $hash;
            }
            if (!$fields['sql']) respond(400, ['error' => 'No valid fields to update']);
            $stmt = $db->prepare("UPDATE admins SET {$fields['sql']} WHERE id = ?");
            $fields['types'] .= 'i';
            $fields['values'][] = $id;
            $stmt->bind_param($fields['types'], ...$fields['values']);
            break;

        case 'attendance':
            $fields = buildUpdateFields($body, ['student_id','date','status']);
            if (!$fields['sql']) respond(400, ['error' => 'No valid fields to update']);
            $stmt = $db->prepare("UPDATE attendance SET {$fields['sql']} WHERE id = ?");
            $fields['types'] .= 'i';
            $fields['values'][] = $id;
            $stmt->bind_param($fields['types'], ...$fields['values']);
            break;

        case 'seating':
            $fields = buildUpdateFields($body, ['student_id','seat_number']);
            if (!$fields['sql']) respond(400, ['error' => 'No valid fields to update']);
            $stmt = $db->prepare("UPDATE seating SET {$fields['sql']} WHERE id = ?");
            $fields['types'] .= 'i';
            $fields['values'][] = $id;
            $stmt->bind_param($fields['types'], ...$fields['values']);
            break;

        case 'results':
            $fields = buildUpdateFields($body, ['student_id','subject','marks','max_marks','exam_date']);
            if (!$fields['sql']) respond(400, ['error' => 'No valid fields to update']);
            $stmt = $db->prepare("UPDATE results SET {$fields['sql']} WHERE id = ?");
            $fields['types'] .= 'i';
            $fields['values'][] = $id;
            $stmt->bind_param($fields['types'], ...$fields['values']);
            break;
    }

    $stmt->execute();
    if ($stmt->affected_rows === 0) {
        respond(404, ['error' => 'Record not found or no changes made']);
    }
    respond(200, ['message' => 'Updated successfully']);
}

// ============================================================
// DELETE — Delete
// ============================================================
function handleDelete(mysqli $db, string $table, ?int $id): void {
    if ($id) {
        $stmt = $db->prepare("DELETE FROM `{$table}` WHERE id = ?");
        $stmt->bind_param('i', $id);
    } else {
        // Clear entire table
        $stmt = $db->prepare("DELETE FROM `{$table}`");
    }
    
    $stmt->execute();
    respond(200, ['message' => $id ? 'Deleted successfully' : 'Table cleared successfully', 'affected' => $db->affected_rows]);
}

// ============================================================
// HELPERS
// ============================================================

/** Send JSON response and exit */
function respond(int $code, array $payload): never {
    http_response_code($code);
    echo json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    exit;
}

/** Assert required body fields */
function required(array $body, array $fields): void {
    foreach ($fields as $f) {
        if (!isset($body[$f]) || $body[$f] === '') {
            respond(400, ['error' => "Missing required field: {$f}"]);
        }
    }
}

/**
 * Build dynamic SET clause for UPDATE
 * Returns ['sql'=>string, 'types'=>string, 'values'=>array]
 */
function buildUpdateFields(array $body, array $allowed): array {
    $parts  = [];
    $types  = '';
    $values = [];

    // Map field → mysqli type
    $intFields = ['student_id','seat_number','marks','max_marks','approved'];

    foreach ($allowed as $field) {
        if (!array_key_exists($field, $body)) continue;
        $parts[]  = "`{$field}` = ?";
        $types   .= in_array($field, $intFields, true) ? 'i' : 's';
        $values[] = in_array($field, $intFields, true) ? (int)$body[$field] : $body[$field];
    }

    return ['sql' => implode(', ', $parts), 'types' => $types, 'values' => $values];
}
