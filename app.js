'use strict';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const escapeText = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const icon = (name, className = '') => `<svg class="icon ${className}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] || ICONS.CircleHelp}</svg>`;
const naira = value => '₦' + Number(value).toLocaleString('en-NG');
const money = (value, size = 'lg') => `<div class="money ${size}"><span class="currency">₦</span>${Number(value).toLocaleString('en-NG')}</div>`;
const btn = (label, action, className = 'button-primary', attrs = '') => `<button class="${className}" data-action="${action}" ${attrs}>${label}</button>`;
const go = (label, screen, className = 'button-primary') => btn(label, 'go', className, `data-screen="${screen}" ${label.startsWith('<svg') ? `aria-label="${screenNames[screen]}"` : ''}`);
const ib = (name, label, action, attrs = '', className = '') => btn(icon(name), action, `icon-button ${className}`, `aria-label="${escapeText(label)}" ${attrs}`);
const info = (label, title, body, className = 'text-button') => btn(label, 'info', className, `aria-label="${escapeText(title)}" data-title="${escapeText(title)}" data-body="${escapeText(body)}"`);
const amountBase = 39996;
const remaining = s => Math.max(0, amountBase - s.drawn);
const screenNames = {welcome:'Welcome',priorities:'Your priorities',verify:'Identity introduction',home:'Home',savings:'Your savings',rewards:'Little wins',score:'Your WageScore',advance:'Salary advance',review:'Review your advance',pin:'Confirm it’s you',success:'Advance received',activity:'Your activity',profile:'Your profile'};
const screenNotes = {
  welcome:'The illustrated welcome and bold Cashnova typography, retained.',
  priorities:'A simple choice about what matters to you.',
  verify:'An explanation of the checks that protect your account.',
  home:'The savings card you loved, reworked for available earned pay.',
  savings:'The same rounded balance card, goals and payday saving.',
  rewards:'Partner vouchers and the little wins along the way.',
  score:'A clear view of your financial progress.',
  advance:'Choose an amount within the pay you have earned.',
  review:'Amount, fee and payroll repayment, all visible before you confirm.',
  pin:'A separate transaction PIN. Use 1234 for this demo.',
  success:'A completed sample advance, with a receipt you can save.',
  activity:'Advances and savings, in one readable history.',
  profile:'Your account, preferences and security.',
};
const groups = [
  {id:'onboarding',number:'01',title:'A warm welcome',screens:['welcome','priorities','verify']},
  {id:'daily',number:'02',title:'Your everyday pay',screens:['home','savings','rewards','score']},
  {id:'advance',number:'03',title:'A little before payday',screens:['advance','review','pin','success']},
  {id:'account',number:'04',title:'Your account, together',screens:['activity','profile']},
];
const params = new URLSearchParams(location.search);
const exporting = params.get('export') === '1';
const exportGroup = groups.some(group => group.id === params.get('group')) ? params.get('group') : null;
let appearance = ['light','dark','compare'].includes(params.get('theme')) ? params.get('theme') : 'compare';
let view = params.get('view') === 'board' ? 'board' : 'demo';
const initialSession = () => ({screen:'home',amount:20000,amountFresh:true,priority:'',pin:'',pinError:false,consent:false,drawn:0,lastAdvance:0,savings:64500,emergency:40000,rent:24500,newGoalAmount:0,newGoal:'',depositBalance:50000,hidden:false,claimed:false,autoSave:true,filter:'all',overlay:null,newActivity:[]});
let session = initialSession();
if (Object.hasOwn(screenNames,params.get('screen'))) session.screen = params.get('screen');
if (exporting) document.body.classList.add('export-mode');

