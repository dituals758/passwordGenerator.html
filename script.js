const CHAR_SETS = {
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    numbers: '0123456789',
    special: "!#$%&'()*+,-./:;<=>?@[\\]^_`{}~|\""
};
const SIMILAR_CHARS = '0O1lI|';
const WORD_LIST = [
    'about','above','abuse','actor','acute','admit','adopt','adult','after','again',
    'agent','agree','ahead','alarm','album','alert','alien','align','alive','allow',
    'alone','along','alter','among','angel','anger','angle','angry','apart','apple',
    'apply','arena','argue','arise','array','aside','asset','atlas','attic','avoid',
    'awake','award','aware','badge','basic','beach','begun','being','bench','bible',
    'birth','black','blade','blame','blank','blast','blaze','bleed','blend','bless',
    'blind','block','blood','blown','board','bonus','boost','bound','brain','brand',
    'brave','bread','break','breed','brick','brief','bring','broad','broke','brook',
    'brown','brush','buddy','build','bunch','burst','buyer','cabin','cable','camel',
    'candy','cargo','carry','catch','cause','cease','chain','chair','chalk','chaos',
    'charm','chart','chase','cheap','check','cheek','cheer','chess','chest','chief',
    'child','chill','chord','civil','claim','clash','class','clean','clear','clerk',
    'cliff','climb','cling','clock','clone','close','cloth','cloud','coach','coast',
    'color','coral','count','court','cover','crack','craft','crane','crash','crazy',
    'cream','crest','crime','cross','crowd','crown','crude','crush','curve','cycle',
    'dance','death','debut','delay','delta','dense','depth','devil','diary','dirty',
    'dodge','donor','doubt','draft','drain','drama','drank','drawn','dream','dress',
    'dried','drift','drill','drink','drive','drops','drown','drunk','dying','eager',
    'eagle','earth','eight','elder','elect','elite','email','ember','empty','enemy',
    'enjoy','enter','entry','equal','error','essay','event','every','exact','exile',
    'exist','extra','fable','faith','false','fancy','fatal','fault','feast','fence',
    'fetch','fever','fiber','field','fifth','fifty','fight','final','first','flame',
    'flash','flesh','float','flood','floor','flour','fluid','flush','focus','force',
    'forge','forth','found','frame','frank','fraud','fresh','front','frost','fruit',
    'fully','giant','given','glass','globe','glory','going','grace','grade','grain',
    'grand','grant','graph','grasp','grass','grave','great','green','greet','grief',
    'grill','grind','gross','group','grove','grown','guard','guess','guide','guilt',
    'happy','harsh','heart','heavy','hence','hobby','honey','honor','horse','hotel',
    'house','human','humor','hurry','ideal','image','imply','index','inner','input',
    'irony','issue','ivory','joint','judge','juice','knife','known','label','large',
    'laser','later','laugh','layer','learn','lease','least','leave','legal','level',
    'light','limit','linen','liver','local','logic','lover','lower','loyal','lucky',
    'lunch','lyric','magic','major','maker','manor','march','match','mayor','media',
    'mercy','metal','might','minor','minus','model','money','month','moral','motor',
    'mount','mouse','mouth','movie','music','noble','noise','north','novel','nurse',
    'ocean','offer','often','olive','onset','opera','orbit','order','organ','other',
    'ought','outer','owner','oxide','paint','panel','panic','paper','party','pasta',
    'patch','pause','peace','pearl','phase','phone','photo','piano','piece','pilot',
    'pitch','pixel','pizza','place','plain','plane','plant','plate','plaza','plead',
    'point','polar','porch','pound','power','press','price','pride','prime','print',
    'prior','prize','proof','proud','prove','proxy','punch','pupil','purse','queen',
    'query','quest','queue','quick','quiet','quota','quote','radar','radio','raise',
    'range','rapid','ratio','reach','react','ready','realm','rebel','refer','reign',
    'relax','reply','rider','ridge','rifle','right','rigid','rival','river','robin',
    'robot','rocky','rouge','rough','round','route','royal','ruler','rural','saint',
    'salad','scale','scare','scene','scope','score','scout','sense','serve','seven',
    'shade','shaft','shake','shall','shame','shape','share','sharp','sheer','sheet',
    'shelf','shell','shift','shine','shirt','shock','shoot','shore','short','shout',
    'sight','since','sixth','sixty','skill','skull','slate','sleep','slice','slide',
    'slope','small','smart','smell','smile','smoke','snake','solar','solid','solve',
    'sorry','sound','south','space','spare','speak','speed','spend','spent','spice',
    'spill','spine','split','spoke','spoon','sport','spray','squad','staff','stage',
    'stain','stake','stale','stall','stamp','stand','stare','start','state','steam',
    'steel','steep','steer','stern','stick','stiff','still','stock','stole','stone',
    'stood','store','storm','story','stove','strap','straw','stray','strip','stuck',
    'study','stuff','style','sugar','suite','super','surge','swamp','swear','sweep',
    'sweet','swept','swift','swing','sword','swore','sworn','syrup','table','taken',
    'taste','teach','theft','theme','there','thick','thief','thing','think','third',
    'those','three','throw','thumb','tidal','tiger','tight','timer','tired','title',
    'today','token','topic','total','tough','tower','toxic','trace','track','trade',
    'trail','train','trait','trash','trend','trial','tribe','trick','troop','truck',
    'truly','trunk','trust','truth','tumor','twice','twist','ultra','uncle','under',
    'union','unite','unity','until','upper','upset','urban','usage','usual','valid',
    'value','vapor','vault','video','vigor','vinyl','viola','viral','virus','visit',
    'vista','vital','vivid','vocal','voice','voter','waist','waste','watch','water',
    'weary','weird','wheat','wheel','where','which','while','white','whole','whose',
    'widow','width','witch','woman','world','worry','worse','worst','worth','would',
    'wound','wrath','wrist','write','wrong','wrote','yield','young','youth'
];

