const userNameInput = document.getElementById('userName');
const siteNameInput = document.getElementById('siteName');
const weatherInput = document.getElementById('weather');
const questionArea = document.getElementById('questionArea');
const questionText = document.getElementById('questionText');
const answerOptions = document.getElementById('answerOptions');
const summaryBox = document.getElementById('summary');
const actionButton = document.getElementById('actionButton');
const nonConformModal = document.getElementById('nonConformModal');
const modalCloseButton = document.getElementById('modalCloseButton');

const questions = [
    { id: 'caucus', text: 'Ai-je bien compris le déroulement des opérations expliquées lors du caucus ?', options: ['Oui', 'Non'] },
    { id: 'taches', text: 'Mes tâches sont-elles claires et adaptées à la situation ?', options: ['Oui', 'Non'] },
    { id: 'equipement', text: 'Est-ce que je porte l\'équipement de sécurité complet ?', options: ['Oui', 'Non'] },
    { id: 'plan', text: 'Ai-je compris le plan de circulation et repéré les accès du chantier ?', options: ['Oui', 'Non'] },
    { id: 'info', text: 'Ai-je reçu toutes les informations nécessaires du responsable du chantier ?', options: ['Oui', 'Non'] },
    { id: 'communication', text: 'Le système de communication prévu est-il adéquat pour la journée ?', options: ['Oui', 'Non'] },
    { id: 'position-securitaire', text: 'Ai-je identifié une position sécuritaire hors du chantier ainsi qu\'une zone de refuge disponible ?', options: ['Oui', 'Non'] },
    { id: 'signalisation', text: 'La signalisation de présence (TCD-005) est-elle bien visible et fonctionnelle ?', options: ['Oui', 'Non'] },
    { id: 'visibilite-circulation', text: 'Suis-je bien positionné pour assurer une visibilité sur tous les côtés et face au trafic, tout en restant hors des voies de circulation ?', options: ['Oui', 'Non'] },
    { id: 'barriere', text: 'Si la vitesse est ≥ 70 km/h, une barrière de signaleur m\'a-t-elle été fournie ?', options: ['Oui', 'Non', 'N/A'] },
    { id: 'equipe', text: 'Si je suis à une intersection, y a-t-il une équipe de deux signaleurs en place ?', options: ['Oui', 'Non', 'N/A'] },
    { id: 'eclairage', text: 'Pour un travail de nuit, un éclairage adéquat est-il prévu ?', options: ['Oui', 'Non', 'N/A'] },
    { id: 'manoeuvres', text: 'S\'il y a des manœuvres de recul prévues au chantier, sont-elles balisées et/ou un signaleur de chantier a-t-il été prévu en complément ?', options: ['Oui', 'Non', 'N/A'] },
];

let state = {
    started: false,
    currentIndex: 0,
    responses: {},
};

function saveState() {
    const data = {
        userName: userNameInput.value.trim(),
        siteName: siteNameInput.value.trim(),
        weather: weatherInput.value,
        currentIndex: state.currentIndex,
        started: state.started,
        responses: state.responses,
    };
    localStorage.setItem('vigieSST', JSON.stringify(data));
}

function loadState() {
    const saved = localStorage.getItem('vigieSST');
    if (!saved) {
        return;
    }
    try {
        const data = JSON.parse(saved);
        if (data.userName) userNameInput.value = data.userName;
        if (data.siteName) siteNameInput.value = data.siteName;
        if (data.weather) weatherInput.value = data.weather;
        state = {
            started: data.started || false,
            currentIndex: typeof data.currentIndex === 'number' ? data.currentIndex : 0,
            responses: data.responses || {},
        };
    } catch (err) {
        console.warn('Impossible de restaurer les données sauvegardées', err);
    }
}

function renderQuestion() {
    const question = questions[state.currentIndex];
    if (!question) {
        showSummary();
        return;
    }
    questionArea.classList.remove('hidden');
    summaryBox.classList.add('hidden');
    questionText.textContent = question.text;
    answerOptions.innerHTML = '';

    question.options.forEach(option => {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = option;
        button.className = state.responses[question.id] === option ? 'selected' : '';
        button.addEventListener('click', () => {
            state.responses[question.id] = option;
            Array.from(answerOptions.children).forEach(child => child.classList.remove('selected'));
            button.classList.add('selected');
            saveState();
            // Si la réponse est 'Non' pour une des 13 questions, afficher la note pop-up
            if (option === 'Non' && nonConformModal) {
                nonConformModal.classList.remove('hidden');
            }
            actionButton.disabled = false;
        });
        answerOptions.appendChild(button);
    });

    actionButton.textContent = state.currentIndex === 0 ? 'SUIVANT' : 'SUIVANT';
    actionButton.disabled = !state.responses[question.id];
}

// Gestion du modal de non-conformité
if (modalCloseButton && nonConformModal) {
    modalCloseButton.addEventListener('click', () => {
        nonConformModal.classList.add('hidden');
    });
    // Fermer le modal en appuyant sur Echap
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') nonConformModal.classList.add('hidden');
    });
}

