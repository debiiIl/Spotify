<?php
/**
 * Serwerowe API do obsługi bazy utworów muzycznych.
 * Odpowiada za wczytywanie pliku JSON, filtrowanie danych oraz pagynację.
 */

// Ustawienie nagłówków dla formatu JSON oraz obsługa CORS
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

// Ścieżka do pliku bazy danych
$jsonPath = __DIR__ . '/database/songs.json';

// Sprawdzenie integralności bazy danych przed operacjami
if (!file_exists($jsonPath)) {
    echo json_encode(['error' => 'Baza danych nie istnieje.']);
    exit;
}

// Odczyt i dekodowanie danych do tablicy asocjacyjnej
$jsonString = file_get_contents($jsonPath);
$data = json_decode($jsonString, true);
$songs = $data['songs'] ?? [];

// Pobranie i normalizacja parametrów zapytania (Query Params)
$searchQuery  = mb_strtolower($_GET['search'] ?? '');
$filterGenre  = mb_strtolower($_GET['genre'] ?? '');

/**
 * Logika filtrowania utworów (array_filter)
 * Sprawdza dopasowanie frazy w tytule, autorze oraz tagach.
 */
$filteredSongs = array_filter($songs, function($song) use ($searchQuery, $filterGenre) {
    
    // Filtrowanie tekstowe
    if ($searchQuery !== '') {
        $titleMatch = str_contains(mb_strtolower($song['title']), $searchQuery);
        $authorMatch = str_contains(mb_strtolower($song['author']), $searchQuery);
        $tagsMatch = false;

        foreach ($song['tags'] as $tag) {
            if (str_contains(mb_strtolower($tag), $searchQuery)) {
                $tagsMatch = true;
                break;
            }
        }
        
        if (!$titleMatch && !$authorMatch && !$tagsMatch) return false;
    }

    // Filtrowanie po gatunku
    if ($filterGenre !== '') {
        $lowerGenres = array_map('mb_strtolower', $song['genre']);
        if (!in_array($filterGenre, $lowerGenres)) return false;
    }

    return true; 
});

// Resetowanie indeksów tablicy i konwersja na format JSON
$filteredSongs = array_values($filteredSongs);

// Zwrócenie czystej tablicy utworów do klienta
echo json_encode($filteredSongs, JSON_UNESCAPED_UNICODE);
?>