const $ = id => document.getElementById(id);

const els = {};
const randomArray = new Uint32Array(1);
let deferredPrompt = null;
let isAppInstalled = false;
let generationMode = 'password';
let settingsChangeTimer = null;
let toastTimeout = null;
let modalFocusable = null;
let previouslyFocused = null;

function initElements() {
    const ids = [
        'password','length','lengthValue','generateBtn','copyBtn','shareBtn','themeToggle',
        'installPWA','footerVersion','lowercase','uppercase','numbers','special',
        'excludeSimilar','excludeRepeating','onlyUnique','resetSettingsBtn',
        'aboutBtn','aboutModal','closeAboutModal','aboutVersion','main-content',
        'strengthMeter','strengthBar','strengthLabel','toastContainer','modePassword','modePassphrase',
        'passphraseSettings','passphraseList','wordCount','wordCountValue',
        'capitalizeWords','appendNumber','historySection','historyList',
        'historyEmpty','clearHistoryBtn','exportHistoryBtn'
    ];
    ids.forEach(id => {
        els[id] = $(id);
    });
    els.btnText = document.querySelector('#generateBtn .btn-text');
    els.btnSpinner = document.querySelector('#generateBtn .btn-spinner');
    els.mainContent = $('main-content');
}

const triggerHaptic = () => { try { navigator.vibrate(50); } catch {} };
const isIOS = () => /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

function getRandomInt(max) {
    if (max <= 0) return 0;
    if (crypto?.getRandomValues) {
        const limit = 0xFFFFFFFF - (0xFFFFFFFF % max);
        let v;
        do { crypto.getRandomValues(randomArray); v = randomArray[0]; } while (v >= limit);
        return v % max;
    }
    return Math.floor(Math.random() * max);
}

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('theme', theme); } catch {}
    const isDark = theme === 'dark';
    els.themeToggle?.setAttribute('data-tooltip', isDark ? t.tipThemeLight : t.tipThemeDark);
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    applyTheme(current === 'dark' ? 'light' : 'dark');
}