const reportEmail = 'michael.fontaine@colasquebec.ca';

function buildMailtoLink() {
    const name = userNameInput.value.trim() || '—';
    const site = siteNameInput.value.trim() || '—';
    const weather = weatherInput.value || '—';
    const subject = encodeURIComponent('Rapport Vigie SST - ' + name);
    const lines = [
        `Signaleur : ${name}`,
        `Chantier : ${site}`,
        `Météo : ${weather}`,
        '',
        'Réponses :'
    ];
    questions.forEach(q => {
        lines.push(`${q.text} : ${state.responses[q.id] || 'Non répondu'}`);
    });
    const body = encodeURIComponent(lines.join('\n'));
    return `mailto:${reportEmail}?subject=${subject}&body=${body}`;
}

function showSummary() {
    questionArea.classList.add('hidden');
    summaryBox.classList.remove('hidden');
    const name = userNameInput.value.trim() || '—';
    const site = siteNameInput.value.trim() || '—';
    const weather = weatherInput.value || '—';

    summaryBox.innerHTML = `
        <h2>Résumé de l'analyse</h2>
        <p><strong>Signaleur :</strong> ${name}</p>
        <p><strong>Chantier :</strong> ${site}</p>
        <p><strong>Météo :</strong> ${weather}</p>
        <p><strong>Questions :</strong></p>
        <ul>${questions.map(q => `<li>${q.text} <strong>${state.responses[q.id] || 'Non répondu'}</strong></li>`).join('')}</ul>
        <div class="summary-actions">
            <a id="emailReportButton" class="email-button" href="${buildMailtoLink()}" target="_blank">ENVOYER PAR COURRIEL</a>
        </div>
        <p>Vous pouvez réinitialiser et recommencer si nécessaire.</p>
    `;

    actionButton.textContent = 'RÉINITIALISER';
    actionButton.disabled = false;
    saveState();
}

function startQuiz() {
    if (!userNameInput.value.trim() || !siteNameInput.value.trim()) {
        alert('Veuillez saisir votre nom et le nom du chantier avant de commencer.');
        return;
    }

    state.started = true;
    state.currentIndex = 0;
    saveState();
    renderQuestion();
}

function handleAction() {
    if (!state.started) {
        startQuiz();
        return;
    }

    if (state.currentIndex < questions.length) {
        const question = questions[state.currentIndex];
        if (!state.responses[question.id]) {
            alert('Veuillez sélectionner une réponse avant de continuer.');
            return;
        }
        state.currentIndex += 1;
        saveState();
        if (state.currentIndex >= questions.length) {
            showSummary();
        } else {
            renderQuestion();
        }
        return;
    }

    localStorage.removeItem('vigieSST');
    state = { started: false, currentIndex: 0, responses: {} };
    questionArea.classList.add('hidden');
    summaryBox.classList.add('hidden');
    actionButton.textContent = 'COMMENCER L\'ANALYSE';
    actionButton.disabled = false;
}

actionButton.addEventListener('click', handleAction);
loadState();
if (state.started && state.currentIndex < questions.length) {
    renderQuestion();
} else if (state.started && state.currentIndex >= questions.length) {
    showSummary();
}

if ('serviceWorker' in navigator) {
    let swRegistration = null;
    let shouldReloadAfterControllerChange = false;

    function showUpdateBanner() {
        const banner = document.getElementById('updateBanner');
        if (banner) banner.classList.remove('hidden');
    }
    function hideUpdateBanner() {
        const banner = document.getElementById('updateBanner');
        if (banner) banner.classList.add('hidden');
    }

    navigator.serviceWorker.register('sw.js')
        .then(reg => {
            swRegistration = reg;
            console.log('Service worker enregistré.');

            if (reg.waiting) {
                showUpdateBanner();
            }

            reg.addEventListener('updatefound', () => {
                const newWorker = reg.installing;
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed') {
                        if (navigator.serviceWorker.controller) {
                            showUpdateBanner();
                        }
                    }
                });
            });
        })
        .catch(err => console.warn('Impossible d\'enregistrer le service worker.', err));

    // When the active service worker controlling the page changes, reload if requested
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (shouldReloadAfterControllerChange) {
            window.location.reload();
        }
    });

    // Banner buttons
    const reloadBtn = document.getElementById('updateReload');
    const dismissBtn = document.getElementById('updateDismiss');
    if (reloadBtn) {
        reloadBtn.addEventListener('click', () => {
            if (swRegistration && swRegistration.waiting) {
                // Ask the waiting worker to skip waiting
                swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
                shouldReloadAfterControllerChange = true;
            } else {
                // fallback: reload page
                window.location.reload();
            }
        });
    }
    if (dismissBtn) {
        dismissBtn.addEventListener('click', () => {
            hideUpdateBanner();
        });
    }
}
