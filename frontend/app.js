const API = "/api";
let token = localStorage.token,
  user = JSON.parse(localStorage.user || "null"),
  tab = "agenda";
const $ = (s) => document.querySelector(s),
  headers = () => ({
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  });
async function req(p, o = {}) {
  let r = await fetch(API + p, {
    ...o,
    headers: { ...headers(), ...(o.headers || {}) },
  });
  let d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.detail || "Erro");
  return d;
}
const logo = () => `<img class="app-image brand-logo" src="/treinamaislogo.png" alt="App de Treinos Treinador">`;
const CONTACT = { instagram: localStorage.DANTE_INSTAGRAM || "", whatsapp: localStorage.DANTE_WHATSAPP || "" };
let activeWorkoutTimer = null;
function login() {
  app.innerHTML = `<main class="auth"><section class="auth-card">${logo()}<div><h1 class="page-heading accent">App de Treinos</h1><p class="text-paragraph muted">Agenda, treinos e evolução do time.</p></div><form class="app-form" id="f"><label class="field">Usuário<input class="form-control" id="u" autocomplete="username" required></label><label class="field">Senha<input class="form-control" id="p" type="password" autocomplete="current-password" required></label><button class="ui-button btn wide">Entrar</button><button type="button" class="ui-button forgot-link" onclick="forgotPassword()">Esqueci minha senha</button><p id="err" class="text-paragraph error"></p></form><div class="auth-divider"><span>Primeiro acesso?</span></div><div class="auth-actions"><button class="ui-button btn ghost" onclick="register('professor')">Criar conta de professor</button><button class="ui-button btn ghost" onclick="register('student')">Criar conta de aluno</button></div></section></main>`;
  f.onsubmit = async (e) => {
    e.preventDefault();
    let body = new URLSearchParams({ username: u.value, password: p.value });
    let r = await fetch(API + "/login", { method: "POST", body });
    if (!r.ok) {
      err.textContent = "Usuário ou senha inválidos";
      return;
    }
    saveSession(await r.json());
  };
}
function forgotPassword() {
  app.innerHTML = `<main class="auth"><section class="auth-card">${logo()}<button class="ui-button text-btn" onclick="login()">Voltar ao login</button><div><h1 class="page-heading">Redefinir senha</h1><p class="text-paragraph muted">Informe seu usuário, o código de acesso e escolha uma nova senha.</p></div><form class="app-form" id="resetf"><label class="field">Usuário<input class="form-control" id="resetUser" autocomplete="username" required></label><label class="field">Código de acesso<input id="resetCode" maxlength="5" minlength="5" pattern="[A-Za-z0-9]{5}" class="form-control code-input" placeholder="A1B2C" required></label><label class="field">Nova senha<input class="form-control" id="resetPass" type="password" minlength="5" autocomplete="new-password" required></label><label class="field">Confirmar nova senha<input class="form-control" id="resetConfirm" type="password" minlength="5" autocomplete="new-password" required></label><button class="ui-button btn wide">Redefinir senha</button><p id="resetErr" class="text-paragraph error"></p><p id="resetOk" class="text-paragraph success"></p></form></section></main>`;
  resetf.onsubmit = async (e) => {
    e.preventDefault();
    resetErr.textContent = "";
    resetOk.textContent = "";
    if (resetPass.value !== resetConfirm.value) {
      resetErr.textContent = "As senhas não coincidem.";
      return;
    }
    try {
      let r = await fetch(API + "/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: resetUser.value,
          invite_code: resetCode.value,
          new_password: resetPass.value,
        }),
      });
      let d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.detail || "Não foi possível redefinir a senha");
      resetOk.textContent = "Senha redefinida. Redirecionando para o login...";
      setTimeout(login, 1200);
    } catch (e) {
      resetErr.textContent = e.message;
    }
  };
}