function showToast(message, duration = 2500) {
    const container = els.toastContainer;
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

function showMessage(msg) { showToast(msg); }

function loadSettings() {
    try {
        const s = JSON.parse(localStorage.getItem('passwordSettings')) || {};
        els.length.value = s.length ?? 16;
        els.lowercase.checked = s.lowercase ?? true;
        els.uppercase.checked = s.uppercase ?? true;
        els.numbers.checked = s.numbers ?? true;
        els.special.checked = s.special ?? true;
        els.excludeSimilar.checked = s.excludeSimilar ?? false;
        els.excludeRepeating.checked = s.excludeRepeating ?? false;
        els.onlyUnique.checked = s.onlyUnique ?? true;
        els.wordCount.value = s.wordCount ?? 5;
        els.capitalizeWords.checked = s.capitalizeWords ?? true;
        els.appendNumber.checked = s.appendNumber ?? false;
        generationMode = s.generationMode || 'password';
        updateLengthValue();
        updateWordCountValue();
        toggleMode(generationMode);
    } catch {}
}

function saveSettings() {
    const settings = {
        length: +els.length.value,
        lowercase: els.lowercase.checked,
        uppercase: els.uppercase.checked,
        numbers: els.numbers.checked,
        special: els.special.checked,
        excludeSimilar: els.excludeSimilar.checked,
        excludeRepeating: els.excludeRepeating.checked,
        onlyUnique: els.onlyUnique.checked,
        wordCount: +els.wordCount.value,
        capitalizeWords: els.capitalizeWords.checked,
        appendNumber: els.appendNumber.checked,
        generationMode
    };
    try { localStorage.setItem('passwordSettings', JSON.stringify(settings)); } catch {}
}

function resetSettings() {
    els.length.value = 16;
    els.lowercase.checked = true;
    els.uppercase.checked = true;
    els.numbers.checked = true;
    els.special.checked = true;
    els.excludeSimilar.checked = false;
    els.excludeRepeating.checked = false;
    els.onlyUnique.checked = true;
    els.wordCount.value = 5;
    els.capitalizeWords.checked = true;
    els.appendNumber.checked = false;
    generationMode = 'password';
    updateLengthValue();
    updateWordCountValue();
    toggleMode('password');
    saveSettings();
    performGeneration();
    showMessage(t.msgSettingsReset);
}

function updateLengthValue() { els.lengthValue.textContent = els.length.value; }
function updateWordCountValue() { els.wordCountValue.textContent = els.wordCount.value; }

function toggleMode(mode) {
    const apply = () => {
        generationMode = mode;
        els.modePassword.classList.toggle('active', mode === 'password');
        els.modePassphrase.classList.toggle('active', mode === 'passphrase');
        if (els.btnText) els.btnText.textContent = mode === 'password' ? t.modePassword : t.modePassphrase;
        const isPass = mode === 'passphrase';
        $('basicSettings')?.classList.toggle('hidden', isPass);
        $('advancedSettings')?.classList.toggle('hidden', isPass);
        els.passphraseSettings?.classList.toggle('hidden', !isPass);
        els.passphraseList?.classList.toggle('hidden', !isPass);
        $('passphraseDesc')?.classList.toggle('hidden', !isPass);
        document.querySelectorAll('.password-settings .sub-section-title:not(#passphraseSettings)').forEach(el => {
            el.classList.toggle('hidden', isPass);
        });
    };
    if (document.startViewTransition) {
        document.startViewTransition(apply);
    } else {
        apply();
    }
}

function filterCharSet(charSet, excludeSimilar) {
    return excludeSimilar ? [...charSet].filter(c => !SIMILAR_CHARS.includes(c)).join('') : charSet;
}

function getActiveCharSets() {
    const ex = els.excludeSimilar.checked;
    const sets = [];
    if (els.lowercase.checked) sets.push(filterCharSet(CHAR_SETS.lowercase, ex));
    if (els.uppercase.checked) sets.push(filterCharSet(CHAR_SETS.uppercase, ex));
    if (els.numbers.checked) sets.push(filterCharSet(CHAR_SETS.numbers, ex));
    if (els.special.checked) sets.push(filterCharSet(CHAR_SETS.special, ex));
    return sets.filter(s => s.length > 0);
}

function hasConsecutiveRepeats(pw) {
    for (let i = 0; i < pw.length - 1; i++) {
        if (pw[i] === pw[i + 1]) return true;
    }
    return false;
}

function generatePassword(length, sets, excludeRepeating, onlyUnique) {
    if (!sets.length) return '';
    const fullPool = sets.join('');
    if (!fullPool.length) return '';

    if (onlyUnique) {
        const uniquePool = [...new Set(fullPool)];
        if (uniquePool.length < length) return '';
        for (let i = uniquePool.length - 1; i > 0; i--) {
            const j = getRandomInt(i + 1);
            [uniquePool[i], uniquePool[j]] = [uniquePool[j], uniquePool[i]];
        }
        let pw = uniquePool.slice(0, length).join('');
        for (const set of sets) {
            if (![...set].some(ch => pw.includes(ch)) && set.length) {
                const pos = getRandomInt(length);
                pw = pw.substring(0, pos) + set[getRandomInt(set.length)] + pw.substring(pos + 1);
            }
        }
        return pw;
    }

    const chars = sets.map(set => set[getRandomInt(set.length)]);
    while (chars.length < length) chars.push(fullPool[getRandomInt(fullPool.length)]);
    for (let i = chars.length - 1; i > 0; i--) {
        const j = getRandomInt(i + 1);
        [chars[i], chars[j]] = [chars[j], chars[i]];
    }
    let pw = chars.join('');
    if (excludeRepeating) {
        let attempts = 0;
        while (hasConsecutiveRepeats(pw) && attempts++ < 100) {
            for (let i = pw.length - 1; i > 0; i--) {
                const j = getRandomInt(i + 1);
                [pw[i], pw[j]] = [pw[j], pw[i]];
            }
        }
    }
    return pw;
}

function generatePassphrase(wordCount, capitalize, appendNumber) {
    const words = [];
    for (let i = 0; i < wordCount; i++) {
        let word = WORD_LIST[getRandomInt(WORD_LIST.length)];
        if (capitalize) word = word.charAt(0).toUpperCase() + word.slice(1);
        words.push(word);
    }
    return words.join('-') + (appendNumber ? getRandomInt(100) : '');
}

function updateStrengthMeter(password) {
    if (!els.strengthMeter) return;
    let poolSize = 0;
    const len = password.length;
    if (generationMode === 'passphrase') {
        poolSize = WORD_LIST.length;
    } else {
        const sets = getActiveCharSets();
        for (const set of sets) poolSize += set.length;
        if (els.excludeSimilar.checked) {
            poolSize -= [...SIMILAR_CHARS].filter(ch => sets.some(s => s.includes(ch))).length;
            poolSize = Math.max(0, poolSize);
        }
    }
    const bar = els.strengthBar || els.strengthMeter.querySelector('.strength-bar');
    if (poolSize <= 0 || len <= 0) {
        if (bar) { bar.style.setProperty('--bar-width', '0%'); bar.style.setProperty('--bar-color', 'var(--ios-gray4)'); }
        els.strengthLabel.textContent = '';
        return;
    }
    const entropy = Math.log2(poolSize) * len;
    let width = '0%', color = 'var(--ios-gray4)', label = '';
    if (entropy >= 80) { width = '100%'; color = 'var(--success-color)'; label = t.strengthVeryStrong; }
    else if (entropy >= 60) { width = '75%'; color = 'var(--success-color)'; label = t.strengthStrong; }
    else if (entropy >= 40) { width = '50%'; color = 'var(--warning-color)'; label = t.strengthMedium; }
    else { width = '25%'; color = 'var(--error-color)'; label = t.strengthWeak; }
    if (bar) { bar.style.setProperty('--bar-width', width); bar.style.setProperty('--bar-color', color); }
    els.strengthLabel.textContent = label;
}

function updatePasswordField(pw) {
    els.password.value = pw;
    updateStrengthMeter(pw);
}

function performGeneration() {
    if (generationMode === 'passphrase') {
        const pw = generatePassphrase(+els.wordCount.value, els.capitalizeWords.checked, els.appendNumber.checked);
        updatePasswordField(pw);
        saveSettings();
        return true;
    }
    const length = +els.length.value;
    const sets = getActiveCharSets();
    if (!sets.length) { showMessage(t.msgNoCharSet); els.password.value = ''; updateStrengthMeter(''); return false; }
    if (els.onlyUnique.checked) {
        const uniquePoolSize = [...new Set(sets.join(''))].length;
        if (uniquePoolSize < length) { showMessage(t.msgNotEnoughUnique); els.password.value = ''; updateStrengthMeter(''); return false; }
    }
    if (length < sets.length) { showMessage(t.msgLengthTooShort); els.password.value = ''; updateStrengthMeter(''); return false; }
    const pw = generatePassword(length, sets, els.excludeRepeating.checked, els.onlyUnique.checked);
    if (pw) { updatePasswordField(pw); saveSettings(); return true; }
    els.password.value = ''; updateStrengthMeter(''); return false;
}

function debouncedGeneration() {
    clearTimeout(settingsChangeTimer);
    settingsChangeTimer = setTimeout(() => { performGeneration(); settingsChangeTimer = null; }, 150);
}

const HISTORY_KEY = 'pgHistory';
const MAX_HISTORY = 20;

function loadHistory() {
    try { return JSON.parse(localStorage.getItem(HISTORY_KEY)) || []; } catch { return []; }
}

function saveToHistory(pw) {
    if (!pw) return;
    const history = loadHistory();
    history.unshift({ password: pw, time: Date.now() });
    if (history.length > MAX_HISTORY) history.length = MAX_HISTORY;
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(history)); } catch {}
    renderHistory();
}

