import { AudioPlayer } from './player.js';

AudioPlayer.init();

const API_URL = 'api.php'; 

// 1. Elementy UI - muszą tu być, żeby renderSongs wiedziało gdzie rysować!
const searchInput = document.getElementById('searchInput');
const genreSelect = document.getElementById('genreSelect');
const songListContainer = document.getElementById('songList');

// 2. Funkcja pobierająca dane
async function fetchSongs() {
    const searchQuery = searchInput.value;
    const genre = genreSelect.value;
    
    const url = new URL(API_URL, window.location.href);
    if (searchQuery) url.searchParams.append('search', searchQuery);
    if (genre) url.searchParams.append('genre', genre);

    try {
        const response = await fetch(url);
        const data = await response.json();
        
        // Sprawdzamy czy PHP zwraca obiekt z .results czy czystą tablicę
        const songs = data.results ? data.results : data;
        renderSongs(songs);
        
    } catch (error) {
        console.error("Błąd połączenia:", error);
        songListContainer.innerHTML = '<p>Brak połączenia z serwerem.</p>';
    }
}

// 3. Dynamiczne generowanie kart utworów na podstawie danych z API
function renderSongs(songs) {
    // 1. Bezpieczne czyszczenie kontenera
    songListContainer.replaceChildren(); 

    // 2. Obsługa braku wyników
    if (songs.length === 0) {
        const p = document.createElement('p');
        p.className = 'loading';
        p.textContent = 'Nie znaleziono utworów dla tego filtra.';
        songListContainer.appendChild(p);
        return;
    }

    // 3. Budowanie kart piosenek klocek po klocku
    songs.forEach(song => {
        const card = document.createElement('article');
        card.className = 'song-card';

        // Obrazek okładki
        const img = document.createElement('img');
        img.src = song.cover_url || 'https://placehold.co/60x60/222/666?text=🎵';
        img.alt = 'Okładka';
        img.loading = 'lazy';

        // Kontener na detale
        const details = document.createElement('div');
        details.className = 'song-details';

        const title = document.createElement('h3');
        title.textContent = song.title;

        const author = document.createElement('p');
        author.textContent = `${song.author} | Licencja: ${song.license || 'CC0'}`;

        const tagsDiv = document.createElement('div');
        tagsDiv.className = 'song-tags';
        const tagsArray = song.tags ? song.tags.join(', ') : '';
        tagsDiv.textContent = tagsArray ? `#${tagsArray.replace(/, /g, ' #')}` : '';

        details.appendChild(title);
        details.appendChild(author);
        details.appendChild(tagsDiv);

        // : Kontener na przyciski akcji ---
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'song-actions'; // Możesz ostylować ten kontener w CSS, żeby przyciski były obok siebie

        // Przycisk Play
        const playBtn = document.createElement('button');
        playBtn.className = 'play-track-btn';
        playBtn.textContent = '▶';
        playBtn.setAttribute('aria-label', `Odtwórz ${song.title}`);

        playBtn.addEventListener('click', () => {
            AudioPlayer.playTrack(song);
        });

        //  Przycisk Pobierania (jako link <a>)
        const downloadBtn = document.createElement('a');
        downloadBtn.className = 'download-track-btn';
        downloadBtn.textContent = '📥'; // Fajna ikonka pobierania
        downloadBtn.href = song.file_url; // Ścieżka do pliku mp3 z bazy JSON
        
        // Atrybuty wymuszające pobieranie i otwieranie w nowym oknie (w razie restrykcji przeglądarki)
        downloadBtn.setAttribute('download', `${song.author} - ${song.title}.mp3`);
        downloadBtn.setAttribute('target', '_blank'); 
        downloadBtn.setAttribute('aria-label', `Pobierz ${song.title}`);

        // Dodajemy przyciski do kontenera akcji
        actionsDiv.appendChild(playBtn);
        actionsDiv.appendChild(downloadBtn);
        // --------------------------------------------------------

        // Składanie całej karty (zamiast playBtn dajemy teraz cały actionsDiv)
        card.appendChild(img);
        card.appendChild(details);
        card.appendChild(actionsDiv);

        // Dodanie karty do listy na stronie
        songListContainer.appendChild(card);
    });
}