const appLogo = () => `<span class="app-wordmark"><span class="brand-symbol">w.</span>wagezapp</span>`;
const header = (title, s, back = 'home') => `<header class="app-header">${ib('ArrowLeft','Back','go',`data-screen="${back}"`)}<h2 class="app-title">${title}</h2>${ib('CircleHelp',`About ${title}`,'info',`data-title="${title}" data-body="This preview uses a fictional Wagezapp account. Explore the design without creating an account or moving money."`)}</header>`;
const greet = () => `<header class="app-header"><div class="greeting"><span class="avatar" aria-hidden="true">AO</span><div><small>Good morning</small><strong>Hi, Adaora</strong></div></div>${ib('Bell','Notifications','notifications','','has-dot')}</header>`;
const hasNavigation = screen => ['home','savings','rewards','score','activity','profile'].includes(screen);
const statusbar = () => `<div class="statusbar"><span>9:41</span><span class="status-icons">${icon('Signal')}${icon('Wifi')}${icon('BatteryFull')}</span></div>`;
const nav = s => {
  if (!hasNavigation(s.screen)) return '';
  return `<nav class="nav-bar" aria-label="Main app navigation">${[['Home','Home','home'],['Wallet','Savings','savings'],['Gift','Rewards','rewards'],['ChartNoAxesCombined','Activity','activity'],['UserRound','Profile','profile']].map(([name,label,target]) => {
    const active = s.screen === target || (s.screen === 'score' && target === 'activity');
    return btn(`${icon(name)}<span>${label}</span>`, 'go', `nav-item ${active?'active':''}`, `data-screen="${target}" aria-label="${label}" ${active?'aria-current="page"':''}`);
  }).join('')}</nav>`;
};
const payday = () => `<div class="payday-meta"><span>Earned so far <b>₦120,000</b></span><span>15 days to payday</span></div><div class="progress" role="img" aria-label="Half of this month's salary earned"><i style="width:50%"></i></div>`;
const quickActions = () => `<div class="action-row">${[['ArrowUpRight','Advance','advance'],['Plus','Save','savings'],['Gift','Rewards','rewards'],['ChartNoAxesCombined','Activity','activity']].map(([name,label,target]) => go(`<span>${icon(name)}</span>${label}`,target,'quick-action')).join('')}</div>`;

function transactionRows(s, limit = 3) {
  const historical = [
    {kind:'savings',icon:'PiggyBank',title:'Savings deposit',date:'12 Sep · Successful',amount:5000,body:'A sample deposit into your rainy day fund.'},
    {kind:'salary',icon:'BriefcaseBusiness',title:'Salary received',date:'1 Sep · Confirmed',amount:240000,body:'A fictional monthly salary from your verified employer.'},
    {kind:'advance',icon:'ArrowDownLeft',title:'Previous advance',date:'8 Aug · Repaid',amount:20000,body:'This previous-cycle advance was repaid through payroll. It does not reduce your current availability.'},
  ];
  const rows = [...s.newActivity,...historical].filter(item => s.filter === 'all' || item.kind === s.filter).slice(0,limit);
  return rows.map(item => info(`<span class="transaction-icon">${icon(item.icon)}</span><span class="transaction-info"><strong>${escapeText(item.title)}</strong><small>${item.date}</small></span><span class="transaction-value">${naira(item.amount)}<small>View details</small></span>`,item.title,item.body,'transaction')).join('');
}

function home(s) {
  return `<div class="screen-pad home-screen">${greet()}<section class="balance-card"><div class="row"><span class="balance-label">Available salary advance</span>${ib(s.hidden?'EyeOff':'Eye',s.hidden?'Show available amount':'Hide available amount','balance','','balance-eye')}</div>${s.hidden?'<div class="money lg" aria-label="Balance hidden">••••••</div>':money(remaining(s))}<p class="tiny">Your earned pay. Ready when you need it.</p><span class="balance-decoration" aria-hidden="true">${icon('Zap')}</span></section><div class="employer-line">${icon('BadgeCheck')} Zero fees with your employer</div>${quickActions()}<section class="panel salary-panel"><div class="row"><span>Your salary this month</span><strong>₦240,000</strong></div>${payday()}</section><div class="home-minis">${go(`<span>Your savings</span>${icon('PiggyBank')}<strong>${naira(s.savings)}</strong><small>A little more peace of mind</small>`,'savings','home-mini')}${go(`<span>Your WageScore</span>${icon('TrendingUp')}<strong>688 <span style="font-size:10px;font-weight:500;letter-spacing:0">/ 900</span></strong><small>Steady · +24 this month</small>`,'score','home-mini score-mini')}</div><section class="activity-section"><div class="section-top"><h3>Recent activity</h3>${go('See all','activity','text-button')}</div>${transactionRows({...s,filter:'all'},2)}</section></div>`;
}