function clearHistory() {
    try { localStorage.removeItem(HISTORY_KEY); } catch {}
    renderHistory();
    showMessage(t.msgHistoryCleared);
}

function formatTime(ts) {
    const diff = Date.now() - ts;
    if (diff < 60000) return t.timeJustNow;
    if (diff < 3600000) return Math.floor(diff / 60000) + ' ' + t.timeMinutes;
    if (diff < 86400000) return Math.floor(diff / 3600000) + ' ' + t.timeHours;
    const d = new Date(ts);
    return d.toLocaleDateString(currentLang === 'en' ? 'en-US' : 'ru-RU', { day: '2-digit', month: '2-digit' });
}

function renderHistory() {
    const history = loadHistory();
    const list = els.historyList;
    const empty = els.historyEmpty;
    if (!list) return;

    while (list.lastChild && list.lastChild !== empty) list.removeChild(list.lastChild);

    if (!history.length) {
        empty.style.display = '';
        return;
    }
    empty.style.display = 'none';

    history.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'history-item';

        const pwSpan = document.createElement('span');
        pwSpan.className = 'history-item-password';
        pwSpan.textContent = item.password;

        const timeSpan = document.createElement('span');
        timeSpan.className = 'history-item-time';
        timeSpan.textContent = formatTime(item.time);

        const copyBtn = document.createElement('button');
        copyBtn.className = 'history-item-btn';
        copyBtn.type = 'button';
        copyBtn.setAttribute('aria-label', t.ariaCopyHistory || 'Copy');
        copyBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
        copyBtn.addEventListener('click', async () => {
            triggerHaptic();
            try { await copyToClipboard(item.password); showMessage(t.msgCopied); } catch { showMessage(t.msgCopyFailed); }
        });

        const delBtn = document.createElement('button');
        delBtn.className = 'history-item-btn';
        delBtn.type = 'button';
        delBtn.setAttribute('aria-label', t.ariaDeleteHistory || 'Delete');
        delBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>';
        delBtn.addEventListener('click', () => {
            const h = loadHistory();
            h.splice(index, 1);
            try { localStorage.setItem(HISTORY_KEY, JSON.stringify(h)); } catch {}
            renderHistory();
        });

        div.append(pwSpan, timeSpan, copyBtn, delBtn);
        list.appendChild(div);
    });
}

