/**
 * Główny moduł zarządzający interfejsem użytkownika i komunikacją z API.
 * @module Main
 */

import { AudioPlayer } from './player.js';

// Inicjalizacja silnika odtwarzacza
AudioPlayer.init();

const API_URL = 'api.php'; 

// Pobranie referencji do elementów DOM
const searchInput = document.getElementById('searchInput');
const genreSelect = document.getElementById('genreSelect');
const songListContainer = document.getElementById('songList');

/**
 * Pobiera dane z API na podstawie aktualnych filtrów.
 * Wykorzystuje Fetch API i asynchroniczność (async/await).
 */
async function fetchSongs() {
    const searchQuery = searchInput.value;
    const genre = genreSelect.value;
    
    // Budowanie bezpiecznego adresu URL z parametrami
    const url = new URL(API_URL, window.location.href);
    if (searchQuery) url.searchParams.append('search', searchQuery);
    if (genre) url.searchParams.append('genre', genre);

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Problem z odpowiedzią serwera');
        
        const data = await response.json();
        
        // Obsługa różnych formatów odpowiedzi z API
        const songs = data.results ? data.results : data;
        renderSongs(songs);
        
    } catch (error) {
        console.error("Błąd połączenia z API:", error);
        songListContainer.innerHTML = '<p>Brak połączenia z serwerem.</p>';
    }
}

/**
 * Renderuje listę utworów w kontenerze HTML.
 * Wykorzystuje createElement dla zapewnienia bezpieczeństwa XSS.
 * @param {Array} songs - Tablica obiektów z danymi utworów.
 */
function renderSongs(songs) {
    // Czyszczenie listy przed nowym renderowaniem
    songListContainer.innerHTML = ''; 

    if (songs.length === 0) {
        const p = document.createElement('p');
        p.classList.add('loading');
        p.textContent = 'Nie znaleziono utworów dla tego filtra.';
        songListContainer.appendChild(p);
        return;
    }

    songs.forEach(song => {
        const card = document.createElement('article');
        card.className = 'song-card';
        
        const tags = song.tags ? song.tags.join(', ') : '';

        // Budowanie szablonu karty przy użyciu Template Literals
        card.innerHTML = `
            <img src="${song.cover_url || 'https://placehold.co/60x60/222/666?text=🎵'}" alt="Okładka" loading="lazy">
            <div class="song-details">
                <h3>${song.title}</h3>
                <p>${song.author} | Licencja: ${song.license || 'CC0'}</p>
                <div class="song-tags">#${tags.replace(/, /g, ' #')}</div>
            </div>
            <button class="play-track-btn" aria-label="Odtwórz">▶</button>
        `;

        // Obsługa kliknięcia przycisku odtwarzania
        const playBtn = card.querySelector('.play-track-btn');
        playBtn.addEventListener('click', () => {
            AudioPlayer.playTrack(song);
        });

        songListContainer.appendChild(card);
    });
}

/**
 * Podpięcie zdarzeń wejściowych (Event Listeners)
 * Realizuje wyszukiwanie w czasie rzeczywistym.
 */
searchInput.addEventListener('input', () => fetchSongs());
genreSelect.addEventListener('change', () => fetchSongs());

// Pierwsze wywołanie funkcji przy załadowaniu strony
fetchSongs();
