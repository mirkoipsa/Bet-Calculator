// ==========================================
// 1. VARIABLES Y SELECTORES
// ==========================================
// Disclaimer y App
const modal = document.getElementById('disclaimer-modal');
const appContainer = document.getElementById('app-container');
const btnAccept = document.getElementById('btn-accept');

// Calculadora
const btnAddQuote = document.getElementById('btn-add-quote');
const quotesContainer = document.getElementById('quotes-container');
const stakeInput = document.getElementById('stake-input');
const displayOdds = document.getElementById('total-odds');
const displayStake = document.getElementById('total-stake');
const displayReturn = document.getElementById('total-return');
const displayNet = document.getElementById('net-profit');

// Modal Destacados (API)
const btnFeatured = document.querySelector('.btn-purple');
const featuredModal = document.getElementById('featured-modal');
const closeFeaturedBtn = document.getElementById('close-featured');
const loadingSpinner = document.getElementById('loading-spinner');
const sportsContainer = document.getElementById('sports-container');
const soccerList = document.getElementById('soccer-list');
const nbaList = document.getElementById('nba-list');
const nflList = document.getElementById('nfl-list');

// ==========================================
// 2. LÓGICA DE INICIO Y DISCLAIMER
// ==========================================
btnAccept.addEventListener('click', () => {
    modal.style.opacity = '0';
    modal.style.transition = 'opacity 0.5s';
    setTimeout(() => {
        modal.style.display = 'none';
        appContainer.style.display = 'flex';
        document.body.style.overflow = 'auto'; 
        quotesContainer.innerHTML = '';
        addQuoteRow(); 
    }, 500);
});

// ==========================================
// 3. LÓGICA DE LA CALCULADORA
// ==========================================
const formatMoney = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

const calculate = () => {
    let stake = parseFloat(stakeInput.value);
    if (isNaN(stake) || stake < 0) stake = 0;

    const quoteInputs = document.querySelectorAll('.quote-value');
    let totalOdds = 1;
    let hasQuotes = false;

    quoteInputs.forEach(input => {
        const val = parseFloat(input.value);
        if (!isNaN(val) && val > 0) {
            totalOdds *= val;
            hasQuotes = true;
        }
    });

    if (!hasQuotes) totalOdds = 0;

    const potentialReturn = stake * totalOdds;
    const netProfit = potentialReturn - stake;

    displayOdds.textContent = hasQuotes ? totalOdds.toFixed(2) : "0.00";
    displayStake.textContent = formatMoney(stake);
    displayReturn.textContent = formatMoney(potentialReturn);
    displayNet.textContent = formatMoney(netProfit);
};

const addQuoteRow = () => {
    const index = quotesContainer.children.length + 1;
    const isFirstRow = index === 1; 

    const row = document.createElement('div');
    row.className = 'quote-row';
    let deleteBtnHTML = isFirstRow ? '' : `<button class="btn-delete" title="Eliminar"><i class="fas fa-times"></i></button>`;

    row.innerHTML = `
        <div>
            <div class="quote-label" style="font-size:0.7rem; color:#9ca3af; margin-bottom:4px;">Cuota ${index}</div>
            <input type="number" class="quote-value" placeholder="1.50" step="0.01">
        </div>
        <div>
            <div style="font-size:0.7rem; color:#9ca3af; margin-bottom:4px;">Descripción (opcional)</div>
            <input type="text" class="quote-desc" placeholder="Ej: Real Madrid gana">
        </div>
        ${deleteBtnHTML}
    `;

    const inputVal = row.querySelector('.quote-value');
    inputVal.addEventListener('input', calculate);

    if (!isFirstRow) {
        const btnDel = row.querySelector('.btn-delete');
        btnDel.addEventListener('click', () => {
            row.remove();      
            renumberRows();    
            calculate();       
        });
    }

    quotesContainer.appendChild(row);
};

const renumberRows = () => {
    const rows = quotesContainer.querySelectorAll('.quote-row');
    rows.forEach((row, idx) => {
        const label = row.querySelector('.quote-label');
        if (label) label.textContent = `Cuota ${idx + 1}`;
    });
};

btnAddQuote.addEventListener('click', addQuoteRow);
stakeInput.addEventListener('input', calculate);