async function copyToClipboard(text) {
    if (!text) throw new Error('No text');
    if (navigator.clipboard?.writeText) {
        try { await navigator.clipboard.writeText(text); return; } catch {}
    }
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
}

async function copyCurrentPassword() {
    if (!els.password.value) { showMessage(t.msgNotGenerated); return; }
    triggerHaptic();
    try { await copyToClipboard(els.password.value); showMessage(t.msgCopied); } catch { showMessage(t.msgCopyFailed); }
}

async function sharePassword() {
    if (!els.password.value) { showMessage(t.msgNotGenerated); return; }
    triggerHaptic();
    if (!navigator.share) { showMessage(t.msgShareFailed); return; }
    try { await navigator.share({ text: els.password.value }); } catch (e) { if (e.name !== 'AbortError') showMessage(t.msgShareFailed); }
}

async function exportHistory() {
    triggerHaptic();
    const history = loadHistory();
    if (!history.length) { showMessage(t.msgNoHistory); return; }
    const csv = 'password,date\n' + history.map(h => {
        const d = new Date(h.time).toISOString();
        return `"${h.password.replace(/"/g, '""')}","${d}"`;
    }).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    if (window.showSaveFilePicker) {
        try {
            const handle = await window.showSaveFilePicker({ suggestedName: 'passwords.csv', types: [{ description: 'CSV', accept: { 'text/csv': ['.csv'] } }] });
            const writable = await handle.createWritable();
            await writable.write(blob);
            await writable.close();
            showMessage(t.msgExported);
        } catch (e) { if (e.name !== 'AbortError') showMessage(t.msgExportFailed); }
    } else {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'passwords.csv';
        a.click();
        URL.revokeObjectURL(a.href);
        showMessage(t.msgExported);
    }
}