function advance(s) {
  const available = remaining(s);
  if (available < 1000) return `<div class="screen-pad">${header('Your available pay',s)}<div class="success-emblem">${icon('ShieldCheck')}</div><h1 class="app-h2">You’re within your plan.</h1><p class="small text-muted">You have ${naira(available)} left available today, below the ₦1,000 minimum. Your available amount grows as you earn more salary.</p><div class="panel"><p class="small">${naira(s.drawn)} drawn in this cycle. Repayment is from payroll on 30 September.</p></div><div class="grow"></div>${go('Back to home','home')}</div>`;
  return `<div class="screen-pad advance-screen">${header('Salary advance',s)}<div class="recipient"><span class="bank-avatar">${icon('Landmark')}</span><div><strong>Adaora Okafor</strong><small>Salary account · 4821</small></div>${info(icon('ShieldCheck'),'Your payout account','Your sample salary account ending 4821 is verified. The full app pays advances only into an account that belongs to you.','icon-button')}</div><div class="amount-input"><label for="amount-${s.id}">How much do you need?</label><div class="amount-display"><span>₦</span><input id="amount-${s.id}" data-amount inputmode="numeric" autocomplete="off" value="${s.amount.toLocaleString('en-NG')}" aria-describedby="amount-help-${s.id}"></div><small id="amount-help-${s.id}">${naira(available)} available · Fee ₦0</small><p class="field-error" data-amount-error role="status"></p></div><div class="quick-amounts">${[10000,20000,30000].map(value => btn(naira(value),'quick-amount',value===s.amount?'selected':'',`data-value="${value}" ${value>available?'disabled':''}`)).join('')}</div><label class="small text-muted">Adjust your amount<input data-range class="amount-range" type="range" min="1000" max="${available}" step="1" value="${s.amount}" aria-label="Advance amount"></label><div class="review-list"><div class="row"><span>Advance fee</span><strong>₦0.00</strong></div><div class="row"><span>Repayment</span><strong>30 September<br>From payroll</strong></div><div class="row"><span>Left available after this</span><strong data-headroom>${naira(Math.max(0,available-s.amount))}</strong></div></div><div class="grow"></div>${btn(`Review advance ${icon('ArrowRight')}`,'review','button-primary',validAmount(s)?'':'disabled')}<p class="privacy-note">${icon('LockKeyhole')} Your earned pay. Always within your limit.</p></div>`;
}

function activity(s) {
  return `<div class="screen-pad activity-screen">${header('Your activity',s)}<div><h1 class="app-h2">Your money,<br>at a glance.</h1><p class="small text-muted" style="margin-top:8px">Every little move, in one place.</p></div><div class="activity-summary"><div><small>Drawn this cycle</small><strong>${naira(s.drawn)}</strong></div><div><small>Total savings</small><strong>${naira(s.savings)}</strong></div></div><div class="filter-tabs" aria-label="Activity filter">${[['all','All activity'],['advance','Advances'],['savings','Savings']].map(([value,label]) => btn(label,'filter',s.filter===value?'active':'',`data-value="${value}" aria-pressed="${s.filter===value}"`)).join('')}</div><section><p class="activity-date">Your recent history</p>${transactionRows(s,10)}</section><div class="callout">${icon('CalendarDays')}<div><strong>Your next payday</strong><p>30 September · ${naira(s.drawn)} scheduled for payroll repayment.</p></div></div></div>`;
}