// ==========================================
// 4. LÓGICA DE API AVANZADA CON "CACHÉ" (AHORRO DE DATOS)
// ==========================================

// ¡¡IMPORTANTE!!: Pega aquí tu API KEY
const apiKey = '5a78a92592f702a38bd32fe2c7ff8d2e'; 

// VARIABLES PARA EL CACHÉ (MEMORIA TEMPORAL)
let cachedData = null;       // Aquí guardaremos los datos descargados
let lastFetchTime = 0;       // Aquí guardaremos la hora de la última descarga
const CACHE_DURATION = 3600000; // 3600000 ms = 1 hora. (Cambia esto si quieres más o menos tiempo)

btnFeatured.addEventListener('click', () => {
    featuredModal.style.display = 'flex';
    
    // VERIFICACIÓN DE CACHÉ
    const now = Date.now();
    
    // Si tenemos datos guardados Y ha pasado menos de 1 hora...
    if (cachedData && (now - lastFetchTime < CACHE_DURATION)) {
        console.log("Usando datos guardados (No se gasta API)");
        renderAllSports(cachedData.soccer, cachedData.nba, cachedData.nfl);
    } else {
        console.log("Datos viejos o inexistentes. Descargando nuevos... (Se gasta API)");
        fetchRealOdds();
    }
});

closeFeaturedBtn.addEventListener('click', () => {
    featuredModal.style.display = 'none';
});
featuredModal.addEventListener('click', (e) => {
    if (e.target === featuredModal) featuredModal.style.display = 'none';
});

async function fetchRealOdds() {
    if(apiKey === 'API_KEY') {
        alert("¡Falta la API KEY en script.js!");
        return;
    }

    const baseUrl = 'https://api.the-odds-api.com/v4/sports';
    const soccerLeagues = [
        'soccer_epl', 'soccer_spain_la_liga', 'soccer_italy_serie_a',
        'soccer_germany_bundesliga', 'soccer_france_ligue_one'
    ];

    try {
        loadingSpinner.style.display = 'block';
        sportsContainer.style.display = 'none';
        
        // Limpiamos listas visuales
        soccerList.innerHTML = ''; nbaList.innerHTML = ''; nflList.innerHTML = '';

        // 1. Pedir Fútbol
        const soccerPromises = soccerLeagues.map(leagueKey => 
            fetch(`${baseUrl}/${leagueKey}/odds/?apiKey=${apiKey}&regions=eu&markets=h2h&oddsFormat=decimal`)
                .then(res => res.json())
                .catch(err => [])
        );

        // 2. Pedir NBA y NFL
        const otherSportsPromises = [
            fetch(`${baseUrl}/basketball_nba/odds/?apiKey=${apiKey}&regions=us&markets=h2h&oddsFormat=decimal`).then(r => r.json()),
            fetch(`${baseUrl}/americanfootball_nfl/odds/?apiKey=${apiKey}&regions=us&markets=h2h&oddsFormat=decimal`).then(r => r.json())
        ];

        const [soccerResults, [nbaData, nflData]] = await Promise.all([
            Promise.all(soccerPromises),
            Promise.all(otherSportsPromises)
        ]);

        // Procesar Fútbol
        let topSoccerMatches = [];
        soccerResults.forEach(leagueEvents => {
            if (Array.isArray(leagueEvents) && leagueEvents.length > 0) {
                leagueEvents.sort((a, b) => new Date(a.commence_time) - new Date(b.commence_time));
                topSoccerMatches = topSoccerMatches.concat(leagueEvents.slice(0, 2));
            }
        });
        topSoccerMatches.sort((a, b) => new Date(a.commence_time) - new Date(b.commence_time));

        // GUARDAR EN CACHÉ (MEMORIA)
        cachedData = {
            soccer: topSoccerMatches,
            nba: nbaData,
            nfl: nflData
        };
        lastFetchTime = Date.now(); // Marcamos la hora actual

        // RENDERIZAR
        renderAllSports(topSoccerMatches, nbaData, nflData);

    } catch (error) {
        console.error('Error API:', error);
        loadingSpinner.style.display = 'none';
        sportsContainer.style.display = 'block';
        sportsContainer.innerHTML = '<p style="text-align:center; color:#ef4444;">Error cargando cuotas. Verifica tu API Key.</p>';
    }
}