async function generateAndCopy() {
    const btn = els.generateBtn;
    btn.disabled = true;
    els.btnText.classList.add('hidden');
    els.btnSpinner.classList.remove('hidden');
    triggerHaptic();
    try {
        if (!performGeneration()) return;
        saveToHistory(els.password.value);
        await copyToClipboard(els.password.value);
        showMessage(t.msgCreatedAndCopied);
    } catch { showMessage(t.msgCopyFailed); }
    finally {
        btn.disabled = false;
        els.btnText.classList.remove('hidden');
        els.btnSpinner.classList.add('hidden');
    }
}

function checkPWAInstallStatus() {
    return matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
}

function initPWA() {
    if (checkPWAInstallStatus() || isIOS()) {
        els.installPWA?.classList.add('hide');
        if (isIOS()) els.installPWA?.addEventListener('click', () => showToast(t.msgInstallIOS, 4000));
        return;
    }
    window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferredPrompt = e; els.installPWA?.classList.remove('hide'); });
    window.addEventListener('appinstalled', () => { deferredPrompt = null; isAppInstalled = true; els.installPWA?.classList.add('hide'); showMessage(t.msgInstalled); });
}

async function installPWA() {
    if (isIOS()) { showToast(t.msgInstallIOS, 4000); return; }
    if (!deferredPrompt || isAppInstalled) { showMessage(t.msgAlreadyInstalled); els.installPWA?.classList.add('hide'); return; }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    deferredPrompt = null;
    if (outcome === 'accepted') { isAppInstalled = true; els.installPWA?.classList.add('hide'); }
    else showMessage(t.msgInstallCancelled);
}

function initSW() {
    if (!('serviceWorker' in navigator) || location.protocol !== 'https:') return;
    navigator.serviceWorker.register('./sw.js').then(reg => {
        reg.addEventListener('updatefound', () => {
            const w = reg.installing;
            w?.addEventListener('statechange', () => {
                if (w.state === 'installed' && navigator.serviceWorker.controller) {
                    if (confirm(t.msgUpdateAvailable)) w.postMessage({ type: 'SKIP_WAITING' });
                }
            });
        });
    }).catch(() => {});
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (refreshing) return;
        refreshing = true;
        location.reload();
    });
}