function profile(s) {
  const items = [
    ['UserRound','Personal details','Your sample profile','Adaora Okafor. This fictional account is for design review.'],
    ['BriefcaseBusiness','Your employer','Your employer','Your employer is verified. Advances carry zero fees and are repaid through payroll.'],
    ['Landmark','Bank accounts','Your bank account','Verified salary account ending 4821. Payout accounts in the full app must belong to you.'],
    ['LockKeyhole','Security','Account security','The product has a separate login PIN and transaction PIN. The demo transaction PIN is 1234.'],
    ['CircleHelp','Help & support','Here to help','The full app will connect you to Wagezapp support here. This is a design preview.'],
  ];
  return `<div class="screen-pad profile-screen">${header('Your profile',s)}<div class="profile-card"><div class="profile-avatar">AO<span>${icon('Check')}</span></div><h2>Adaora Okafor</h2><p>adaora@example.com</p><span class="badge">${icon('BadgeCheck')} Employer partnered</span></div><div class="profile-theme"><strong>App appearance</strong>${btn(s.theme==='dark'?'Light ☼':'Dark ☾','app-theme','',`data-theme="${s.theme==='dark'?'light':'dark'}" aria-label="Switch to ${s.theme==='dark'?'light':'dark'} mode"`)}</div><div class="profile-menu">${items.map(([name,label,title,body]) => info(`${icon(name)}${label}${icon('ChevronRight','chevron')}`,title,body,'menu-item')).join('')}</div>${btn(`${icon('RefreshCw')} Reset the demo`,'reset-prompt','button-secondary')}</div>`;
}

const renderers = {welcome,priorities,verify,home,savings,rewards,score,advance,review,pin,success,activity,profile};

function sheetMarkup(s) {
  const overlay = s.overlay;
  if (!overlay) return '';
  let content = '';
  if (overlay.type === 'info') content = `<p>${escapeText(overlay.body)}</p>${btn('Got it','close-sheet')}`;
  if (overlay.type === 'notifications') content = `<div class="stack"><div class="callout">${icon('BriefcaseBusiness')}<div><strong>Your employer is connected</strong><p>Your sample account has zero advance fees.</p></div></div><div class="callout">${icon('Gift')}<div><strong>A little good thing</strong><p>Your September sample reward is ready.</p></div></div></div>${go('Explore rewards','rewards')}`;
  if (overlay.type === 'deposit') content = `<p>Add a sample deposit to ${escapeText(overlay.goal==='rent'?'A place of my own':overlay.goal==='new'?s.newGoal:'your rainy day fund')}.</p><label class="field" for="deposit-${s.id}">Amount in naira<input id="deposit-${s.id}" data-overlay-value inputmode="numeric" value="${escapeText(overlay.value)}"></label><p class="field-error" role="status">${overlay.error||''}</p><div class="deposit-summary">Demo balance available to save: <b>${naira(s.depositBalance)}</b></div>${btn('Add to my goal','confirm-deposit')}`;
  if (overlay.type === 'goal') content = `<p>Give your next savings goal a name.</p><label class="field" for="goal-${s.id}">Goal name<input id="goal-${s.id}" data-overlay-value maxlength="28" placeholder="A new laptop" value="${escapeText(overlay.value)}"></label><p class="field-error" role="status">${overlay.error||''}</p><p class="small">Sample target: ₦50,000</p>${btn('Create sample goal','create-goal')}`;
  if (overlay.type === 'voucher') content = `<p>A sample partner voucher for your everyday essentials.</p><div class="voucher-code">DEMO-WAGE-2026</div><p class="small">Design preview only. This code cannot be redeemed. Partner, value and eligibility will be confirmed before launch.</p>${btn(`${icon('Download')} Save sample voucher`,'save-voucher')}`;
  if (overlay.type === 'reset') content = `<p>Restore the sample balances and start again? This clears the demo transactions and goals you added.</p>${btn('Reset sample account','reset')}${btn('Keep exploring','close-sheet','button-link')}`;
  return `<div class="sheet-backdrop"><section class="sheet" role="dialog" aria-modal="true" aria-label="${escapeText(overlay.title)}" tabindex="-1"><div class="row"><h3>${escapeText(overlay.title)}</h3>${ib('X','Close panel','close-sheet')}</div>${content}</section></div>`;
}

