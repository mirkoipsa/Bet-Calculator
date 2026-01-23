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
        appContainer.style.display = 'block';
        document.body.style.overflow = 'auto'; 
        
        // Iniciar con una fila vacía
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
    
    // Solo poner botón de borrar si NO es la primera fila
    let deleteBtnHTML = isFirstRow ? '' : `<button class="btn-delete" title="Eliminar"><i class="fas fa-times"></i></button>`;

    row.innerHTML = `
        <div>
            <div class="quote-label" style="font-size:0.7rem; color:#9ca3af; margin-bottom:4px;">Cuota ${index}</div>
            <input type="number" class="quote-value" placeholder="1.50" step="0.01">
        </div>
        <div>
            <div style="font-size:0.7rem; color:#9ca3af; margin-bottom:4px;">Descripción (opcional)</div>
            <input type="text" class="quote-desc" placeholder="Ej: Real Madrid vs Barcelona">
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
// 4. LÓGICA DE LA API (DESTACADOS)
// ==========================================

btnFeatured.addEventListener('click', () => {
    featuredModal.style.display = 'flex';
    fetchAllSports();
});

closeFeaturedBtn.addEventListener('click', () => {
    featuredModal.style.display = 'none';
});

featuredModal.addEventListener('click', (e) => {
    if (e.target === featuredModal) featuredModal.style.display = 'none';
});

async function fetchAllSports() {
    const leagues = [
        { id: '4328', name: 'EPL' },        
        { id: '4335', name: 'La Liga' },    
        { id: '4332', name: 'Serie A' },    
        { id: '4331', name: 'Bundesliga' }, 
        { id: '4334', name: 'Ligue 1' }     
    ];

    const nbaUrl = 'https://www.thesportsdb.com/api/v1/json/3/eventsnextleague.php?id=4387';
    const nflUrl = 'https://www.thesportsdb.com/api/v1/json/3/eventsnextleague.php?id=4391';

    try {
        loadingSpinner.style.display = 'block';
        sportsContainer.style.display = 'none';
        soccerList.innerHTML = '';
        nbaList.innerHTML = '';
        nflList.innerHTML = '';

        // Fetch futbol
        const soccerPromises = leagues.map(league => 
            fetch(`https://www.thesportsdb.com/api/v1/json/3/eventsnextleague.php?id=${league.id}`)
                .then(res => res.json())
                .catch(() => ({ events: [] })) 
        );

        // Fetch nba y nfl
        const otherSportsPromises = [
            fetch(nbaUrl).then(res => res.json()),
            fetch(nflUrl).then(res => res.json())
        ];

        const [soccerResults, [nbaData, nflData]] = await Promise.all([
            Promise.all(soccerPromises),
            Promise.all(otherSportsPromises)
        ]);

        // Procesar futbol
        let allSoccerEvents = [];
        soccerResults.forEach(leagueData => {
            if (leagueData.events) {
                allSoccerEvents = allSoccerEvents.concat(leagueData.events);
            }
        });

        // Ordenar por fecha
        allSoccerEvents.sort((a, b) => {
            const dateA = new Date(`${a.dateEvent}T${a.strTime}`);
            const dateB = new Date(`${b.dateEvent}T${b.strTime}`);
            return dateA - dateB;
        });

        loadingSpinner.style.display = 'none';
        sportsContainer.style.display = 'block';

        renderGenericList(allSoccerEvents, soccerList, 6); 
        renderGenericList(nbaData.events, nbaList, 6);
        renderGenericList(nflData.events, nflList, 6);

    } catch (error) {
        console.error('Error API:', error);
        loadingSpinner.style.display = 'none';
        sportsContainer.style.display = 'block';
        sportsContainer.innerHTML = '<p style="text-align:center; color:#ef4444;">Error conectando con el servidor de deportes.</p>';
    }
}

function renderGenericList(events, container, limit) {
    if (!events || events.length === 0) {
        container.innerHTML = '<p style="font-size:0.8rem; color:#6b7280; font-style:italic;">No hay eventos próximos.</p>';
        return;
    }

    const limitedEvents = events.slice(0, limit);

    limitedEvents.forEach(event => {
        const matchCard = document.createElement('div');
        matchCard.className = 'match-card';
        
        const date = new Date(event.dateEvent).toLocaleDateString();
        const time = event.strTime ? event.strTime.substring(0,5) : '';

        matchCard.innerHTML = `
            <div class="teams-info">
                <i class="fas fa-calendar-alt" style="color:#6b7280; font-size:0.8rem;"></i>
                <div>
                    <div style="font-weight:600; font-size:0.85rem;">${event.strEventAlternate || event.strEvent}</div>
                    <div style="font-size:0.7rem; color:#9ca3af;">${date} ${time ? '- ' + time : ''}</div>
                </div>
            </div>
            <button class="btn-select-match">Usar</button>
        `;

        matchCard.addEventListener('click', () => {
            selectMatch(event.strHomeTeam, event.strAwayTeam);
        });

        container.appendChild(matchCard);
    });
}

function selectMatch(home, away) {
    featuredModal.style.display = 'none';
    
    // Agregamos nueva fila SIEMPRE que se selecciona un partido
    addQuoteRow(); 
    
    const rows = document.querySelectorAll('.quote-row');
    const lastRow = rows[rows.length - 1];
    
    let descText = "Evento Seleccionado";
    if (home && away) {
        descText = `${home} vs ${away}`;
    }

    lastRow.querySelector('.quote-desc').value = descText;
    
    setTimeout(() => {
        lastRow.querySelector('.quote-value').focus();
    }, 100);
}