function getFocusableElements(container) {
    return [...container.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')].filter(el => !el.hasAttribute('disabled'));
}

function trapFocus(event, focusable) {
    if (!focusable.length) return;
    const first = focusable[0], last = focusable[focusable.length - 1];
    if (event.key !== 'Tab') return;
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
}

function openModal() {
    const modal = els.aboutModal;
    if (!modal) return;
    previouslyFocused = document.activeElement;
    document.body.classList.add('modal-open');
    modal.classList.add('show');
    els.aboutBtn?.setAttribute('aria-expanded', 'true');
    modalFocusable = getFocusableElements(modal);
    if (modalFocusable.length) modalFocusable[0].focus();
    els.mainContent?.setAttribute('aria-hidden', 'true');
    const keyHandler = e => trapFocus(e, modalFocusable);
    const escapeHandler = e => { if (e.key === 'Escape') closeModal(); };
    document.addEventListener('keydown', keyHandler);
    document.addEventListener('keydown', escapeHandler);
    modal._keyHandler = keyHandler;
    modal._escapeHandler = escapeHandler;
}

function closeModal() {
    const modal = els.aboutModal;
    if (!modal) return;
    modal.classList.remove('show');
    document.body.classList.remove('modal-open');
    els.aboutBtn?.setAttribute('aria-expanded', 'false');
    els.mainContent?.removeAttribute('aria-hidden');
    if (modal._keyHandler) document.removeEventListener('keydown', modal._keyHandler);
    if (modal._escapeHandler) document.removeEventListener('keydown', modal._escapeHandler);
    previouslyFocused?.focus?.();
}

function initModal() {
    const modal = els.aboutModal;
    if (!modal) return;
    els.aboutBtn?.addEventListener('click', openModal);
    els.closeAboutModal?.addEventListener('click', closeModal);
    modal.querySelector('.modal-overlay')?.addEventListener('click', closeModal);
    const content = modal.querySelector('.modal-content');
    let startY = 0, currentY = 0, dragging = false;
    content.addEventListener('touchstart', e => {
        if (content.scrollTop === 0) { startY = e.touches[0].clientY; dragging = true; }
    }, { passive: true });
    content.addEventListener('touchmove', e => {
        if (!dragging) return;
        currentY = e.touches[0].clientY;
        if (currentY - startY > 0) { e.preventDefault(); content.style.transform = `translateY(${currentY - startY}px)`; }
    }, { passive: false });
    content.addEventListener('touchend', () => {
        if (!dragging) return;
        if (currentY - startY > 100) closeModal(); else content.style.transform = '';
        startY = currentY = 0; dragging = false;
    });
    content.addEventListener('touchcancel', () => { content.style.transform = ''; startY = currentY = 0; dragging = false; });
}

function initApp() {
    initElements();
    applyTranslations();
    const version = window.APP_VERSION || '?';
    if (els.footerVersion) els.footerVersion.textContent = version;
    if (els.aboutVersion) els.aboutVersion.textContent = version;
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    applyTheme(currentTheme);
    loadSettings();
    performGeneration();
    renderHistory();

    const skeleton = $('skeleton');
    if (skeleton) requestAnimationFrame(() => { skeleton.classList.add('hide'); setTimeout(() => skeleton.remove(), 300); });

    requestAnimationFrame(() => {
        document.documentElement.removeAttribute('data-no-transition');
    });

    initPWA();
    initSW();
    initModal();

    if (els.shareBtn && navigator.share) els.shareBtn.style.display = '';

    if (new URLSearchParams(location.search).get('action') === 'generate') {
        generateAndCopy();
        history.replaceState({}, '', location.pathname);
    }

    els.length?.addEventListener('change', () => { updateLengthValue(); performGeneration(); });
    els.length?.addEventListener('input', updateLengthValue);
    els.wordCount?.addEventListener('input', updateWordCountValue);
    els.wordCount?.addEventListener('change', () => { updateWordCountValue(); performGeneration(); });
    els.capitalizeWords?.addEventListener('change', debouncedGeneration);
    els.appendNumber?.addEventListener('change', debouncedGeneration);
    els.modePassword?.addEventListener('click', () => { toggleMode('password'); saveSettings(); performGeneration(); });
    els.modePassphrase?.addEventListener('click', () => { toggleMode('passphrase'); saveSettings(); performGeneration(); });
    els.clearHistoryBtn?.addEventListener('click', clearHistory);
    els.exportHistoryBtn?.addEventListener('click', exportHistory);
    els.generateBtn?.addEventListener('click', generateAndCopy);
    els.copyBtn?.addEventListener('click', copyCurrentPassword);
    els.shareBtn?.addEventListener('click', sharePassword);
    els.themeToggle?.addEventListener('click', toggleTheme);
    els.installPWA?.addEventListener('click', installPWA);
    els.resetSettingsBtn?.addEventListener('click', resetSettings);
    document.querySelectorAll('.switch input').forEach(input => input.addEventListener('change', debouncedGeneration));
    document.addEventListener('keydown', e => {
        if (e.code === 'Space' && e.target === document.body) { e.preventDefault(); generateAndCopy(); }
    });
}

document.addEventListener('DOMContentLoaded', initApp);