function phoneMarkup(s, isBoard = false) {
  const onboarding = ['welcome','priorities','verify'].includes(s.screen);
  return `<article class="phone theme-${s.theme} ${onboarding?'onboarding':''}" data-phone="${s.id}" data-theme="${s.theme}" aria-label="Wagezapp ${screenNames[s.screen]}, ${s.theme} mode" ${isBoard?'inert':''}>${statusbar()}<div class="app-content ${hasNavigation(s.screen)?'has-nav':''}" tabindex="-1" ${s.overlay?'inert':''}>${renderers[s.screen](s)}</div>${s.overlay?`<div inert>${nav(s)}</div>`:nav(s)}<div class="home-indicator"></div>${sheetMarkup(s)}</article>`;
}

function sidebar() {
  const starts = ['welcome','priorities','verify'];
  const everyday = [['Home','home'],['Wallet','savings'],['Gift','rewards'],['TrendingUp','score'],['ChartNoAxesCombined','activity'],['UserRound','profile'],['ArrowUpRight','advance']];
  return `<aside class="journey-sidebar"><p class="eyebrow">ONE CONNECTED DEMO</p><h2>Make yourself at home.</h2><p>Pick a screen, or start at the beginning and follow the journey.</p><div class="journey-groups"><div class="journey-group"><p>Getting started</p>${starts.map((screen,i)=>`<button data-jump="${screen}" ${session.screen===screen?'aria-current="page"':''}><span class="step">0${i+1}</span>${screenNames[screen]}</button>`).join('')}</div><div class="journey-group"><p>Everyday money</p>${everyday.map(([name,screen])=>`<button data-jump="${screen}" ${session.screen===screen?'aria-current="page"':''}>${icon(name)}${screenNames[screen]}</button>`).join('')}</div></div><button class="sidebar-reset" data-reset-request>${icon('RefreshCw')} Reset the demo</button></aside>`;
}

function syncUrl() {
  const next = new URLSearchParams(location.search);
  next.set('theme',appearance);
  next.set('view',view);
  next.set('screen',session.screen);
  try { history.replaceState(null,'',`${location.pathname}?${next}`); } catch {}
}

function exportFooter() {
  return `<div class="export-footer"><span>Wagezapp · Refined direction · ${appearance==='compare'?'Light and dark':appearance+' mode'}</span><span>Design demo · Fictional data · Placeholder wordmark</span></div>`;
}

function renderDemo() {
  const themes = appearance==='compare'?['light','dark']:[appearance];
  const title = exporting ? `Wagezapp / ${screenNames[session.screen]}` : screenNames[session.screen];
  return `<div class="workspace-inner">${sidebar()}<section class="stage" id="demo-stage" aria-label="Interactive app preview"><div class="stage-heading"><div><h2>${title}</h2><p>${screenNotes[session.screen]}</p></div><span class="stage-count">${appearance==='compare'?'ONE EXPERIENCE · TWO THEMES':appearance.toUpperCase()+' MODE'}</span></div><div class="phone-grid ${themes.length===1?'single':''}">${themes.map(theme=>`<div class="phone-frame"><div class="device-label"><span><i class="mode-dot ${theme==='dark'?'dark-dot':''}"></i>${theme} mode</span><small>Tap to explore</small></div>${phoneMarkup({...session,theme,id:`demo-${theme}`})}</div>`).join('')}</div><div class="stage-foot"><span>${appearance==='compare'?'Both previews share the same account and screen.':'Your place and balances stay the same when you switch themes.'}<br>Sample data only. No real payments.</span><button data-jump="welcome">Start from the welcome ↗</button></div></section></div>${exportFooter()}`;
}

function snapshot(screen, theme) {
  const s = {...initialSession(),screen,theme,id:`board-${theme}-${screen}`};
  if (screen==='priorities') s.priority='salary';
  if (screen==='review') s.consent=true;
  if (screen==='pin') {s.pin='12';s.consent=true;}
  if (screen==='success') {s.drawn=20000;s.lastAdvance=20000;}
  return s;
}