async function register(role) {
  let professors = [];
  if (role === "student")
    professors = await fetch(API + "/public/professors").then((r) => r.json());
  app.innerHTML = `<main class="auth"><section class="auth-card">${logo()}<button class="ui-button text-btn" onclick="login()">Voltar ao login</button><div><h1 class="page-heading">${role === "professor" ? "Professor" : "Aluno"}</h1><p class="text-paragraph muted">Use o código de 5 caracteres fornecido pelo professor.</p></div><form class="app-form" id="rf"><label class="field">Nome completo<input class="form-control" id="rn" required></label><label class="field">Usuário<input class="form-control" id="ru" required></label>${role === "student" ? `<label class="field">Professor<select class="form-select" id="rp" required><option value="">Selecione</option>${professors.map((x) => `<option value="${x.id}">${x.name}</option>`).join("")}</select></label>` : ""}<label class="field">Senha<input class="form-control" id="rpass" type="password" minlength="5" required></label><label class="field">Código de acesso<input id="rcode" maxlength="5" minlength="5" pattern="[A-Za-z0-9]{5}" class="form-control code-input" placeholder="A1B2C" required></label><button class="ui-button btn wide">Criar conta</button><p id="rerr" class="text-paragraph error"></p></form></section></main>`;
  rf.onsubmit = async (e) => {
    e.preventDefault();
    try {
      let d = await fetch(API + "/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: rn.value,
          username: ru.value,
          password: rpass.value,
          role,
          invite_code: rcode.value,
          professor_id: role === "student" ? +rp.value : null,
        }),
      }).then(async (r) => {
        let d = await r.json();
        if (!r.ok) throw Error(d.detail || "Não foi possível criar a conta");
        return d;
      });
      saveSession(d);
    } catch (e) {
      rerr.textContent = e.message;
    }
  };
}
function saveSession(d) {
  token = d.access_token;
  user = d.user;
  localStorage.token = token;
  localStorage.user = JSON.stringify(user);
  tab = user.role === "student" ? "treino" : "alunos";
  if(user.role === "student") { req("/me").then(details=>{if(details.contact_pending){tab="perfil";render();}}).catch(()=>{}); }
  render();
}
function menuItems() {
  return user.role === "student"
    ? [["treino","⌁","Meu treino"],["aulas","▦","Minhas aulas"],["evolucao","↗","Evolução"],["perfil","👤","Meu perfil"],["contato","@","Contato"]]
    : [["agenda","▦","Minha agenda"],["alunos","◎","Alunos"],["pagamentos","$","Pagamentos"],["fotos","↗","Avaliação"],["contato","@","Contato"]];
}
function nav() {
  return `<header class="topbar"><div class="brand-inline nav-logo-only">${logo()}</div><button class="ui-button menu-button" onclick="toggleMenu(true)" aria-label="Abrir menu"><span class="hamburger-icon" aria-hidden="true"><span class="hamburger-line hamburger-line-top"></span><span class="hamburger-line hamburger-line-middle"></span><span class="hamburger-line hamburger-line-bottom"></span></span></button><div class="user-chip"><div class="user-chip-details"><b class="user-name">${user.name}</b><span class="user-role">${user.role}</span></div></div></header><div class="menu-overlay" onclick="toggleMenu(false)"></div><aside class="sidebar"><div class="sidebar-head">${logo()}<button class="ui-button menu-close" onclick="toggleMenu(false)">×</button></div><div class="profile"><b class="profile-name">${user.name}</b><span class="profile-role">${user.role === "student" ? "Aluno" : "Equipe"}</span></div><nav class="side-nav">${menuItems().map(x=>`<button class="ui-button side-link ${tab===x[0]?"active":""}" onclick="setTab('${x[0]}')"><i class="side-icon">${x[1]}</i><span class="side-label">${x[2]}</span></button>`).join("")}</nav><button class="ui-button side-link logout" onclick="logout()"><i class="side-icon">↪</i><span class="side-label">Sair</span></button></aside>`;
}
function setTab(nextTab) {
  tab = nextTab;
  toggleMenu(false);
  render();
}