// Nueva función separada para dibujar (para poder llamarla desde el caché o desde la API)
function renderAllSports(soccer, nba, nfl) {
    loadingSpinner.style.display = 'none';
    sportsContainer.style.display = 'block';
    
    // Limpiamos antes de dibujar por si acaso
    soccerList.innerHTML = ''; 
    nbaList.innerHTML = ''; 
    nflList.innerHTML = '';

    renderOddsList(soccer, soccerList, 10, true);
    renderOddsList(nba, nbaList, 6, false);
    renderOddsList(nfl, nflList, 6, false);
}

function renderOddsList(events, container, limit, canDraw) {
    if (!events || !Array.isArray(events) || events.length === 0) {
        container.innerHTML = '<p style="font-size:0.8rem; color:#6b7280; font-style:italic;">No hay cuotas disponibles.</p>';
        return;
    }

    const limitedEvents = events.slice(0, limit);

    limitedEvents.forEach(event => {
        const bookmakers = event.bookmakers;
        if(!bookmakers || bookmakers.length === 0) return;

        const outcomes = bookmakers[0].markets[0].outcomes;
        const homeOdd = outcomes.find(o => o.name === event.home_team)?.price || 0;
        const awayOdd = outcomes.find(o => o.name === event.away_team)?.price || 0;
        const drawOdd = canDraw ? (outcomes.find(o => o.name === 'Draw')?.price || 0) : null;

        const dateObj = new Date(event.commence_time);
        const dateStr = dateObj.toLocaleDateString();
        const timeStr = dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

        const matchCard = document.createElement('div');
        matchCard.className = 'match-card';
        matchCard.style.cursor = 'default'; 
        matchCard.style.flexDirection = 'column'; 
        matchCard.style.alignItems = 'stretch';

        let drawButtonHTML = '';
        if (canDraw && drawOdd) {
            drawButtonHTML = `<button class="btn-odd-select" onclick="selectOdd('${event.home_team} vs ${event.away_team} (Empate)', ${drawOdd})">Empate ${drawOdd}</button>`;
        }

        matchCard.innerHTML = `
            <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                <div style="font-weight:600; font-size:0.9rem;">
                    <span style="color:var(--accent-purple); font-size:0.7rem; display:block; margin-bottom:2px;">${event.sport_title.replace('Soccer ', '')}</span>
                    ${event.home_team} vs ${event.away_team}
                </div>
                <div style="font-size:0.7rem; color:#9ca3af; text-align:right;">
                    <div>${dateStr}</div>
                    <div>${timeStr}</div>
                </div>
            </div>
            <div style="display:flex; gap:10px;">
                <button class="btn-odd-select" onclick="selectOdd('${event.home_team} gana', ${homeOdd})">
                    ${event.home_team} <span style="color:var(--accent-green); font-weight:bold;">${homeOdd}</span>
                </button>
                ${drawButtonHTML}
                <button class="btn-odd-select" onclick="selectOdd('${event.away_team} gana', ${awayOdd})">
                    ${event.away_team} <span style="color:var(--accent-green); font-weight:bold;">${awayOdd}</span>
                </button>
            </div>
        `;

        container.appendChild(matchCard);
    });
}

window.selectOdd = function(desc, odd) {
    featuredModal.style.display = 'none';
    addQuoteRow();
    
    const rows = document.querySelectorAll('.quote-row');
    const lastRow = rows[rows.length - 1];
    
    lastRow.querySelector('.quote-desc').value = desc;
    lastRow.querySelector('.quote-value').value = odd; 
    lastRow.querySelector('.quote-value').dispatchEvent(new Event('input'));
}

// ==========================================
// 5. LÓGICA DEL MODAL DE INFO / SOBRE NOSOTROS
// ==========================================

const btnInfo = document.getElementById('btn-info');
const infoModal = document.getElementById('info-modal');
const closeInfoBtn = document.getElementById('close-info');

// Abrir Modal
btnInfo.addEventListener('click', () => {
    infoModal.style.display = 'flex';
});

// Cerrar con el botón X
closeInfoBtn.addEventListener('click', () => {
    infoModal.style.display = 'none';
});

// Cerrar si se da click fuera del contenido (en el fondo oscuro)
infoModal.addEventListener('click', (e) => {
    if (e.target === infoModal) {
        infoModal.style.display = 'none';
    }
});