function renderBoard() {
  const themes = appearance==='compare'?['light','dark']:[appearance];
  const visibleGroups = exportGroup ? groups.filter(group=>group.id===exportGroup) : groups;
  return `<div class="board-page" id="demo-stage"><div class="board-page-heading"><div><p class="eyebrow">WAGEZAPP · THE REFINED DIRECTION</p><h2>${exportGroup?visibleGroups[0].title:'The whole experience, together.'}</h2></div><p>${appearance==='compare'?'Light and dark mode':appearance==='dark'?'Dark mode':'Light mode'} · One visual language</p></div>${themes.map(theme=>`<section class="board-theme" aria-label="${theme} mode screen boards"><h2>${theme==='light'?'In the light.':'After dark.'}</h2>${visibleGroups.map(group=>`<section class="board-section" data-board-group="${group.id}"><div class="board-heading"><span>${group.number}</span><h3>${group.title}</h3><small>${theme} mode · ${group.screens.length} screens</small></div><div class="board-grid ${group.screens.length===3?'three':''}">${group.screens.map(screen=>`<div class="phone-frame">${phoneMarkup(snapshot(screen,theme),true)}<p>${screenNames[screen]}</p><small>${screenNotes[screen]}</small></div>`).join('')}</div></section>`).join('')}</section>`).join('')}</div>${exportFooter()}`;
}

function paint({focus = null, keepScroll = false} = {}) {
  const scrolls = {};
  $$('.phone').forEach(phone => {scrolls[phone.dataset.theme] = $('.app-content',phone).scrollTop;});
  const lastScroll = Object.values(scrolls)[0] || 0;
  $('#workspace-content').innerHTML = view==='board'?renderBoard():renderDemo();
  $$('[data-appearance]').forEach(button => button.setAttribute('aria-pressed',String(button.dataset.appearance===appearance)));
  $$('[data-view]').forEach(button => button.setAttribute('aria-pressed',String(button.dataset.view===view)));
  if (keepScroll && view==='demo') $$('.phone').forEach(phone => {$('.app-content',phone).scrollTop = scrolls[phone.dataset.theme] ?? lastScroll;});
  if (focus && view==='demo') {
    const phone = $(`[data-phone="${focus}"]`) || $('.phone');
    (session.overlay?$('.sheet',phone):$('.app-content',phone))?.focus({preventScroll:true});
  }
  syncUrl();
  document.title = `Wagezapp · ${screenNames[session.screen]} · ${appearance==='compare'?'Light and dark':appearance}`;
}