function toggleMenu(open) {
  document.body.classList.toggle("menu-open", open);
}
async function render() {
  if (!token) return login();
  app.innerHTML = `${nav()}<main class="shell"><div class="page-title"><h1 class="page-heading">${menuItems().find((x) => x[0] === tab)?.[2] || "Painel"}</h1></div><div id="view"></div></main>`;
  try {
    if (tab === "contato") return contato();
    if (user.role === "student") return tab === "perfil" ? meuPerfil() : tab === "evolucao" ? evolucao() : tab === "aulas" ? agendaAluno() : treino();
    if (tab === "alunos") return alunos();
    if (tab === "fotos") return fotosAlunos();
    if (tab === "pagamentos") return pagamentos();
    return agenda(tab === "time");
  } catch (e) {
    view.innerHTML = `<div class="card error">${e.message}</div>`;
  }
}
const escapeHTML = v => String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let calendarMonth=new Date().toISOString().slice(0,7);
function lessonCalendar(rows){
 const [y,m]=calendarMonth.split('-').map(Number),first=new Date(y,m-1,1),offset=(first.getDay()+6)%7,last=new Date(y,m,0).getDate();
 return `<div class="calendar-head"><button class="calendar-arrow" aria-label="Mês anterior" onclick="shiftStudentCalendar(-1)">←</button><b>${first.toLocaleDateString('pt-BR',{month:'long',year:'numeric'})}</b><button class="calendar-arrow" aria-label="Próximo mês" onclick="shiftStudentCalendar(1)">→</button></div><div class="lesson-calendar">${['S','T','Q','Q','S','S','D'].map(d=>`<b class="lesson-calendar-weekday">${d}</b>`).join('')}${Array(offset).fill('<span></span>').join('')}${Array.from({length:last},(_,i)=>{let day=`${calendarMonth}-${String(i+1).padStart(2,'0')}`,events=rows.filter(x=>x.scheduled_date===day);return `<div class="calendar-day"><b class="calendar-day-number">${i+1}</b>${events.map(x=>`<span class="lesson-dot ${x.status||'pending'}" title="${escapeHTML(x.student)} ${escapeHTML(x.time)}"></span>`).join('')}</div>`}).join('')}</div>`;
}
function shiftCalendar(delta){const [y,m]=calendarMonth.split('-').map(Number);calendarMonth=new Date(y,m-1+delta,1).toISOString().slice(0,7);render();}
function shiftStudentCalendar(delta){const [y,m]=calendarMonth.split('-').map(Number);const d=new Date(y,m-1+delta,1);calendarMonth=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;if(tab==='alunos' && selectedStudentId)studentCalendar(selectedStudentId);else agendaAluno();}
async function agendaAluno(){const rows=await req('/lessons');view.innerHTML=`<section class="card"><h2>Calendário de aulas</h2>${lessonCalendar(rows)}<div class="list">${rows.map(x=>`<div class="row"><b>${escapeHTML(x.scheduled_date||'Sem data')} · ${escapeHTML(x.time)}</b><span class="lesson-status ${x.status}">${x.status==='completed'?'Concluída':x.status==='cancelled'?'Cancelada':'Pendente'}</span></div>`).join('')}</div></section>`;}
async function agenda(){
 const [rows,students]=await Promise.all([req('/lessons'),req('/students')]);
 const today=new Date();const localDate=`${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
 const daily=rows.filter(x=>x.scheduled_date===localDate).sort((a,b)=>String(a.time).localeCompare(String(b.time)));
 view.innerHTML=`<div class="agenda-layout"><section class="agenda-schedule-card"><h2 class="agenda-title">Cadastrar aula</h2><form class="agenda-form" id="lf"><label class="agenda-field">Aluno<select class="agenda-select" name="student_id" required>${students.map(x=>`<option value="${x.id}">${escapeHTML(x.name)}</option>`).join('')}</select></label><label class="agenda-field">Data<input class="agenda-input" type="date" name="scheduled_date" value="${localDate}" required></label><label class="agenda-field">Horário<input class="agenda-input" type="time" name="time" required></label><button class="agenda-submit agenda-action" type="submit">Agendar aula</button></form></section><section class="agenda-daily-card"><h2 class="agenda-title">Aulas do dia</h2><p class="agenda-date">${today.toLocaleDateString('pt-BR',{day:'2-digit',month:'long',year:'numeric'})}</p><div class="agenda-daily-list">${daily.map(x=>`<article class="agenda-lesson"><div class="agenda-lesson-info"><strong class="agenda-student-name">${escapeHTML(x.student)}</strong><span class="agenda-lesson-time">${escapeHTML(x.time)}</span><span class="agenda-lesson-status agenda-status-${x.status||'pending'}">${x.status==='completed'?'Concluída':x.status==='cancelled'?'Cancelada':'Pendente'}</span></div><div class="agenda-actions"><button class="agenda-complete agenda-action" onclick="changeLesson(${x.id},'completed')" aria-label="Concluir aula" title="Concluir aula" ${x.status==='completed'?'disabled':''}>✓</button><button class="agenda-delete agenda-action" onclick="delLesson(${x.id})" aria-label="Excluir aula" title="Excluir aula">Excluir</button></div></article>`).join('')||'<p class="agenda-empty">Nenhuma aula agendada para hoje.</p>'}</div></section></div>`;
 lf.onsubmit=async e=>{e.preventDefault();try{await req('/lessons',{method:'POST',body:JSON.stringify(Object.fromEntries(new FormData(lf)))});render()}catch(err){alert(err.message)}};
}
async function changeLesson(id,status){await req(`/lessons/${id}/status?status=${status}`,{method:'PATCH'});render();}
async function delLesson(id){if(confirm('Excluir esta aula?')){await req('/lessons/'+id,{method:'DELETE'});render();}}

let selectedStudentId=null;
async function studentCalendar(id){
 const panel=document.getElementById('student-inline-calendar-'+id);
 if(!panel)return;
 if(!panel.hidden){panel.hidden=true;panel.innerHTML='';selectedStudentId=null;return;}
 document.querySelectorAll('.student-inline-calendar').forEach(el=>{el.hidden=true;el.innerHTML='';});
 selectedStudentId=id;
 try{
  const all=await req('/lessons');
  if(selectedStudentId!==id)return;
  const rows=all.filter(x=>Number(x.student_id)===Number(id));
  panel.hidden=false;
  panel.innerHTML=`<div class="student-calendar-inline-header"><h3 class="student-calendar-inline-title">Calendário de aulas</h3><button class="student-calendar-inline-close" type="button" aria-label="Fechar calendário" onclick="studentCalendar(${id})">✕</button></div><form class="student-schedule-form" id="studentSchedule-${id}"><label class="student-schedule-label">Data<input class="student-schedule-date" type="date" name="scheduled_date" required></label><label class="student-schedule-label">Horário<input class="student-schedule-time" type="time" name="time" required></label><button class="student-schedule-submit student-calendar-action">Agendar aula</button></form>${lessonCalendar(rows)}`;
  panel.querySelector('form').onsubmit=async e=>{e.preventDefault();const data=Object.fromEntries(new FormData(e.target));data.student_id=id;try{await req('/lessons',{method:'POST',body:JSON.stringify(data)});panel.hidden=true;await studentCalendar(id)}catch(err){alert(err.message)}};
 }catch(err){panel.hidden=false;panel.innerHTML=`<p class="student-calendar-error">${escapeHTML(err.message)}</p>`;}
}
async function studentLessonAction(sid,id,status){await changeLesson(id,status);await studentCalendar(sid)}
async function studentLessonDelete(sid,id){await delLesson(id);await studentCalendar(sid)}
async function studentPayment(id){expandedPaymentStudents.add(String(id));tab='pagamentos';await render();const el=document.querySelector(`[data-payment-student="${id}"]`);if(el){el.open=true;el.scrollIntoView({block:'start',behavior:'smooth'});}}
async function studentProfile(id){
 const ss=await req('/students');const s=ss.find(x=>Number(x.id)===Number(id));if(!s)return;
 view.innerHTML=`<section class="student-profile-card"><button class="student-profile-back" onclick="alunos()">← Alunos</button><h2 class="student-profile-title">Perfil de ${escapeHTML(s.name)}</h2><p class="student-profile-detail">Usuário: @${escapeHTML(s.username)}</p><p class="student-profile-detail">E-mail: ${escapeHTML(s.email||'Aguardando cadastro do aluno')}</p><p class="student-profile-detail">Telefone: ${escapeHTML(s.phone||'Aguardando cadastro do aluno')}</p></section>`;
}
async function meuPerfil(){
 const s=await req('/me');view.innerHTML=`<section class="student-profile-card"><h2 class="student-profile-title">Meus contatos</h2>${s.contact_pending?'<p class="student-profile-notice" role="status">Seu professor criou sua conta. Cadastre seu telefone e e-mail para completar seu perfil.</p>':''}<form id="contactForm" class="student-contact-form"><label class="student-contact-label">E-mail<input class="student-contact-input" type="email" name="email" value="${escapeHTML(s.email||'')}" required></label><label class="student-contact-label">Telefone<input class="student-contact-input" type="tel" name="phone" value="${escapeHTML(s.phone||'')}" required></label><button class="student-contact-save">Salvar contatos</button></form></section>`;
 document.querySelector('#contactForm').onsubmit=async e=>{e.preventDefault();try{await req('/me/contact',{method:'PUT',body:JSON.stringify(Object.fromEntries(new FormData(e.target)))});alert('Contatos salvos!');meuPerfil()}catch(err){alert(err.message)}};
}
async function alunos() {
 const ss=await req('/students');
 view.innerHTML=`<div class="grid"><section class="card"><h2 class="section-heading">Adicionar aluno</h2><p class="text-paragraph muted">Após cadastrar, peça ao aluno que acesse sua conta para informar telefone e e-mail.</p><form class="app-form" id="sf"><label class="field">Nome<input class="form-control" id="sn" required></label><label class="field">Usuário<input class="form-control" id="su" required></label><label class="field">Senha inicial<input class="form-control" id="sp" minlength="5" required></label><button class="ui-button btn">Cadastrar diretamente</button></form></section><section class="card"><h2 class="section-heading">Meus alunos</h2><div class="list">${ss.map(s=>`<div class="row student-list-row"><div class="student-list-info"><b class="row-title">${escapeHTML(s.name)}</b><div class="muted">@${escapeHTML(s.username)}</div></div><div class="student-nav-actions"><button class="student-nav-button" aria-label="Treinos" title="Treinos" onclick="workout(${s.id},'${escapeHTML(s.name).replaceAll('&#39;','')}')"><span class="student-nav-icon">🏋️</span></button><button class="student-nav-button" aria-label="Avaliação" title="Avaliação" onclick="openEvaluationPage()"><span class="student-nav-icon">↗</span></button><button class="student-nav-button" aria-label="Calendário" title="Calendário" onclick="studentCalendar(${s.id})"><svg class="student-calendar-svg" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M7 3v4M17 3v4M3 10h18" fill="none" stroke="currentColor" stroke-width="1.8"/></svg></button><button class="student-nav-button" aria-label="Pagamento" title="Pagamento" onclick="studentPayment(${s.id})"><span class="student-nav-icon">💳</span></button><button class="student-nav-button" aria-label="Perfil" title="Perfil" onclick="studentProfile(${s.id})"><span class="student-nav-icon">👤</span></button></div><div class="student-inline-calendar" id="student-inline-calendar-${s.id}" hidden></div></div>`).join('')||'<span class="empty">Nenhum aluno.</span>'}</div></section></div><div id="editor"></div>`;
 document.querySelector('#sf').onsubmit=async e=>{e.preventDefault();try{await req('/students',{method:'POST',body:JSON.stringify({name:sn.value,username:su.value,password:sp.value})});await alunos()}catch(err){alert(err.message)}};
}

let workoutExercises=[];
function addExercise(){workoutExercises.push({key:crypto.randomUUID(),name:'',sets:3,note:''});drawExerciseEditor();}
function drawExerciseEditor(){const box=document.querySelector('#exerciseEditor');if(!box)return;box.innerHTML=workoutExercises.map((x,i)=>`<div class="exercise-edit"><b>Exercício ${i+1}</b><label class="field">Nome<input class="form-control" data-ex="${i}" data-prop="name" value="${escapeHTML(x.name)}" required></label><label class="field">Séries<input class="form-control" data-ex="${i}" data-prop="sets" type="number" min="1" max="20" value="${x.sets}" required></label><label class="field">Observações<textarea class="form-textarea" data-ex="${i}" data-prop="note">${escapeHTML(x.note)}</textarea></label><button type="button" class="ui-button btn ghost" onclick="removeExercise(${i})">Remover exercício</button></div>`).join('');box.querySelectorAll('[data-ex]').forEach(el=>el.addEventListener('input',()=>{workoutExercises[+el.dataset.ex][el.dataset.prop]=el.dataset.prop==='sets'?Number(el.value):el.value;}));}
function removeExercise(i){workoutExercises.splice(i,1);drawExerciseEditor();}
function formatPublishedExercises(content){let exercises;try{exercises=JSON.parse(content)}catch{return escapeHTML(content||'')}return Array.isArray(exercises)?exercises.map(x=>`<div class="student-workout-exercise"><strong>${escapeHTML(x.name||'Exercício')}</strong><span>${Number(x.sets)||0} séries</span>${x.note?`<small class="student-workout-exercise-note">${escapeHTML(x.note)}</small>`:''}</div>`).join(''):escapeHTML(content||'');}
async function workout(id,name){const all=await req('/workouts');editor.innerHTML=`<section class="card editor"><h2>Treino de ${escapeHTML(name)}</h2><div class="list">${all.filter(x=>Number(x.student_id)===Number(id)).map(x=>`<details class="student-workout-entry"><summary class="student-workout-summary">${escapeHTML(x.title)} · ${escapeHTML(x.periodization||'Treino publicado')}</summary><div class="student-workout-exercises">${formatPublishedExercises(x.content)}</div></details>`).join('') || '<p class="student-workout-empty">Nenhum treino publicado para este aluno.</p>'}</div><form class="app-form" id="wf"><label class="field">Título<input class="form-control" name="title" required></label><label class="field">Periodização<input class="form-control" name="periodization"></label><div id="exerciseEditor"></div><button class="ui-button btn ghost" type="button" onclick="addExercise()">+ Adicionar exercício</button><button class="ui-button btn">Enviar para o aluno</button></form></section>`;workoutExercises=[];addExercise();wf.onsubmit=async e=>{e.preventDefault();if(!workoutExercises.length||workoutExercises.some(x=>!x.name.trim()||x.sets<1)){alert('Preencha os exercícios e séries.');return;}try{await req('/workouts',{method:'POST',body:JSON.stringify({student_id:id,title:wf.querySelector('[name="title"]').value,periodization:wf.querySelector('[name="periodization"]').value,content:JSON.stringify(workoutExercises)})});alert('Treino enviado ao aluno.');alunos();}catch(err){alert(err.message)}};}
async function treino(){let ws=await req('/workouts');view.innerHTML=`<div class="workout-links">${ws.map(w=>`<details class="card workout-slide"><summary class="workout-slide-summary">${escapeHTML(w.title)} <span>⌄</span></summary><div class="workout-preview" id="preview-${w.id}"></div><button class="ui-button btn" onclick="treinoDetalhe(${w.id})">Realizar treino</button></details>`).join('')||'<section class="card">Nenhum treino disponível.</section>'}</div>`;ws.forEach(w=>{let ex=[];try{ex=JSON.parse(w.content)}catch{}document.getElementById('preview-'+w.id).innerHTML=Array.isArray(ex)?ex.map(x=>`<div class="row">${escapeHTML(x.name)} · ${x.sets} séries</div>`).join(''):escapeHTML(w.content)});}
let workoutPlayer=null;
async function treinoDetalhe(id){
 const w=await req('/workouts/'+id);let exercises=[];try{exercises=JSON.parse(w.content)}catch{}if(!Array.isArray(exercises))exercises=[];
 const steps=exercises.flatMap((ex,index)=>Array.from({length:Math.max(0,Number(ex.sets)||0)},(_,j)=>({ex,index,set:j+1})));
 view.innerHTML=`<section class="training-player"><button class="training-player-back training-player-action" onclick="leaveWorkoutPlayer()">← Treinos</button><h1 class="training-player-title">${escapeHTML(w.title)}</h1><div class="training-player-stage" id="trainingStage"></div><div class="training-player-timer">Tempo de treino <strong class="training-player-timer-value" id="timerText">00:00:00</strong></div><button class="training-player-start training-player-action" id="startWorkout">Iniciar treino</button><button class="training-player-finish training-player-action" id="finishWorkout" disabled>Finalizar treino</button></section>`;
 workoutPlayer={id,title:w.title,steps,index:0,started:false};document.querySelector('#startWorkout').onclick=()=>{if(!steps.length){alert('Este treino não possui séries cadastradas.');return;}workoutPlayer.started=true;startWorkoutTimer(id,w.title);renderWorkoutStep();};document.querySelector('#finishWorkout').onclick=()=>finishWorkoutTimer(id,w.title);
 document.querySelector('#trainingStage').innerHTML='<p class="training-player-intro">Inicie o treino para registrar cada série e sua carga.</p>';
}
function renderWorkoutStep(){const p=workoutPlayer,stage=document.querySelector('#trainingStage');if(!p||!stage)return;const step=p.steps[p.index];if(!step){stage.innerHTML='<h2 class="training-player-complete">Todas as séries registradas!</h2>';document.querySelector('#finishWorkout').disabled=false;return;}
 stage.innerHTML=`<div class="training-player-progress">Série ${p.index+1} de ${p.steps.length}</div><h2 class="training-player-exercise">${escapeHTML(step.ex.name)}</h2><div class="training-player-series">Série ${step.set} de ${step.ex.sets}</div>${step.ex.note?`<p class="training-player-note">${escapeHTML(step.ex.note)}</p>`:''}<form class="training-player-form" id="trainingSetForm"><label class="training-player-load-label">Carga utilizada (kg)<input class="training-player-load" type="number" min="0" max="2000" step="0.5" inputmode="decimal" required autofocus></label><button class="training-player-check training-player-action" aria-label="Concluir série">✓ Concluir série</button></form>`;
 document.querySelector('#trainingSetForm').onsubmit=async e=>{e.preventDefault();const button=e.target.querySelector('button');button.disabled=true;try{await req('/workout-sets',{method:'POST',body:JSON.stringify({workout_id:p.id,exercise_key:step.ex.key,exercise_name:step.ex.name,set_number:step.set,load_kg:Number(e.target.querySelector('input').value)})});p.index++;renderWorkoutStep();}catch(err){button.disabled=false;alert(err.message)}};
}
function leaveWorkoutPlayer(){if(activeWorkoutTimer){clearInterval(activeWorkoutTimer.interval);activeWorkoutTimer=null;}workoutPlayer=null;treino();}
function drawLoadChart(i,rows){const el=document.getElementById('chart-'+i);if(!el)return;const recent=rows.slice(-16),max=Math.max(1,...recent.map(x=>x.load_kg));el.innerHTML=`<p class="muted">Evolução de cargas por série</p><div class="load-bars">${recent.map(x=>`<div class="load-bar" style="height:${Math.max(8,x.load_kg/max*125)}px" title="${escapeHTML(x.performed_at)}"><span class="load-bar-label">${x.load_kg}kg</span></div>`).join('')}</div>${recent.length?'':'<p class="muted">Registre séries para visualizar o gráfico.</p>'}`;}
function startWorkoutTimer(id, title) {
  if (activeWorkoutTimer) clearInterval(activeWorkoutTimer.interval);
  const startButton = document.querySelector("#startWorkout");
  const finishButton = document.querySelector("#finishWorkout");
  const timerDisplay = document.querySelector("#timerText");
  if (!startButton || !finishButton || !timerDisplay) return;
  const started = Date.now(); activeWorkoutTimer = { id, title, started };
  startButton.disabled = true; finishButton.disabled = false; timerDisplay.textContent = "00:00:00";
  activeWorkoutTimer.interval = setInterval(() => { timerDisplay.textContent = formatDuration(Date.now() - started); }, 1000);
}
function formatDuration(ms){ let t=Math.floor(ms/1000),h=Math.floor(t/3600),m=Math.floor((t%3600)/60),s=t%60; return [h,m,s].map(v=>String(v).padStart(2,'0')).join(':'); }
async function finishWorkoutTimer(id,title){
  if(!activeWorkoutTimer || activeWorkoutTimer.id!==id) return;
  clearInterval(activeWorkoutTimer.interval); const duration=Date.now()-activeWorkoutTimer.started; activeWorkoutTimer=null;
  await req("/workouts/"+id+"/complete",{method:"POST"});
  await shareWorkoutCard(title,duration);
  const finishButton = document.querySelector("#finishWorkout");
  const startButton = document.querySelector("#startWorkout");
  if (finishButton) finishButton.disabled = true;
  if (startButton) startButton.disabled = false;
}
async function shareWorkoutCard(title,duration){
  const canvas=document.createElement('canvas'); canvas.width=1080; canvas.height=1920; const c=canvas.getContext('2d');
  c.fillStyle='#030303'; c.fillRect(0,0,1080,1920);
  try{ const img=new Image(); img.src='/treinamaislogo.png'; await img.decode(); c.drawImage(img,240,180,600,600); }catch(e){}
  c.textAlign='center'; c.fillStyle='#65f6d2'; c.font='bold 54px Arial'; c.fillText('TREINO CONCLUÍDO',540,930);
  c.fillStyle='#fff'; c.font='bold 78px Arial'; wrapCanvasText(c,title.toUpperCase(),540,1050,850,92);
  c.fillStyle='#a9b0ae'; c.font='bold 36px Arial'; c.fillText('DURAÇÃO',540,1320);
  c.fillStyle='#fff'; c.font='bold 110px Arial'; c.fillText(formatDuration(duration),540,1440);
  c.fillStyle='#65f6d2'; c.font='bold 38px Arial'; c.fillText('APP DE TREINOS',540,1680);
  const blob=await new Promise(r=>canvas.toBlob(r,'image/png')); const file=new File([blob],'dante-treino.png',{type:'image/png'});
  if(navigator.share && navigator.canShare?.({files:[file]})){ try{ await navigator.share({title:'Treino concluído',text:`${title} • ${formatDuration(duration)}`,files:[file]}); return; }catch(e){ if(e.name==='AbortError') return; } }
  const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='dante-treino.png'; a.click(); URL.revokeObjectURL(a.href); alert('Card gerado. No celular, compartilhe a imagem no Instagram Stories.');
}
function wrapCanvasText(c,text,x,y,maxWidth,lineHeight){ const words=text.split(' '); let line='',lines=[]; for(const word of words){ const test=line?line+' '+word:word; if(c.measureText(test).width>maxWidth&&line){lines.push(line);line=word}else line=test} lines.push(line); lines.slice(0,3).forEach((l,i)=>c.fillText(l,x,y+i*lineHeight)); }
async function complete(id) {
  await req("/workouts/" + id + "/complete", { method: "POST" });
  alert("Treino concluído!");
}
async function optimizePhoto(file) {
  if (!file.type.startsWith("image/")) throw new Error("Selecione apenas arquivos de imagem.");

  const bitmap = await createImageBitmap(file);
  const maxSide = 1600;
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d").drawImage(bitmap, 0, 0, width, height);
  bitmap.close?.();

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.82));
  if (!blob) throw new Error("Não foi possível preparar a foto para envio.");
  if (blob.size > 3.5 * 1024 * 1024) throw new Error("A foto ainda ficou muito grande após a otimização.");

  const baseName = (file.name || "foto").replace(/\.[^.]+$/, "");
  return new File([blob], `${baseName}.jpg`, { type: "image/jpeg" });
}

async function evolucao() {
  let w = await req("/weights/" + user.id),
    max = Math.max(...w.map((x) => x.value), 1);
  view.innerHTML = `<div class="grid"><section class="card"><div class="section-head"><h2 class="section-heading">Peso semanal</h2></div><form class="app-form" id="peso"><label class="field">Peso (kg)<input class="form-control" id="kg" type="number" step=".1" required></label><button class="ui-button btn">Registrar peso</button></form><div class="chart">${w.map((x) => `<div class="bar" style="height:${Math.max(12, (x.value / max) * 130)}px" title="${x.value} kg"><span class="bar-label">${String(x.measured_on).slice(5)}</span></div>`).join("")}</div></section><section class="card"><h2 class="section-heading">Foto de evolução</h2><p class="text-paragraph muted">Envie sua foto semanal. O arquivo fica vinculado exclusivamente à sua conta.</p><form class="app-form" id="photo"><label class="field">Imagens<input class="form-control" id="img" type="file" accept="image/*" multiple required></label><button class="ui-button btn">Enviar foto</button></form></section></div>`;
  peso.onsubmit = async (e) => {
    e.preventDefault();
    await req("/weights", {
      method: "POST",
      body: JSON.stringify({
        value: +kg.value,
        measured_on: new Date().toISOString().slice(0, 10),
      }),
    });
    render();
  };
  photo.onsubmit = async (e) => {
    e.preventDefault();
    const files = [...img.files];
    if (!files.length) return;

    const button = e.currentTarget.querySelector("button[type=submit], button");
    if (button) button.disabled = true;

    try {
      let sent = 0;
      for (const file of files) {
        const optimized = await optimizePhoto(file);
        const fd = new FormData();
        fd.append("files", optimized, optimized.name);

        const r = await fetch(API + "/photos", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        });

        if (!r.ok) {
          let detail = "Erro no envio da foto";
          try {
            const data = await r.json();
            if (data?.detail) detail = data.detail;
          } catch {}
          if (r.status === 413) detail = "A foto ficou grande demais para o servidor. Tente outra imagem.";
          throw new Error(detail);
        }
        sent++;
      }
      alert(`${sent} foto(s) enviada(s)`);
      render();
    } catch (err) {
      alert(err?.message || "Erro no envio da foto");
    } finally {
      if (button) button.disabled = false;
    }
  };
}
async function openEvaluationPage(){selectedStudentId=null;tab="fotos";await render();}
let evaluationOpenStudent=null;
async function fotosAlunos(){
 const students=await req('/students');
 view.innerHTML=`<section class="evaluation-panel"><h2 class="evaluation-title">Avaliação</h2><p class="evaluation-description">Fotos, histórico de peso e cargas registradas nos treinos.</p><div class="evaluation-students">${students.map(s=>`<div class="evaluation-student" id="evaluation-student-${s.id}"><button class="evaluation-student-toggle" aria-expanded="false" onclick="openStudentPhotos(${s.id})"><span class="evaluation-student-name">${escapeHTML(s.name)}</span><span class="evaluation-student-arrow">⌄</span></button><div class="evaluation-student-detail" id="evaluation-detail-${s.id}" hidden></div></div>`).join('')||'<p class="evaluation-empty">Nenhum aluno cadastrado.</p>'}</div></section>`;
 evaluationOpenStudent=null;
}
async function openStudentPhotos(id){
 if(tab!=='fotos'){tab='fotos';await fotosAlunos();}
 const detail=document.getElementById('evaluation-detail-'+id);
 if(!detail)return;
 if(evaluationOpenStudent===id){detail.hidden=true;detail.innerHTML='';detail.parentElement.querySelector('.evaluation-student-toggle').setAttribute('aria-expanded','false');evaluationOpenStudent=null;return;}
 if(evaluationOpenStudent!==null){const old=document.getElementById('evaluation-detail-'+evaluationOpenStudent);if(old){old.hidden=true;old.innerHTML='';old.parentElement.querySelector('.evaluation-student-toggle').setAttribute('aria-expanded','false');}}
 evaluationOpenStudent=id;detail.hidden=false;detail.innerHTML='<p class="evaluation-loading">Carregando avaliação...</p>';
 detail.parentElement.querySelector('.evaluation-student-toggle').setAttribute('aria-expanded','true');
 try{
  const [photos,weights,workouts]=await Promise.all([req('/photos/'+id),req('/weights/'+id),req('/workouts')]);
  const assigned=workouts.filter(w=>Number(w.student_id)===Number(id));
  const loads=await Promise.all(assigned.map(async w=>({workout:w,sets:await req('/workout-sets/'+w.id)})));
  if(evaluationOpenStudent!==id)return;
  const base=API.replace(/\/api$/,'');
  const photoUrl=path=>path.startsWith('data:')?path:base+path;
  detail.innerHTML=`<div class="evaluation-detail-head"><h3 class="evaluation-detail-title">Histórico de avaliação</h3><button class="evaluation-close" onclick="openStudentPhotos(${id})" aria-label="Fechar avaliação">✕</button></div><h4 class="evaluation-subtitle">Fotos</h4><div class="evaluation-photo-grid">${photos.map(p=>`<a class="evaluation-photo-link" href="${photoUrl(p.path)}" target="_blank" rel="noopener"><img class="evaluation-photo" src="${photoUrl(p.path)}" alt="Foto de evolução"><span class="evaluation-photo-date">${new Date(p.created_at).toLocaleDateString('pt-BR')}</span></a>`).join('')||'<p class="evaluation-empty">Nenhuma foto registrada.</p>'}</div><h4 class="evaluation-subtitle">Pesos registrados</h4><div class="evaluation-weight-list">${weights.map(w=>`<div class="evaluation-weight-row"><span>${escapeHTML(String(w.measured_on))}</span><strong>${Number(w.value).toLocaleString('pt-BR')} kg</strong></div>`).join('')||'<p class="evaluation-empty">Nenhum peso registrado.</p>'}</div><h4 class="evaluation-subtitle">Cargas por treino</h4><div class="evaluation-workout-list">${loads.map(({workout,sets})=>`<section class="evaluation-workout"><h5 class="evaluation-workout-name">${escapeHTML(workout.title)}</h5>${sets.map(x=>`<div class="evaluation-load-row"><span>${escapeHTML(x.exercise_name||'Exercício')} · série ${Number(x.set_number)}<small class="evaluation-load-date">${new Date(x.performed_at).toLocaleString('pt-BR')}</small></span><strong>${Number(x.load_kg).toLocaleString('pt-BR')} kg</strong></div>`).join('')||'<p class="evaluation-empty">Nenhuma carga registrada.</p>'}</section>`).join('')||'<p class="evaluation-empty">Nenhum treino atribuído.</p>'}</div>`;
 }catch(err){detail.innerHTML=`<p class="evaluation-error">Não foi possível carregar a avaliação: ${escapeHTML(err.message)}</p>`;}
}
function contato(){
  const ig=CONTACT.instagram, wa=CONTACT.whatsapp;
  view.innerHTML=`<section class="contact-card">${logo()}<h2 class="section-heading">App de Treinos</h2><p class="text-paragraph muted">Fale com o time pelos canais oficiais.</p><div class="contact-actions">${ig?`<a class="app-link contact-link" href="${ig}" target="_blank" rel="noopener"><b class="contact-name">INSTAGRAM</b><span class="contact-description">Abrir perfil →</span></a>`:`<div class="contact-link disabled"><b class="contact-name">INSTAGRAM</b><span class="contact-description">Link ainda não configurado</span></div>`}${wa?`<a class="app-link contact-link" href="${wa}" target="_blank" rel="noopener"><b class="contact-name">WHATSAPP</b><span class="contact-description">Iniciar conversa →</span></a>`:`<div class="contact-link disabled"><b class="contact-name">WHATSAPP</b><span class="contact-description">Link ainda não configurado</span></div>`}</div></section>`;
}
const expandedPaymentStudents = new Set();

async function pagamentos() {
  const rows = await req("/payments");
  const alerts = rows.flatMap(x => x.payments.filter(p => p.alert).map(p => ({name:x.student_name, due:p.due_date})));
  view.innerHTML = `<div class="payment-page">${rows.map(x=>`<details class="card payment-student" data-payment-student="${x.student_id}" ${expandedPaymentStudents.has(String(x.student_id)) ? "open" : ""}><summary class="payment-student-toggle"><span>${escapeHTML(x.student_name)}</span><span class="payment-chevron" aria-hidden="true"></span></summary><div class="payment-student-content"><form class="app-form payment-plan" data-student="${x.student_id}"><label class="field">Primeiro vencimento<input class="form-control" type="date" name="start_date" value="${x.start_date || ''}" required></label><label class="field">Periodicidade<select class="form-select" name="cycle">${[['mensal','Mensal'],['trimestral','Trimestral'],['semestral','Semestral'],['anual','Anual']].map(([key,label])=>`<option value="${key}" ${x.cycle===key?'selected':''}>${label}</option>`).join('')}</select></label><label class="field">Valor (R$) — opcional<input class="form-control" type="number" min="0" step="0.01" name="amount" value="${x.amount ?? ''}"></label><button class="ui-button btn">Salvar vencimentos</button></form><div class="payment-items">${x.payments.length ? x.payments.filter(p=>p.due_date <= new Date(new Date().setFullYear(new Date().getFullYear()+1)).toISOString().slice(0,10)).map(p=>`<div class="row"><div><b>${new Date(p.due_date+'T12:00:00').toLocaleDateString('pt-BR')}</b><div class="muted">${p.paid?'Pago':p.overdue?'Atrasado':'Pendente'}</div></div><label class="payment-check"><input type="checkbox" data-payment="${p.id}" ${p.paid?'checked':''}> Pago</label></div>`).join('') : '<p class="muted">Configure o primeiro vencimento para gerar as cobranças.</p>'}</div></div></details>`).join('') || '<section class="card">Cadastre um aluno primeiro para configurar os pagamentos.</section>'}</div>`;
  document.querySelectorAll('[data-payment-student]').forEach(card => card.addEventListener('toggle', () => {
    const id = card.dataset.paymentStudent;
    if (card.open) expandedPaymentStudents.add(id);
    else expandedPaymentStudents.delete(id);
  }));
  document.querySelectorAll('.payment-plan').forEach(form=>form.addEventListener('submit',async e=>{
    e.preventDefault(); const data = new FormData(form);
    try { await req('/payments/plan',{method:'PUT',body:JSON.stringify({student_id:Number(form.dataset.student),start_date:data.get('start_date'),cycle:data.get('cycle'),amount:data.get('amount')===''?null:Number(data.get('amount'))})}); await pagamentos(); }
    catch(err){ alert(err.message); }
  }));
  document.querySelectorAll('[data-payment]').forEach(input=>input.addEventListener('change',async()=>{
    try {await req('/payments/'+input.dataset.payment,{method:'PATCH',body:JSON.stringify({paid:input.checked})});await pagamentos();}
    catch(err){alert(err.message); input.checked=!input.checked;}
  }));
}


function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  token = null;
  user = null;
  login();
}

// Funções usadas pelos atributos onclick do HTML gerado dinamicamente.
// Como app.js é carregado como ES module no Vite, elas precisam ser
// expostas explicitamente no objeto window.
Object.assign(window, {
  login,
  forgotPassword,
  register,
  setTab,
  toggleMenu,
  delLesson,
  changeLesson,shiftCalendar,addExercise,removeExercise,
  workout,
  treino,
  treinoDetalhe,
  studentCalendar,studentPayment,studentProfile,meuPerfil,studentLessonAction,studentLessonDelete,shiftStudentCalendar,leaveWorkoutPlayer,alunos,
  startWorkoutTimer,
  finishWorkoutTimer,
  openStudentPhotos,
  logout,
});

render();