function announce(text) { $('#announcement').textContent=text; }
function toast(text) {
  $$('.phone').forEach(phone => { $('.phone-toast',phone)?.remove(); const el=document.createElement('div');el.className='phone-toast';el.setAttribute('role','status');el.textContent=text;phone.append(el);setTimeout(()=>el.remove(),3500); });
  announce(text);
}
function navigate(screen, source) {
  if (!Object.hasOwn(renderers,screen)) return;
  const previousScreen=session.screen;
  session.screen=screen; session.overlay=null; session.pin=''; session.pinError=false;
  if (screen==='advance'&&!['review','pin','advance'].includes(previousScreen)) {session.amount=Math.min(20000,remaining(session));session.amountFresh=true;}
  if (screen==='review') session.consent=false;
  view='demo';paint({focus:source});announce(`${screenNames[screen]} opened`);
}
function showSheet(overlay, source) {session.overlay=overlay;paint({focus:source,keepScroll:true});}
function download(name, content) {const url=URL.createObjectURL(new Blob([content],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function validAmount(s = session) {return Number.isInteger(s.amount)&&s.amount>=1000&&s.amount<=remaining(s);}
function updateAmount(sourceInput = null) {
  $$('.phone').forEach(phone => {
    const input=$('[data-amount]',phone);
    if(input&&input!==sourceInput) input.value=session.amount.toLocaleString('en-NG');
    const error=$('[data-amount-error]',phone);if(error)error.textContent=validAmount()?'':`Enter an amount from ₦1,000 to ${naira(remaining(session))}.`;
    const button=$('[data-action="review"]',phone);if(button)button.disabled=!validAmount();
    const headroom=$('[data-headroom]',phone);if(headroom)headroom.textContent=naira(Math.max(0,remaining(session)-session.amount));
    $$('[data-action="quick-amount"]',phone).forEach(button=>button.classList.toggle('selected',Number(button.dataset.value)===session.amount));
    const range=$('[data-range]',phone);if(range)range.value=session.amount;
  });
}
function updateConsent() {$$('.phone [data-consent]').forEach(input=>input.checked=session.consent);$$('.phone [data-action="confirm-review"]').forEach(button=>button.disabled=!session.consent);}

document.addEventListener('click', event => {
  const target=event.target.closest('button');if(!target)return;
  const phone=target.closest('[data-phone]');const source=phone?.dataset.phone;
  if(target.dataset.appearance){appearance=target.dataset.appearance;paint({keepScroll:true});announce(`${appearance==='compare'?'Light and dark':appearance+' mode'} preview`);return;}
  if(target.dataset.view){view=target.dataset.view;session.overlay=null;paint();return;}
  if(target.dataset.jump){navigate(target.dataset.jump,source);return;}
  if(target.hasAttribute('data-reset-request')){showSheet({type:'reset',title:'A fresh start?'},source||`demo-${appearance==='dark'?'dark':'light'}`);return;}
  if(!phone || view!=='demo')return;
  const action=target.dataset.action;
  if(action==='go'){navigate(target.dataset.screen,source);return;}
  if(action==='info'){showSheet({type:'info',title:target.dataset.title,body:target.dataset.body},source);return;}
  if(action==='close-sheet'){session.overlay=null;paint({focus:source,keepScroll:true});return;}
  if(action==='notifications'){showSheet({type:'notifications',title:'Your updates'},source);return;}
  if(action==='balance'){session.hidden=!session.hidden;paint({keepScroll:true});return;}
  if(action==='priority'){session.priority=target.dataset.value;paint({keepScroll:true});return;}
  if(action==='priority-next'){if(session.priority)navigate('verify',source);return;}
  if(action==='quick-amount'){session.amount=Number(target.dataset.value);session.amountFresh=true;updateAmount();return;}
  if(action==='review'){if(validAmount())navigate('review',source);else updateAmount();return;}
  if(action==='confirm-review'){if(session.consent&&validAmount())navigate('pin',source);return;}
  if(action==='pin-key'){
    const key=target.dataset.value;session.pin=key==='delete'?session.pin.slice(0,-1):key==='clear'?'':(session.pin+key).slice(0,4);session.pinError=false;paint({focus:source,keepScroll:true});return;
  }
  if(action==='complete'){
    if(session.pin!=='1234'){session.pinError=true;session.pin='';paint({focus:source,keepScroll:true});return;}
    if(!session.consent||!validAmount()){navigate('advance',source);return;}
    session.drawn+=session.amount;session.lastAdvance=session.amount;
    session.newActivity.unshift({kind:'advance',icon:'ArrowDownLeft',title:'Salary advance',date:'Just now · Successful',amount:session.amount,body:`A simulated ${naira(session.amount)} advance to your salary account. Fee ₦0, repayable through payroll on 30 September.`});
    navigate('success',source);return;
  }
  if(action==='receipt'){download('Wagezapp-demo-receipt.txt',`WAGEZAPP DEMO RECEIPT\n\nSimulated transaction. No money was moved.\n\nAccount: Adaora Okafor, salary account ending 4821\nAdvance: ${naira(session.lastAdvance)}\nFee: ₦0\nRepayment: ${naira(session.lastAdvance)} via payroll on 30 September\nReference: WZ-DEMO-4821\n`);toast('Demo receipt saved.');return;}
  if(['deposit','rent-deposit','new-deposit'].includes(action)){showSheet({type:'deposit',title:'A little towards your goal',goal:action==='rent-deposit'?'rent':action==='new-deposit'?'new':'emergency',value:'5000',error:''},source);return;}
  if(action==='confirm-deposit'){
    const overlay=session.overlay;const value=Number(overlay.value.replaceAll(',',''));
    if(!Number.isInteger(value)||value<100||value>session.depositBalance){overlay.error=`Enter a whole amount from ₦100 to ${naira(session.depositBalance)}.`;paint({focus:source,keepScroll:true});return;}
    session.savings+=value;session.depositBalance-=value;
    if(overlay.goal==='rent')session.rent+=value;else if(overlay.goal==='new')session.newGoalAmount+=value;else session.emergency+=value;
    const goalName=overlay.goal==='rent'?'A place of my own':overlay.goal==='new'?session.newGoal:'Rainy day fund';
    session.newActivity.unshift({kind:'savings',icon:'PiggyBank',title:goalName,date:'Just now · Successful',amount:value,body:`A sample ${naira(value)} deposit into ${goalName}.`});
    session.overlay=null;paint({focus:source,keepScroll:true});toast(`${naira(value)} added to your goal.`);return;
  }
  if(action==='new-goal'){showSheet({type:'goal',title:'Make room for a plan',value:'',error:''},source);return;}
  if(action==='create-goal'){
    const overlay=session.overlay;const value=overlay.value.trim();
    if(!value||session.newGoal){overlay.error=session.newGoal?'This preview supports one extra goal. Add to your existing goal.':'Enter a name for your goal.';paint({focus:source,keepScroll:true});return;}
    session.newGoal=value;session.newGoalAmount=0;session.overlay=null;paint({focus:source,keepScroll:true});toast('Your sample goal is ready.');return;
  }
  if(action==='autosave'){session.autoSave=!session.autoSave;paint({keepScroll:true});toast(session.autoSave?'Payday saving turned on.':'Payday saving paused.');return;}
  if(action==='voucher'){session.claimed=true;showSheet({type:'voucher',title:'A little thank you'},source);return;}
  if(action==='save-voucher'){download('Wagezapp-sample-voucher.txt','WAGEZAPP SAMPLE VOUCHER\n\nDEMO-WAGE-2026\n\nDesign preview only. Not redeemable. No cash value. Partner, value and eligibility to be confirmed.');toast('Sample voucher saved.');return;}
  if(action==='filter'){session.filter=target.dataset.value;paint({keepScroll:true});return;}
  if(action==='app-theme'){appearance=target.dataset.theme;paint({keepScroll:true});return;}
  if(action==='reset-prompt'){showSheet({type:'reset',title:'A fresh start?'},source);return;}
  if(action==='reset'){session=initialSession();paint({focus:source});announce('Sample account reset');return;}
});

document.addEventListener('input', event => {
  if(!event.target.closest('[data-phone]') || view!=='demo')return;
  if(event.target.matches('[data-amount]')){session.amount=Number(event.target.value.replace(/[^0-9]/g,'').slice(0,7))||0;session.amountFresh=false;updateAmount(event.target);}
  if(event.target.matches('[data-range]')){session.amount=Number(event.target.value);session.amountFresh=true;updateAmount();}
  if(event.target.matches('[data-consent]')){session.consent=event.target.checked;updateConsent();}
  if(event.target.matches('[data-overlay-value]')){session.overlay.value=event.target.value;$$('[data-overlay-value]').forEach(input=>{if(input!==event.target)input.value=event.target.value;});}
});
document.addEventListener('focusout',event=>{if(event.target.matches('[data-amount]'))event.target.value=session.amount.toLocaleString('en-NG');});
document.addEventListener('keydown', event => {
  const phone=event.target.closest('[data-phone]');
  if(event.key==='Escape'&&session.overlay){session.overlay=null;paint({focus:phone?.dataset.phone,keepScroll:true});return;}
  const sheet=event.target.closest('.sheet');
  if(sheet&&event.key==='Tab'){
    const controls=$$('button:not(:disabled), input, [tabindex="0"]',sheet);const first=controls[0],last=controls.at(-1);
    if(event.shiftKey&&(document.activeElement===first||document.activeElement===sheet)){event.preventDefault();last?.focus();}
    else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}
  }
});

paint();
