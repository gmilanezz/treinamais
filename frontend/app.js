const API = "/api";
let token = localStorage.token,
  user = JSON.parse(localStorage.user || "null"),
  tab = user?.role === "student" ? "perfil" : "agenda";
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
  if (!r.ok) {
    const detail = d.detail;
    throw new Error(
      typeof detail === "string"
        ? detail
        : Array.isArray(detail)
          ? detail.map((x) => x.msg || JSON.stringify(x)).join("; ")
          : detail && typeof detail === "object"
            ? detail.message || JSON.stringify(detail)
            : "Erro na solicitação",
    );
  }
  return d;
}
const defaultLogoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1240 1240" role="img" aria-label="TREINA+" class="app-image brand-logo"><path fill="var(--team-color)" fill-rule="evenodd" d="M1070,238 1070,248 1071,249 1070,275 1093,275 1096,274 1099,268 1099,244 1097,239 1095,238Z M164,238 160,243 160,269 161,272 166,275 189,275 190,274 189,268 190,238Z M351,238 348,242 348,251 351,255 390,255 391,256 392,269 396,276 403,282 408,300 412,324 414,354 420,378 430,395 454,421 457,427 461,453 466,471 474,488 480,497 495,513 520,532 533,562 542,576 553,587 565,595 574,599 583,596 585,590 601,614 613,626 628,637 636,645 640,651 640,655 634,676 634,680 627,681 620,692 616,693 606,699 594,711 584,728 580,742 579,755 557,772 520,810 519,813 524,819 504,846 491,858 479,866 466,871 448,875 431,881 419,887 408,895 396,907 371,943 346,969 323,988 323,990 312,1003 312,1006 310,1008 308,998 309,993 302,992 299,993 294,998 280,1020 271,1027 268,1031 267,1041 270,1046 282,1057 298,1068 307,1077 314,1091 323,1102 330,1106 342,1108 383,1108 384,1107 401,1106 404,1102 403,1089 399,1085 387,1081 376,1075 374,1073 374,1069 370,1065 370,1061 367,1056 367,1052 364,1044 366,1037 363,1033 363,1031 367,1025 368,1018 366,1014 363,1013 362,1011 367,1005 381,992 394,983 435,963 453,952 486,923 499,917 518,914 529,910 539,904 543,899 549,898 558,893 566,887 585,867 579,859 580,858 618,875 683,805 704,794 716,786 731,773 732,774 725,784 707,802 693,812 750,849 752,849 754,847 758,836 767,823 768,825 764,832 783,836 850,835 856,837 844,842 828,867 818,891 815,906 815,923 822,953 822,965 819,981 810,1011 801,1032 804,1038 803,1039 797,1033 792,1033 788,1037 787,1049 781,1065 781,1074 775,1080 771,1089 772,1097 780,1103 792,1105 865,1105 866,1106 890,1107 891,1108 938,1107 950,1104 959,1099 962,1095 963,1087 961,1082 957,1078 950,1075 942,1074 916,1065 912,1060 905,1058 899,1052 891,1048 888,1043 884,1042 882,1040 884,1039 884,1036 881,1033 877,1033 875,1031 873,1023 869,1016 865,1014 859,1015 857,1014 861,996 869,974 898,912 906,890 910,870 911,858 915,850 925,819 926,809 922,797 914,788 900,777 884,767 864,757 862,755 864,752 861,749 831,733 816,727 792,720 770,716 763,716 758,709 751,709 746,716 744,715 745,714 744,702 750,689 754,673 753,656 760,641 762,631 764,628 767,617 767,603 764,588 767,583 770,573 770,557 765,539 759,528 761,516 773,507 783,497 793,483 802,463 808,427 820,406 826,400 833,390 841,374 845,357 847,321 854,281 861,275 864,270 866,263 865,257 867,255 908,255 910,252 909,239 908,238 866,238 864,231 861,227 857,226 853,228 848,223 842,223 839,225 834,220 828,220 826,222 823,222 820,220 813,221 807,226 805,236 803,238 453,238 451,236 449,227 441,220 435,220 431,223 428,223 426,221 422,221 416,226 412,224 407,225 403,229 396,229 392,233 392,236 390,238Z M868,1041 873,1037 880,1037 883,1039 882,1040 875,1040 871,1042Z M652,691 654,690 667,696 699,707 721,711 720,712 701,712 691,710 674,703Z M434,274 449,260 452,255 803,255 823,275 823,281 818,300 809,319 789,344 778,364 774,380 774,393 776,393 778,396 761,404 747,417 735,437 731,448 728,463 710,471 698,482 691,496 691,499 696,500 688,504 687,503 689,501 677,490 671,480 670,475 663,471 663,468 667,463 684,455 688,449 688,446 682,439 682,433 679,429 679,426 674,421 677,415 676,412 664,406 661,403 660,395 650,386 645,383 635,381 640,378 645,379 646,377 646,370 642,362 638,366 637,362 633,356 630,361 621,368 603,374 592,380 581,390 574,399 571,408 567,414 565,425 567,426 568,434 574,447 587,461 601,470 608,473 610,481 610,488 617,492 611,493 601,491 591,491 583,481 571,471 557,464 543,461 541,459 537,447 528,429 519,416 506,403 485,389 484,375 480,360 470,342 447,313 439,297 435,285Z M1036,193 1035,196 1036,197 1037,222 1038,223 1038,288 1037,289 1037,304 1036,305 1035,319 1037,321 1051,321 1056,320 1059,316 1060,301 1061,300 1062,228 1061,227 1059,197 1056,193Z M204,193 200,200 199,223 198,224 198,292 199,293 200,313 201,317 206,321 219,321 224,320 223,296 222,295 222,274 221,273 221,239 222,238 222,216 223,215 224,193Z M995,166 992,170 993,171 995,209 996,210 996,299 995,300 995,317 994,318 992,344 994,346 1022,346 1024,345 1026,341 1028,313 1029,312 1029,287 1030,286 1030,227 1029,226 1029,204 1028,203 1026,171 1021,166Z M239,166 234,170 233,173 231,214 230,215 230,298 231,299 233,338 235,344 238,346 265,346 267,344 267,338 266,337 264,290 263,289 263,219 264,218 264,199 265,198 265,184 266,183 267,169 264,166Z M916,144 912,146 909,153 905,181 905,190 904,191 904,204 903,205 903,227 907,227 910,183 913,169 915,171 918,203 919,204 920,285 919,286 917,326 915,338 913,340 911,334 910,316 909,315 907,269 903,269 904,318 905,319 909,358 911,363 918,367 973,367 979,364 982,356 984,327 985,326 985,308 986,307 987,228 986,227 985,184 984,183 984,173 983,172 981,149 976,144Z M284,144 278,150 276,174 275,175 275,188 274,189 274,207 273,208 273,302 274,303 275,335 276,336 278,360 283,366 286,367 341,367 347,364 350,357 353,327 354,326 355,297 356,296 356,269 351,269 350,310 349,311 347,338 345,340 343,335 341,313 340,312 339,258 338,257 339,242 338,240 339,239 340,197 341,196 343,174 345,169 347,172 348,186 349,187 351,226 356,227 355,193 354,192 353,174 349,150 343,144Z"/></svg>`;
const logo = () => defaultLogoSvg;
function defaultLogoIcon(color) {
  return (
    "data:image/svg+xml," +
    encodeURIComponent(
      defaultLogoSvg
        .replace(/var\(--team-color\)/g, color)
        .replace(/class="app-image brand-logo"/g, ""),
    )
  );
}
let brand = { color: "#65f6d2", logo: null, professor: "", phone: "" };
async function loadBrand() {
  try {
    brand = await req("/branding");
    document.documentElement.style.setProperty("--team-color", brand.color);
    document.documentElement.style.setProperty("--accent", brand.color);
    const m = document.querySelector("link[rel=manifest]");
    if (m)
      m.href =
        "data:application/manifest+json," +
        encodeURIComponent(
          JSON.stringify({
            name: "TREINA+ · Time " + brand.professor,
            short_name: "TREINA+",
            start_url: "/",
            display: "standalone",
            background_color: "#050707",
            theme_color: brand.color,
            icons: [
              {
                src: defaultLogoIcon(brand.color),
                sizes: "any",
                type: "image/png",
                purpose: "any",
              },
            ],
          }),
        );
    {
      const icon =
        document.querySelector("link[rel=icon]") ||
        document.head.appendChild(document.createElement("link"));
      icon.rel = "icon";
      icon.href = defaultLogoIcon(brand.color);
    }
  } catch (e) {}
}
const CONTACT = {
  instagram: localStorage.DANTE_INSTAGRAM || "",
  whatsapp: localStorage.DANTE_WHATSAPP || "",
};
let activeWorkoutTimer = null;
function login() {
  app.innerHTML = `<main class="auth"><section class="auth-card">${logo()}<div><h1 class="page-heading accent">App de Treinos</h1><p class="text-paragraph muted">Agenda, treinos e evolução do time.</p></div><form class="app-form" id="f"><label class="field">Usuário<input class="form-control" id="u" autocomplete="username" required></label><label class="field">Senha<input class="form-control" id="p" type="password" autocomplete="current-password" required></label><button class="ui-button btn wide">Entrar</button><button type="button" class="ui-button forgot-link" onclick="forgotPassword()">Esqueci minha senha</button><p id="err" class="text-paragraph error"></p></form><div class="auth-divider"><span>Primeiro acesso?</span></div><div class="auth-actions"><button class="btn-action ui-button btn ghost" onclick="register('professor')">Criar conta de professor</button><button class="btn-action ui-button btn ghost" onclick="register('student')">Criar conta de aluno</button></div></section></main>`;
  f.onsubmit = async (e) => {
    e.preventDefault();
    let body = new URLSearchParams({
      username: u.value.trim().toLowerCase(),
      password: p.value,
    });
    let r = await fetch(API + "/login", { method: "POST", body });
    if (!r.ok) {
      err.textContent = "Usuário ou senha inválidos";
      return;
    }
    saveSession(await r.json());
  };
}
function forgotPassword() {
  app.innerHTML = `<main class="auth"><section class="auth-card">${logo()}<button class="ui-button text-btn" onclick="login()">Voltar ao login</button><div><h1 class="page-heading">Redefinir senha</h1><p class="text-paragraph muted">Informe seu usuário, o código de acesso e escolha uma nova senha.</p></div><form class="app-form" id="resetf"><label class="field">Usuário<input class="form-control" id="resetUser" autocomplete="username" required></label><label class="field">Código de acesso<input id="resetCode" maxlength="5" minlength="5" pattern="[A-Za-z0-9]{5}" class="form-control code-input" placeholder="A1B2C" required></label><label class="field">Nova senha<input class="form-control" id="resetPass" type="password" minlength="5" autocomplete="new-password" required></label><label class="field">Confirmar nova senha<input class="form-control" id="resetConfirm" type="password" minlength="5" autocomplete="new-password" required></label><button class="btn-action ui-button btn wide">Redefinir senha</button><p id="resetErr" class="text-paragraph error"></p><p id="resetOk" class="text-paragraph success"></p></form></section></main>`;
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
          username: resetUser.value.trim().toLowerCase(),
          invite_code: resetCode.value,
          new_password: resetPass.value,
        }),
      });
      let d = await r.json().catch(() => ({}));
      if (!r.ok)
        throw new Error(d.detail || "Não foi possível redefinir a senha");
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
  app.innerHTML = `<main class="auth"><section class="auth-card">${logo()}<button class="ui-button text-btn" onclick="login()">Voltar ao login</button><div><h1 class="page-heading">${role === "professor" ? "Professor" : "Aluno"}</h1><p class="text-paragraph muted">Use o código de 5 caracteres fornecido pelo professor.</p></div><form class="app-form" id="rf"><label class="field">Nome completo<input class="form-control" id="rn" required></label><label class="field">Usuário<input class="form-control" id="ru" required></label>${role === "student" ? `<label class="field">Professor<select class="form-select" id="rp" required><option value="">Selecione</option>${professors.map((x) => `<option value="${x.id}">${x.name}</option>`).join("")}</select></label>` : ""}<label class="field phone-required-label">WhatsApp com DDD (11 dígitos, sem espaços)<input class="form-control" id="rphone" type="tel" inputmode="numeric" maxlength="12" pattern="[0-9]{11}" placeholder="11999999999" required></label><label class="field">Senha<input class="form-control" id="rpass" type="password" minlength="5" required></label><label class="field">Código de acesso<input id="rcode" maxlength="5" minlength="5" pattern="[A-Za-z0-9]{5}" class="form-control code-input" placeholder="A1B2C" required></label><button class="btn-action ui-button btn wide">Criar conta</button><p id="rerr" class="text-paragraph error"></p></form></section></main>`;
  rf.onsubmit = async (e) => {
    e.preventDefault();
    try {
      let d = await fetch(API + "/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: rn.value,
          username: ru.value.trim().toLowerCase(),
          phone: rphone.value,
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
  tab = user.role === "student" ? "perfil" : "agenda";
  if (user.role === "student") {
    req("/me")
      .then((details) => {
        if (details.contact_pending) {
          tab = "perfil";
          render();
        }
      })
      .catch(() => {});
  }
  loadBrand().then(() => {
    if (
      user.role === "professor" &&
      !localStorage.getItem("brandSetup_" + user.id)
    )
      welcomeProfessor();
    else render();
  });
}
function menuItems() {
  return user.role === "student"
    ? [
        ["treino", workoutMenuIcon, "Meu treino"],
        ["aulas", "▦", "Minhas aulas"],
        ["evolucao", "↗", "Evolução"],
        ["perfil", "👤", "Meu perfil"],
        ["contato", "@", "Contato"],
      ]
    : [
        ["agenda", "▦", "Minha agenda"],
        ["alunos", "◎", "Alunos"],
        ["treinos", workoutMenuIcon, "Treinos"],
        ["pagamentos", "$", "Pagamentos"],
        ["fotos", "↗", "Avaliação"],
        ["marca", "✦", "Minha identidade"],
        ["contato", "@", "Contato"],
      ];
}
function nav() {
  return `<header class="topbar"><div class="brand-inline nav-logo-only">${logo()}</div><button class="ui-button menu-button" onclick="toggleMenu(true)" aria-label="Abrir menu"><span class="hamburger-icon" aria-hidden="true"><span class="hamburger-line hamburger-line-top"></span><span class="hamburger-line hamburger-line-middle"></span><span class="hamburger-line hamburger-line-bottom"></span></span></button><div class="user-chip"><div class="user-chip-details"><b class="user-name">${user.name}</b><span class="user-role">${user.role}</span></div></div></header><div class="menu-overlay" onclick="toggleMenu(false)"></div><aside class="sidebar"><div class="sidebar-head">${logo()}<button class="ui-button menu-close" onclick="toggleMenu(false)">×</button></div><div class="profile"><b class="profile-name">${user.name}</b><span class="profile-role">${user.role === "student" ? "Aluno" : "Equipe"}</span></div><nav class="side-nav">${menuItems()
    .map(
      (x) =>
        `<button class="ui-button side-link ${tab === x[0] ? "active" : ""}" onclick="setTab('${x[0]}')"><i class="side-icon">${x[1]}</i><span class="side-label">${x[2]}</span></button>`,
    )
    .join(
      "",
    )}</nav><button class="ui-button side-link logout" onclick="logout()"><i class="side-icon">↪</i><span class="side-label">Sair</span></button></aside>`;
}
let previousTab = null;
function goBack() {
  const target = previousTab || "agenda";
  previousTab = null;
  tab = target;
  render();
}
function setTab(nextTab) {
  if (tab !== nextTab) previousTab = tab;
  tab = nextTab;
  toggleMenu(false);
  render();
}

function toggleMenu(open) {
  document.body.classList.toggle("menu-open", open);
}
async function render() {
  if (!token) return login();
  app.innerHTML = `${nav()}<main class="shell"><div class="page-title">${previousTab && previousTab !== tab ? `<button class="ui-button btn back-navigation" onclick="goBack()">← Voltar</button>` : ""}<h1 class="page-heading">${menuItems().find((x) => x[0] === tab)?.[2] || "Painel"}</h1></div><div id="view"></div></main>`;

  try {
    if (tab === "contato") return contato();
    if (user.role === "student")
      return tab === "perfil"
        ? meuPerfil()
        : tab === "evolucao"
          ? evolucao()
          : tab === "aulas"
            ? agendaAluno()
            : treino();
    if (tab === "alunos") return alunos();
    if (tab === "treinos") return treinosProfessor();
    if (tab === "marca") return marcaProfessor();
    if (tab === "fotos") return fotosAlunos();
    if (tab === "pagamentos") return pagamentos();
    return agenda(tab === "time");
  } catch (e) {
    view.innerHTML = `<div class="card error">${e.message}</div>`;
  }
}
const escapeHTML = (v) =>
  String(v ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
let calendarMonth = new Date().toISOString().slice(0, 7);
function lessonCalendar(rows) {
  const [y, m] = calendarMonth.split("-").map(Number),
    first = new Date(y, m - 1, 1),
    offset = (first.getDay() + 6) % 7,
    last = new Date(y, m, 0).getDate();
  return `<div class="calendar-head"><button class="calendar-arrow" aria-label="Mês anterior" onclick="shiftStudentCalendar(-1)">←</button><b>${first.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}</b><button class="calendar-arrow" aria-label="Próximo mês" onclick="shiftStudentCalendar(1)">→</button></div><div class="lesson-calendar">${["S", "T", "Q", "Q", "S", "S", "D"].map((d) => `<b class="lesson-calendar-weekday">${d}</b>`).join("")}${Array(offset).fill("<span></span>").join("")}${Array.from(
    { length: last },
    (_, i) => {
      let day = `${calendarMonth}-${String(i + 1).padStart(2, "0")}`,
        events = rows.filter((x) => x.scheduled_date === day);
      return `<div class="calendar-day"><b class="calendar-day-number">${i + 1}</b>${events.map((x) => `<span class="lesson-dot ${x.status || "pending"}" title="${escapeHTML(x.student)} ${escapeHTML(x.time)}"></span>`).join("")}</div>`;
    },
  ).join(
    "",
  )}</div><div class="calendar-legend" aria-label="Legenda do calendário"><span><i class="lesson-dot completed"></i> Concluído</span><span><i class="lesson-dot pending"></i> Pendente</span><span><i class="lesson-dot cancelled"></i> Cancelado</span></div>`;
}
function shiftCalendar(delta) {
  const [y, m] = calendarMonth.split("-").map(Number);
  calendarMonth = new Date(y, m - 1 + delta, 1).toISOString().slice(0, 7);
  render();
}
function shiftStudentCalendar(delta) {
  const [y, m] = calendarMonth.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  calendarMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  if (tab === "alunos" && selectedStudentId) studentCalendar(selectedStudentId);
  else agendaAluno();
}
async function agendaAluno() {
  const rows = await req("/lessons");
  view.innerHTML = `<section class="card"><h2>Calendário de aulas</h2>${lessonCalendar(rows)}<div class="list">${rows.map((x) => `<div class="row"><b>${escapeHTML(x.scheduled_date || "Sem data")} · ${escapeHTML(x.time)}</b><span class="lesson-status ${x.status}">${x.status === "completed" ? "Concluída" : x.status === "cancelled" ? "Cancelada" : "Pendente"}</span></div>`).join("")}</div></section>`;
}
async function agenda() {
  const [rows, students] = await Promise.all([
    req("/lessons"),
    req("/students"),
  ]);
  const today = new Date();
  const localDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const daily = rows
    .filter((x) => x.scheduled_date === localDate)
    .sort((a, b) => String(a.time).localeCompare(String(b.time)));
  view.innerHTML = `<div class="agenda-layout"><section class="agenda-schedule-card"><h2 class="agenda-title">Cadastrar aula</h2><form class="agenda-form" id="lf"><label class="agenda-field">Aluno<select class="agenda-select" name="student_id" required>${students.map((x) => `<option value="${x.id}">${escapeHTML(x.name)}</option>`).join("")}</select></label><label class="agenda-field">Data<input class="agenda-input" type="date" name="scheduled_date" value="${localDate}" required></label><label class="agenda-field">Horário<input class="agenda-input" type="time" name="time" required></label><button class="agenda-submit agenda-action" type="submit">Agendar aula</button></form></section><section class="agenda-daily-card"><h2 class="agenda-title">Aulas do dia</h2><p class="agenda-date">${today.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}</p><div class="agenda-daily-list">${daily.map((x) => `<article class="agenda-lesson"><div class="agenda-lesson-info"><strong class="agenda-student-name">${escapeHTML(x.student)}</strong><span class="agenda-lesson-time">${escapeHTML(x.time)}</span><span class="agenda-lesson-status agenda-status-${x.status || "pending"}">${x.status === "completed" ? "Concluída" : x.status === "cancelled" ? "Cancelada" : "Pendente"}</span></div><div class="agenda-actions"><button class="agenda-complete agenda-action" onclick="changeLesson(${x.id},'completed')" aria-label="Concluir aula" title="Concluir aula" ${x.status === "completed" ? "disabled" : ""}>✓</button><button class="btn-action agenda-delete agenda-action" onclick="delLesson(${x.id})" aria-label="Excluir aula" title="Excluir aula">Excluir</button></div></article>`).join("") || '<p class="agenda-empty">Nenhuma aula agendada para hoje.</p>'}</div></section></div>`;
  lf.onsubmit = async (e) => {
    e.preventDefault();
    try {
      await req("/lessons", {
        method: "POST",
        body: JSON.stringify(Object.fromEntries(new FormData(lf))),
      });
      render();
    } catch (err) {
      alert(err.message);
    }
  };
}
async function changeLesson(id, status) {
  await req(`/lessons/${id}/status?status=${status}`, { method: "PATCH" });
  render();
}
async function delLesson(id) {
  if (confirm("Excluir esta aula?")) {
    await req("/lessons/" + id, { method: "DELETE" });
    render();
  }
}

let selectedStudentId = null;
async function studentCalendar(id) {
  const panel = document.getElementById("student-inline-calendar-" + id);
  if (!panel) return;
  if (!panel.hidden) {
    panel.hidden = true;
    panel.innerHTML = "";
    selectedStudentId = null;
    return;
  }
  document.querySelectorAll(".student-inline-calendar").forEach((el) => {
    el.hidden = true;
    el.innerHTML = "";
  });
  selectedStudentId = id;
  try {
    const all = await req("/lessons");
    if (selectedStudentId !== id) return;
    const rows = all.filter((x) => Number(x.student_id) === Number(id));
    panel.hidden = false;
    panel.innerHTML = `<div class="student-calendar-inline-header"><h3 class="student-calendar-inline-title">Calendário de aulas</h3><button class="student-calendar-inline-close" type="button" aria-label="Fechar calendário" onclick="studentCalendar(${id})">✕</button></div><form class="student-schedule-form" id="studentSchedule-${id}"><label class="student-schedule-label">Data<input class="student-schedule-date" type="date" name="scheduled_date" required></label><label class="student-schedule-label">Horário<input class="student-schedule-time" type="time" name="time" required></label><button class="student-schedule-submit student-calendar-action">Agendar aula</button></form>${lessonCalendar(rows)}`;
    panel.querySelector("form").onsubmit = async (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(e.target));
      data.student_id = id;
      try {
        await req("/lessons", { method: "POST", body: JSON.stringify(data) });
        panel.hidden = true;
        await studentCalendar(id);
      } catch (err) {
        alert(err.message);
      }
    };
  } catch (err) {
    panel.hidden = false;
    panel.innerHTML = `<p class="student-calendar-error">${escapeHTML(err.message)}</p>`;
  }
}
async function studentLessonAction(sid, id, status) {
  await changeLesson(id, status);
  await studentCalendar(sid);
}
async function studentLessonDelete(sid, id) {
  await delLesson(id);
  await studentCalendar(sid);
}
async function studentPayment(id) {
  expandedPaymentStudents.add(String(id));
  tab = "pagamentos";
  await render();
  const el = document.querySelector(`[data-payment-student="${id}"]`);
  if (el) {
    el.open = true;
    el.scrollIntoView({ block: "start", behavior: "smooth" });
  }
}
async function studentProfile(id) {
  const ss = await req("/students");
  const s = ss.find((x) => Number(x.id) === Number(id));
  if (!s) return;
  view.innerHTML = `<section class="student-profile-card"><button class="student-profile-back" onclick="alunos()">← Alunos</button><h2 class="student-profile-title">Perfil de ${escapeHTML(s.name)}</h2><p class="student-profile-detail">Usuário: @${escapeHTML(s.username)}</p><p class="student-profile-detail">E-mail: ${escapeHTML(s.email || "Aguardando cadastro do aluno")}</p><p class="student-profile-detail">Telefone: ${escapeHTML(s.phone || "Aguardando cadastro do aluno")}</p></section>`;
}
async function meuPerfil() {
  const [s, stats, weights, photos] = await Promise.all([
    req("/me"),
    req("/me/dashboard").catch(() => ({
      week: 0,
      month: 0,
      year: 0,
      loads: [],
    })),
    req("/weights/" + user.id).catch(() => []),
    req("/photos/" + user.id).catch(() => []),
  ]);
  const professor = await req("/branding").catch(() => ({}));
  const loads = stats.loads || [];
  const lastWeight = [...weights].sort((a, b) =>
    String(b.measured_on).localeCompare(String(a.measured_on)),
  )[0];
  const lastPhoto = [...photos].sort((a, b) =>
    String(b.created_at || "").localeCompare(String(a.created_at || "")),
  )[0];
  const photoUrl = lastPhoto?.path
    ? lastPhoto.path.startsWith("data:")
      ? lastPhoto.path
      : API.replace(/\/api$/, "") + lastPhoto.path
    : "";
  view.innerHTML = `<section class="student-profile-card"><h2 class="student-profile-title student-profile-welcome">Bem-vindo, ${escapeHTML(s.name)}!</h2><p class="student-profile-detail">Professor: <strong>${escapeHTML(professor.professor || "Não associado")}</strong></p><h2 class="section-heading">Frequência na academia</h2><div class="profile-stats"><div><strong>${stats.week || 0}</strong><span>Semana</span></div><div><strong>${stats.month || 0}</strong><span>Mês</span></div><div><strong>${stats.year || 0}</strong><span>Ano</span></div></div><div class="profile-latest"><div><h3>Última foto de atualização</h3>${photoUrl ? `<img src="${escapeHTML(photoUrl)}" alt="Última foto de evolução" class="profile-latest-photo">` : '<p class="muted">Nenhuma foto enviada.</p>'}</div><div><h3>Último peso registrado</h3><strong>${lastWeight ? escapeHTML(String(lastWeight.value)) + " kg" : "Não registrado"}</strong></div></div><h2 class="section-heading">Evolução das cargas registradas</h2><label class="field profile-load-search-label">Buscar exercício<input id="profileLoadSearch" class="form-control" list="profileLoadOptions" placeholder="Digite o nome do exercício" autocomplete="off"></label><datalist id="profileLoadOptions">${[...new Set(loads.map((x) => x.exercise_name).filter(Boolean))].map((n) => `<option value="${escapeHTML(n)}"></option>`).join("")}</datalist><div id="profileLoadChart" class="profile-load-chart"></div></section>`;
  const search = document.getElementById("profileLoadSearch");
  search.addEventListener("input", () =>
    drawProfileLoadChart(loads, search.value),
  );
  drawProfileLoadChart(loads, "");
}
function formatTreinaDate(value) {
  if (!value) return "Sem data";
  const text = String(value).slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(text))
    return text.split("-").reverse().join("/");
  const d = new Date(value);
  return !Number.isNaN(d.getTime())
    ? d.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : text;
}
function drawProfileLoadChart(loads, term) {
  const holder = document.getElementById("profileLoadChart");
  if (!holder) return;
  const q = String(term || "")
    .trim()
    .toLocaleLowerCase("pt-BR");
  const rows = loads
    .filter(
      (x) =>
        !q ||
        String(x.exercise_name || "")
          .toLocaleLowerCase("pt-BR")
          .includes(q),
    )
    .sort((a, b) => new Date(a.performed_at) - new Date(b.performed_at))
    .slice(-15);
  const max = Math.max(1, ...rows.map((x) => Number(x.load_kg) || 0));
  holder.innerHTML =
    rows
      .map(
        (x) =>
          `<div class="profile-load-column" title="${escapeHTML(x.exercise_name || "Exercício")}: ${Number(x.load_kg)} kg"><span>${Number(x.load_kg)}kg</span><div style="height:${Math.max(6, (Number(x.load_kg) / max) * 135)}px"></div><small>${escapeHTML(formatTreinaDate(x.performed_at))}</small></div>`,
      )
      .join("") ||
    '<p class="muted">Nenhuma carga registrada para este exercício.</p>';
}
async function contatosAluno() {
  const [s, professor] = await Promise.all([
    req("/me"),
    req("/branding").catch(() => ({})),
  ]);
  const phone = String(professor.phone || "").replace(/\D/g, "");
  const url = phone
    ? `https://wa.me/${phone.startsWith("55") ? phone : "55" + phone}`
    : "";
  view.innerHTML = `<section class="student-profile-card"><h2 class="student-profile-title">Meus contatos</h2>${s.contact_pending ? '<p class="student-profile-notice" role="status">Cadastre seu telefone e e-mail para completar seu perfil.</p>' : ""}<form id="contactForm" class="student-contact-form"><label class="student-contact-label">E-mail<input class="student-contact-input" type="email" name="email" value="${escapeHTML(s.email || "")}" required></label><label class="student-contact-label">Telefone / WhatsApp<input class="student-contact-input" type="tel" name="phone" value="${escapeHTML(s.phone || "")}" required></label><button class="btn-action student-contact-save">Salvar contatos</button></form><div class="student-professor-contact"><h3>Professor</h3><p class="student-profile-detail"><strong>${escapeHTML(professor.professor || "Não associado")}</strong></p>${url ? `<a class="profile-whatsapp" href="${url}" target="_blank" rel="noopener noreferrer">${escapeHTML(phone)} · WhatsApp do professor</a>` : '<p class="muted">WhatsApp do professor não cadastrado.</p>'}</div></section>`;
  document.querySelector("#contactForm").onsubmit = async (e) => {
    e.preventDefault();
    try {
      await req("/me/contact", {
        method: "PUT",
        body: JSON.stringify(Object.fromEntries(new FormData(e.target))),
      });
      alert("Contatos salvos!");
      contatosAluno();
    } catch (err) {
      alert(err.message);
    }
  };
}

function toggleStudentCreate() {
  const body = document.getElementById("student-create-body");
  const btn = document.querySelector(".student-create-toggle");
  if (!body || !btn) return;
  body.hidden = !body.hidden;
  btn.setAttribute("aria-expanded", String(!body.hidden));
}
async function alunos() {
  const ss = await req("/students");
  view.innerHTML = `<div class="grid"><section class="card student-create-surface"><button class="student-create-toggle" type="button" aria-expanded="false" aria-controls="student-create-body" onclick="toggleStudentCreate()">+ Adicionar aluno <span class="student-create-arrow">⌄</span></button><div class="student-create-body" id="student-create-body" hidden><p class="text-paragraph muted">Após cadastrar, peça ao aluno que acesse sua conta para informar telefone e e-mail.</p><form class="app-form" id="sf"><label class="field">Nome<input class="form-control" id="sn" required></label><label class="field">Usuário<input class="form-control" id="su" required></label><label class="field phone-required-label">WhatsApp com DDD (11 dígitos, sem espaços)<input class="form-control" id="sphone" type="tel" inputmode="numeric" maxlength="12" pattern="[0-9]{11}" placeholder="11999999999" required></label><label class="field">Senha inicial<input class="form-control" id="sp" minlength="5" required></label><button class="ui-button btn">Cadastrar diretamente</button></form></div></section><section class="card"><h2 class="section-heading">Meus alunos</h2><div class="list">${ss.map((s) => `<div class="row student-list-row"><div class="student-list-info"><b class="row-title">${escapeHTML(s.name)}</b><div class="muted">@${escapeHTML(s.username)}</div></div><div class="student-nav-actions"><button class="student-nav-button" aria-label="Treinos" title="Treinos" onclick="studentWorkout(${s.id})"><span class="student-nav-icon">🏋️</span></button><button class="student-nav-button" aria-label="Avaliação" title="Avaliação" onclick="openEvaluationPage()"><svg class="student-evaluation-svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 17l6-6 4 4 6-8M14 7h6v6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button><button class="student-nav-button" aria-label="Calendário" title="Calendário" onclick="studentCalendar(${s.id})"><svg class="student-calendar-svg" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M7 3v4M17 3v4M3 10h18" fill="none" stroke="currentColor" stroke-width="1.8"/></svg></button><button class="student-nav-button" aria-label="Pagamento" title="Pagamento" onclick="studentPayment(${s.id})"><span class="student-nav-icon">💳</span></button><button class="student-nav-button" aria-label="Perfil" title="Perfil" onclick="studentProfile(${s.id})"><span class="student-nav-icon">👤</span></button></div><div class="student-inline-calendar" id="student-inline-calendar-${s.id}" hidden></div></div>`).join("") || '<span class="empty">Nenhum aluno.</span>'}</div></section></div><div id="editor"></div>`;
  document.querySelector("#sf").onsubmit = async (e) => {
    e.preventDefault();
    try {
      await req("/students", {
        method: "POST",
        body: JSON.stringify({
          name: sn.value,
          username: su.value.trim().toLowerCase(),
          phone: sphone.value,
          password: sp.value,
        }),
      });
      await alunos();
    } catch (err) {
      alert(err.message);
    }
  };
}

let workoutExercises = [];
function addExercise() {
  workoutExercises.push({
    key: crypto.randomUUID(),
    name: "",
    sets: 3,
    note: "",
  });
  drawExerciseEditor();
}
function drawExerciseEditor() {
  const box = document.querySelector("#exerciseEditor");
  if (!box) return;
  box.innerHTML = workoutExercises
    .map(
      (x, i) =>
        `<div class="exercise-edit exercise-edit-${i}"><b class="exercise-edit-heading">Exercício ${i + 1}</b><label class="field exercise-name-label">Nome<input class="form-control exercise-name-input" data-ex="${i}" data-prop="name" value="${escapeHTML(x.name)}" required></label><label class="field exercise-sets-label">Séries<input class="form-control exercise-sets-input" data-ex="${i}" data-prop="sets" type="number" min="1" max="20" value="${x.sets}" required></label><label class="field exercise-note-label">Observações<textarea class="form-textarea exercise-note-input" data-ex="${i}" data-prop="note">${escapeHTML(x.note)}</textarea></label><label class="exercise-media-label">Foto ou vídeo do exercício<input class="exercise-media-input" type="file" accept="image/jpeg,image/png,image/webp,video/mp4,video/webm" data-media-ex="${i}"></label>${x.media ? `<div class="exercise-media-preview">Mídia anexada · <button type="button" class="exercise-media-remove" data-remove-media="${i}">Remover mídia</button></div>` : ""}<button type="button" class="exercise-remove-button" onclick="removeExercise(${i})">Remover exercício</button></div>`,
    )
    .join("");
  box.querySelectorAll("[data-media-ex]").forEach((el) =>
    el.addEventListener("change", async () => {
      const f = el.files?.[0];
      if (!f) return;
      if (f.size > 12 * 1024 * 1024) {
        alert("Limite de 12 MB por mídia.");
        el.value = "";
        return;
      }
      const data = new FormData();
      data.append("file", f);
      el.disabled = true;
      try {
        const r = await fetch(API + "/exercise-media", {
          method: "POST",
          headers: { Authorization: "Bearer " + token },
          body: data,
        });
        const result = await r.json();
        if (!r.ok) throw Error(result.detail || "Falha no envio");
        workoutExercises[Number(el.dataset.mediaEx)].media = result.url;
        drawExerciseEditor();
      } catch (err) {
        alert(err.message);
        el.disabled = false;
      }
    }),
  );
  box.querySelectorAll("[data-remove-media]").forEach((el) =>
    el.addEventListener("click", () => {
      delete workoutExercises[Number(el.dataset.removeMedia)].media;
      drawExerciseEditor();
    }),
  );
  box.querySelectorAll("[data-ex]").forEach((el) =>
    el.addEventListener("input", () => {
      workoutExercises[+el.dataset.ex][el.dataset.prop] =
        el.dataset.prop === "sets" ? Number(el.value) : el.value;
    }),
  );
}
function removeExercise(i) {
  workoutExercises.splice(i, 1);
  drawExerciseEditor();
}
function exerciseMediaButton(ex) {
  return ex.media
    ? `<button type="button" class="exercise-view-media" data-media="${escapeHTML(ex.media)}">Ver mídia</button>`
    : "";
}
function openExerciseMedia(url) {
  if (!url || !url.startsWith("/api/exercise-media/")) return;
  const dialog = document.createElement("dialog");
  dialog.className = "exercise-media-dialog";
  const isVideo = /\.(mp4|webm)$/i.test(url);
  dialog.innerHTML = `<div class="exercise-media-dialog-header"><strong>Mídia do exercício</strong><button class="exercise-media-dialog-close" type="button">✕ Fechar</button></div>${isVideo ? `<video controls playsinline src="${url}"></video>` : `<img alt="Mídia do exercício" src="${url}">`}`;
  document.body.append(dialog);
  dialog.querySelector("button").onclick = () => dialog.close();
  dialog.onclose = () => dialog.remove();
  dialog.showModal();
}
document.addEventListener("click", (e) => {
  const button = e.target.closest(".exercise-view-media");
  if (button) openExerciseMedia(button.dataset.media);
});
function formatPublishedExercises(content) {
  let exercises;
  try {
    exercises = JSON.parse(content);
  } catch {
    return escapeHTML(content || "");
  }
  return Array.isArray(exercises)
    ? exercises
        .map(
          (x) =>
            `<div class="student-workout-exercise"><strong>${escapeHTML(x.name || "Exercício")}</strong><span>${Number(x.sets) || 0} séries</span>${x.note ? `<small class="student-workout-exercise-note">${escapeHTML(x.note)}</small>` : ""}${exerciseMediaButton(x)}</div>`,
        )
        .join("")
    : escapeHTML(content || "");
}
async function workout(id, name) {
  const all = await req("/workouts");
  editor.innerHTML = `<section class="card editor"><h2>Treino de ${escapeHTML(name)}</h2><div class="list">${
    all
      .filter((x) => Number(x.student_id) === Number(id))
      .map(
        (x) =>
          `<details class="student-workout-entry"><summary class="student-workout-summary"><span class="student-workout-summary-label">${escapeHTML(x.title)} · ${escapeHTML(x.periodization || "Treino publicado")}</span><span class="student-workout-summary-chevron" aria-hidden="true"></span></summary><div class="student-workout-exercises">${formatPublishedExercises(x.content)}</div></details>`,
      )
      .join("") ||
    '<p class="student-workout-empty">Nenhum treino publicado para este aluno.</p>'
  }</div><form class="app-form" id="wf"><label class="field">Título<input class="form-control" name="title" required></label><label class="field">Periodização<input class="form-control" name="periodization"></label><div id="exerciseEditor"></div><button class="btn-action ui-button btn ghost" type="button" onclick="addExercise()">+ Adicionar exercício</button><button class="btn-action ui-button btn">Enviar para o aluno</button></form></section>`;
  workoutExercises = [];
  addExercise();
  wf.onsubmit = async (e) => {
    e.preventDefault();
    if (
      !workoutExercises.length ||
      workoutExercises.some((x) => !x.name.trim() || x.sets < 1)
    ) {
      alert("Preencha os exercícios e séries.");
      return;
    }
    try {
      await req("/workouts", {
        method: "POST",
        body: JSON.stringify({
          student_id: id,
          title: wf.querySelector('[name="title"]').value,
          periodization: wf.querySelector('[name="periodization"]').value,
          content: JSON.stringify(workoutExercises),
        }),
      });
      alert("Treino enviado ao aluno.");
      alunos();
    } catch (err) {
      alert(err.message);
    }
  };
}
async function treino() {
  let ws = await req("/workouts");
  view.innerHTML = `<div class="workout-links">${ws.map((w) => `<details class="card workout-slide"><summary class="workout-slide-summary"><span class="workout-slide-summary-label">${escapeHTML(w.title)}</span><span class="workout-slide-summary-chevron" aria-hidden="true"></span></summary><div class="workout-preview" id="preview-${w.id}"></div><button class="ui-button btn" onclick="treinoDetalhe(${w.id})">Realizar treino</button></details>`).join("") || '<section class="card">Nenhum treino disponível.</section>'}</div>`;
  ws.forEach((w) => {
    let ex = [];
    try {
      ex = JSON.parse(w.content);
    } catch {}
    document.getElementById("preview-" + w.id).innerHTML = Array.isArray(ex)
      ? ex
          .map(
            (x) =>
              `<div class="row">${escapeHTML(x.name)} · ${x.sets} séries</div>`,
          )
          .join("")
      : escapeHTML(w.content);
  });
}
const workoutMenuIcon = `<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="currentColor"><path d="M7 2h10l2 3v4l-3 3-2-2v12h-4V10l-2 2-3-3V5zM2 4h3v6H2zm17 0h3v6h-3z"/></svg>`;
let workoutPlayer = null;
async function treinoDetalhe(id) {
  const w = await req("/workouts/" + id);
  let exercises = [];
  try {
    exercises = JSON.parse(w.content);
  } catch {}
  if (!Array.isArray(exercises)) exercises = [];
  const steps = exercises.flatMap((ex, index) =>
    Array.from({ length: Math.max(0, Number(ex.sets) || 0) }, (_, j) => ({
      ex,
      index,
      set: j + 1,
    })),
  );
  view.innerHTML = `<section class="training-player"><button class="training-player-back training-player-action" onclick="leaveWorkoutPlayer()">← Treinos</button><h1 class="training-player-title">${escapeHTML(w.title)}</h1><div class="training-player-stage" id="trainingStage"></div><button class="training-player-start training-player-action" id="startWorkout">Iniciar treino</button><button class="training-player-finish training-player-action" id="finishWorkout" disabled>Finalizar treino</button><div class="training-player-timer-footer"><strong class="training-player-timer-value" id="timerText">00:00:00</strong></div></section>`;
  workoutPlayer = { id, title: w.title, steps, index: 0, started: false, savedSets: 0 };
  document.querySelector("#startWorkout").onclick = () => {
    if (!steps.length) {
      alert("Este treino não possui séries cadastradas.");
      return;
    }
    workoutPlayer.started = true;
    const startAction = document.querySelector("#startWorkout");
    startAction.textContent = "Cancelar treino";
    startAction.classList.add("training-player-cancel");
    startAction.onclick = cancelWorkoutSession;
    startWorkoutTimer(id, w.title);
    renderWorkoutStep();
  };
  document.querySelector("#finishWorkout").onclick = () =>
    finishWorkoutTimer(id, w.title);
  document.querySelector("#trainingStage").innerHTML =
    `<div class="workout-exercise-list">${exercises.map((x, i) => `<div class="workout-exercise-row"><strong>${escapeHTML(x.name)}</strong><span class="workout-exercise-count">${Number(x.sets) || 0} séries</span>${x.note ? `<small>${escapeHTML(x.note)}</small>` : ""}${exerciseMediaButton(x)}</div>`).join("")}</div>`;
}
function renderWorkoutStep() {
  const p = workoutPlayer,
    stage = document.querySelector("#trainingStage");
  if (!p || !stage) return;
  const step = p.steps[p.index];
  if (!step) {
    stage.innerHTML =
      '<h2 class="training-player-complete">Todas as séries registradas!</h2>';
    document.querySelector("#finishWorkout").disabled = false;
    return;
  }
  const group = p.steps.filter((x) => x.index === step.index);
  const groupIndex = group.findIndex((x) => x.set === step.set);
  stage.innerHTML = `<div class="training-player-progress training-player-progress-text"><span>EXERCÍCIO ${step.index + 1}</span><span>SÉRIE ${step.set} DE ${Number(step.ex.sets) || 0}</span></div><h2 class="training-player-exercise">${escapeHTML(step.ex.name)}</h2>${exerciseMediaButton(step.ex)}${step.ex.note ? `<p class="training-player-note">${escapeHTML(step.ex.note)}</p>` : ""}<div class="training-series-pills">${group.map((x, i) => `<span class="${i === groupIndex ? "selected" : ""}">${i + 1}ª</span>`).join("")}</div><p class="training-last-load" id="trainingLastLoad">Última carga registrada: consultando...</p><form class="training-player-form training-player-modern" id="trainingSetForm"><div class="training-player-fields"><label>Peso (kg)<input class="training-player-load" name="load" type="number" min="0" max="2000" step="0.5" inputmode="decimal" required></label><label>Repetições feitas<input class="training-player-load" name="reps" type="number" min="0" max="1000" step="1" inputmode="numeric" required></label></div><button class="training-player-check training-player-action">✓ Concluir série</button></form>`;
  showLastRegisteredLoad(p, step);
  document.querySelector("#trainingSetForm").onsubmit = async (e) => {
    e.preventDefault();
    const button = e.target.querySelector("button");
    button.disabled = true;
    try {
      await req("/workout-sets", {
        method: "POST",
        body: JSON.stringify({
          workout_id: p.id,
          exercise_key: String(step.ex.key || `exercise-${step.index}`),
          exercise_name: step.ex.name,
          set_number: step.set,
          load_kg: Number(e.target.elements.load.value),
          reps: Number(e.target.elements.reps.value),
        }),
      });
      p.savedSets++;
      p.index++;
      renderWorkoutStep();
    } catch (err) {
      button.disabled = false;
      alert(err.message);
    }
  };
}
async function showLastRegisteredLoad(player, step) {
  const info = document.getElementById("trainingLastLoad");
  if (!info) return;
  try {
    const all = await req(`/workout-sets/${player.id}`);
    if (workoutPlayer !== player || player.steps[player.index] !== step || !info.isConnected) return;
    const matches = all.filter((row) =>
      step.ex.key
        ? String(row.exercise_key) === String(step.ex.key)
        : String(row.exercise_name || "").trim().toLocaleLowerCase("pt-BR") ===
          String(step.ex.name || "").trim().toLocaleLowerCase("pt-BR"),
    );
    const latest = matches.sort((a, b) =>
      new Date(b.performed_at) - new Date(a.performed_at),
    )[0];
    info.textContent = latest
      ? `Última carga registrada: ${Number(latest.load_kg)} kg · ${formatTreinaDate(latest.performed_at)}`
      : "Última carga registrada: nenhuma";
  } catch {
    if (info.isConnected) info.textContent = "Última carga registrada: indisponível";
  }
}
function cancelWorkoutSession() {
  if (!workoutPlayer?.started) return;
  const message = workoutPlayer.savedSets
    ? "Cancelar o treino? As séries já registradas permanecerão salvas no histórico."
    : "Cancelar o treino iniciado por engano?";
  if (!confirm(message)) return;
  leaveWorkoutPlayer();
}
function moveWorkoutStep(delta) {
  if (workoutPlayer) {
    workoutPlayer.index = Math.max(
      0,
      Math.min(workoutPlayer.steps.length - 1, workoutPlayer.index + delta),
    );
    renderWorkoutStep();
  }
}

function leaveWorkoutPlayer() {
  if (activeWorkoutTimer) {
    clearInterval(activeWorkoutTimer.interval);
    activeWorkoutTimer = null;
  }
  workoutPlayer = null;
  treino();
}
function drawLoadChart(i, rows) {
  const el = document.getElementById("chart-" + i);
  if (!el) return;
  const recent = rows.slice(-15),
    max = Math.max(1, ...recent.map((x) => x.load_kg));
  el.innerHTML = `<p class="muted">Evolução de cargas por série</p><div class="load-bars">${recent.map((x) => `<div class="load-bar" style="height:${Math.max(8, (x.load_kg / max) * 125)}px" title="${escapeHTML(x.performed_at)}"><span class="load-bar-label">${x.load_kg}kg</span></div>`).join("")}</div>${recent.length ? "" : '<p class="muted">Registre séries para visualizar o gráfico.</p>'}`;
}
function startWorkoutTimer(id, title) {
  if (activeWorkoutTimer) clearInterval(activeWorkoutTimer.interval);
  const startButton = document.querySelector("#startWorkout");
  const finishButton = document.querySelector("#finishWorkout");
  const timerDisplay = document.querySelector("#timerText");
  if (!startButton || !finishButton || !timerDisplay) return;
  const started = Date.now();
  activeWorkoutTimer = { id, title, started };
  startButton.disabled = false;
  finishButton.disabled = false;
  timerDisplay.textContent = "00:00:00";
  activeWorkoutTimer.interval = setInterval(() => {
    timerDisplay.textContent = formatDuration(Date.now() - started);
  }, 1000);
}
function formatDuration(ms) {
  let t = Math.floor(ms / 1000),
    h = Math.floor(t / 3600),
    m = Math.floor((t % 3600) / 60),
    s = t % 60;
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
}
async function finishWorkoutTimer(id, title) {
  if (!activeWorkoutTimer || activeWorkoutTimer.id !== id) return;
  clearInterval(activeWorkoutTimer.interval);
  const duration = Date.now() - activeWorkoutTimer.started;
  activeWorkoutTimer = null;
  const cancelButton = document.querySelector("#startWorkout");
  if (cancelButton) cancelButton.disabled = true;
  await req("/workouts/" + id + "/complete", { method: "POST" });
  await shareWorkoutCard(title, duration);
  const finishButton = document.querySelector("#finishWorkout");
  const startButton = document.querySelector("#startWorkout");
  if (finishButton) finishButton.disabled = true;
  if (startButton) {
    startButton.disabled = true;
    startButton.textContent = "Treino concluído";
    startButton.onclick = null;
  }
}
async function shareWorkoutCard(title, duration) {
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1920;
  const c = canvas.getContext("2d");
  c.clearRect(0, 0, 1080, 1920);
  try {
    const img = new Image();
    img.src = defaultLogoIcon(brand.color);
    await img.decode();
    c.drawImage(img, 340, 260, 400, 400);
  } catch (e) {}
  c.textAlign = "center";
  c.fillStyle = brand.color;
  c.font = "bold 100px Arial";
  c.fillText("TREINA+", 540, 155);
  c.font = "bold 44px Arial";
  c.fillText(
    "TIME " + (brand.professor || "PROFESSOR").toUpperCase(),
    540,
    760,
  );
  c.font = "bold 54px Arial";
  c.font = 'bold 54px "Bebas Neue", Arial';
  c.fillText("TREINO CONCLUÍDO", 540, 930);
  c.fillStyle = "#fff";
  c.font = "bold 78px Arial";
  wrapCanvasText(c, title.toUpperCase(), 540, 1050, 850, 92);
  c.fillStyle = "#a9b0ae";
  c.font = "bold 36px Arial";
  c.fillText("DURAÇÃO", 540, 1320);
  c.fillStyle = "#fff";
  c.font = "bold 110px Arial";
  c.fillText(formatDuration(duration), 540, 1440);

  const blob = await new Promise((r) => canvas.toBlob(r, "image/png"));
  const file = new File([blob], "treinamais-treino.png", { type: "image/png" });
  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({
        title: "Treino concluído",
        text: `${title} • ${formatDuration(duration)}`,
        files: [file],
      });
      return;
    } catch (e) {
      if (e.name === "AbortError") return;
    }
  }
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "treinamais-treino.png";
  a.click();
  URL.revokeObjectURL(a.href);
  alert("Card gerado. No celular, compartilhe a imagem no Instagram Stories.");
}
function wrapCanvasText(c, text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
  let line = "",
    lines = [];
  for (const word of words) {
    const test = line ? line + " " + word : word;
    if (c.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else line = test;
  }
  lines.push(line);
  lines.slice(0, 3).forEach((l, i) => c.fillText(l, x, y + i * lineHeight));
}
async function complete(id) {
  await req("/workouts/" + id + "/complete", { method: "POST" });
  alert("Treino concluído!");
}
async function optimizePhoto(file) {
  if (!file.type.startsWith("image/"))
    throw new Error("Selecione apenas arquivos de imagem.");

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

  const blob = await new Promise((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", 0.82),
  );
  if (!blob) throw new Error("Não foi possível preparar a foto para envio.");
  if (blob.size > 3.5 * 1024 * 1024)
    throw new Error("A foto ainda ficou muito grande após a otimização.");

  const baseName = (file.name || "foto").replace(/\.[^.]+$/, "");
  return new File([blob], `${baseName}.jpg`, { type: "image/jpeg" });
}

async function evolucao() {
  let w = await req("/weights/" + user.id),
    max = Math.max(...w.map((x) => x.value), 1);
  view.innerHTML = `<div class="grid"><section class="card"><div class="section-head"><h2 class="section-heading">Peso semanal</h2></div><form class="app-form" id="peso"><label class="field">Peso (kg)<input class="form-control" id="kg" type="number" step=".1" required></label><button class="btn-action ui-button btn">Registrar peso</button></form><div class="chart">${w.map((x) => `<div class="bar" style="height:${Math.max(12, (x.value / max) * 130)}px" title="${x.value} kg"><span class="bar-label">${String(x.measured_on).slice(5)}</span></div>`).join("")}</div></section><section class="card"><h2 class="section-heading">Foto de evolução</h2><p class="text-paragraph muted">Envie sua foto semanal. O arquivo fica vinculado exclusivamente à sua conta.</p><form class="app-form" id="photo"><label class="field">Imagens<input class="form-control" id="img" type="file" accept="image/*" multiple required></label><button class="btn-action ui-button btn">Enviar foto</button></form></section></div>`;
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
          if (r.status === 413)
            detail =
              "A foto ficou grande demais para o servidor. Tente outra imagem.";
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
async function openEvaluationPage() {
  selectedStudentId = null;
  tab = "fotos";
  await render();
}
let evaluationOpenStudent = null;
async function fotosAlunos() {
  const students = await req("/students");
  view.innerHTML = `<section class="evaluation-panel"><div class="evaluation-students">${students.map((s) => `<div class="evaluation-student" id="evaluation-student-${s.id}"><button class="evaluation-student-toggle" aria-expanded="false" onclick="openStudentPhotos(${s.id})"><span class="evaluation-student-name">${escapeHTML(s.name)}</span><span class="evaluation-student-arrow" aria-hidden="true"></span></button><div class="evaluation-student-detail" id="evaluation-detail-${s.id}" hidden></div></div>`).join("") || '<p class="evaluation-empty">Nenhum aluno cadastrado.</p>'}</div></section>`;
  evaluationOpenStudent = null;
}
let evaluationData = {};
async function openStudentPhotos(id) {
  if (tab !== "fotos") {
    tab = "fotos";
    await fotosAlunos();
  }
  const detail = document.getElementById("evaluation-detail-" + id);
  if (!detail) return;
  if (evaluationOpenStudent === id) {
    detail.hidden = true;
    evaluationOpenStudent = null;
    return;
  }
  if (evaluationOpenStudent !== null) {
    const old = document.getElementById(
      "evaluation-detail-" + evaluationOpenStudent,
    );
    if (old) old.hidden = true;
  }
  evaluationOpenStudent = id;
  detail.hidden = false;
  detail.innerHTML = "<p>Carregando...</p>";
  try {
    const [photos, weights, workouts] = await Promise.all([
      req("/photos/" + id),
      req("/weights/" + id),
      req("/workouts"),
    ]);
    const assigned = workouts.filter(
      (w) => Number(w.student_id) === Number(id),
    );
    const loads = await Promise.all(
      assigned.map(async (w) => ({
        workout: w,
        sets: await req("/workout-sets/" + w.id),
      })),
    );
    evaluationData[id] = { photos, weights, loads };
    detail.innerHTML = `<div class="evaluation-modes"><button class="ui-button btn" onclick="evaluationMode(${id},'photos')">Fotos</button><button class="ui-button btn" onclick="evaluationMode(${id},'loads')">Cargas</button><button class="ui-button btn" onclick="evaluationMode(${id},'weights')">Pesos</button></div><div id="evaluation-content-${id}"></div>`;
    evaluationMode(id, "photos");
  } catch (e) {
    detail.textContent = e.message;
  }
}
function weightBarChart(records, heading = "Histórico de pesos") {
  const rows = [...records]
    .filter((x) => Number.isFinite(Number(x.value)) && Number(x.value) > 0)
    .sort((a, b) => String(a.measured_on).localeCompare(String(b.measured_on)));
  if (!rows.length) return '<p class="muted">Nenhum peso registrado.</p>';
  const max = Math.max(...rows.map((x) => Number(x.value)), 1);
  const latest = rows[rows.length - 1],
    highest = rows.reduce((a, b) =>
      Number(a.value) >= Number(b.value) ? a : b,
    );
  return `<section class="weight-chart-section"><h3>${escapeHTML(heading)}</h3><div class="weight-chart-highlights"><p class="weight-summary-line">Último registro: <strong>${escapeHTML(formatTreinaDate(latest.measured_on))}</strong></p><p class="weight-summary-line">Último peso: <strong>${Number(latest.value)} kg</strong></p><p class="weight-summary-line">Maior peso: <strong>${Number(highest.value)} kg</strong></p></div><p class="muted">Toque em uma barra para destacar o peso.</p><div class="weight-bar-chart" role="group" aria-label="Gráfico de barras do histórico de pesos">${rows
    .map((x) => {
      const value = Number(x.value),
        date = String(x.measured_on || "");
      const label = date.slice(5).split("-").reverse().join("/");
      return `<button type="button" class="weight-chart-column" aria-label="${escapeHTML(date)}: ${value} kg" onclick="showWeightValue(this)"><span class="weight-chart-value" aria-live="polite">${value} kg</span><span class="weight-chart-bar" style="height:${Math.max(8, (value / max) * 165)}px"></span><span class="weight-chart-date">${escapeHTML(label)}</span><span class="weight-chart-hidden" hidden>${value} kg</span></button>`;
    })
    .join("")}</div></section>`;
}
function showWeightValue(button) {
  const value = button.querySelector(".weight-chart-hidden")?.textContent || "";
  const label = button.querySelector(".weight-chart-value");
  const already = button.classList.contains("selected");
  button
    .closest(".weight-bar-chart")
    ?.querySelectorAll(".weight-chart-column")
    .forEach((x) => {
      x.classList.remove("selected");
      const v = x.querySelector(".weight-chart-value");
      if (v)
        v.textContent =
          x.querySelector(".weight-chart-hidden")?.textContent || "";
    });
  if (!already) {
    button.classList.add("selected");
    label.textContent = value;
  }
}
function evaluationMode(id, mode) {
  const d = evaluationData[id];
  const el = document.getElementById("evaluation-content-" + id);
  if (!d || !el) return;
  if (mode === "photos") {
    el.innerHTML = `<div class="evaluation-photo-grid">${d.photos.map((p) => `<figure class="evaluation-photo-item"><a href="${escapeHTML(p.path.startsWith("data:") ? p.path : API.replace(/\/api$/, "") + p.path)}" target="_blank"><img class="evaluation-photo" src="${escapeHTML(p.path.startsWith("data:") ? p.path : API.replace(/\/api$/, "") + p.path)}" alt="Foto de evolução"></a><figcaption>${escapeHTML(formatTreinaDate(p.created_at))}</figcaption></figure>`).join("") || "Nenhuma foto registrada."}</div>`;
    return;
  }
  if (mode === "weights") {
    el.innerHTML = weightBarChart(d.weights, "Pesos registrados");
    return;
  }
  const entries = d.loads.flatMap(({ workout, sets }) =>
    sets.map((x) => ({ ...x, workoutTitle: workout.title })),
  );
  const options = [
    ...new Set(entries.map((x) => x.exercise_name).filter(Boolean)),
  ];
  el.innerHTML = `<label class="field">Buscar exercício<input id="exerciseSearch" class="form-control" list="exerciseOptions" placeholder="Digite o exercício"></label><datalist id="exerciseOptions">${options.map((x) => `<option value="${escapeHTML(x)}">`).join("")}</datalist><div id="loadChart"></div>`;
  const input = el.querySelector("#exerciseSearch");
  input.oninput = () => drawEvaluationLoadChart(id, input.value);
  drawEvaluationLoadChart(id, options[0] || "");
  input.value = options[0] || "";
}
function drawEvaluationLoadChart(id, search) {
  const el = document.getElementById("loadChart");
  if (!el) return;
  const term = String(search || "")
    .trim()
    .toLocaleLowerCase("pt-BR");
  const rows = (evaluationData[id]?.loads || [])
    .flatMap(({ workout, sets }) =>
      (sets || [])
        .filter(
          (x) =>
            term &&
            String(x.exercise_name || "")
              .trim()
              .toLocaleLowerCase("pt-BR")
              .includes(term),
        )
        .map((x) => ({ ...x, workoutTitle: workout.title })),
    )
    .filter((x) => Number.isFinite(Number(x.load_kg)) && Number(x.load_kg) >= 0)
    .sort((a, b) => new Date(a.performed_at) - new Date(b.performed_at))
    .slice(-15);
  if (!rows.length) {
    el.innerHTML =
      '<p class="evaluation-no-loads">Nenhuma carga registrada para este exercício.</p>';
    return;
  }
  const max = Math.max(1, ...rows.map((x) => Number(x.load_kg)));
  el.innerHTML = `<section class="evaluation-load-chart-section"><h3 class="evaluation-load-chart-title">${escapeHTML(search)}</h3><div class="evaluation-load-bars" role="group" aria-label="Cargas registradas para ${escapeHTML(search)}">${rows
    .map((x) => {
      const value = Number(x.load_kg);
      const date = new Date(x.performed_at);
      const label = Number.isNaN(date.getTime())
        ? ""
        : date.toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
          });
      return `<div class="evaluation-load-column" title="${escapeHTML(x.workoutTitle)} · ${escapeHTML(label)}: ${value} kg"><span class="evaluation-load-value">${value}kg</span><div class="evaluation-load-bar" style="height:${Math.max(8, (value / max) * 155)}px"></div><span class="evaluation-load-date">${escapeHTML(label)}</span></div>`;
    })
    .join("")}</div></section>`;
}

async function contato() {
  if (user.role === "student") return contatosAluno();
  const data = await req("/branding").catch(() => brand);
  const students = await req("/students").catch(() => []);
  const phone = String(data.phone || "").replace(/\D/g, "");
  const url = phone
    ? "https://wa.me/" + (phone.startsWith("55") ? phone : "55" + phone)
    : "";
  view.innerHTML = `<section class="contact-card">${logo()}<h2>Contato com o professor</h2>${user.role === "professor" ? `<form id="contactPhoneForm" class="app-form"><label class="field">Telefone do WhatsApp<input class="form-control" name="phone" type="tel" value="${escapeHTML(data.phone || "")}" placeholder="11999999999" required></label><button class="btn-action ui-button btn" type="submit">Salvar WhatsApp</button></form>` : ""}${url ? `<a class="app-link contact-link" href="${url}" target="_blank" rel="noopener noreferrer"><img src="/whatsapp.png" alt="WhatsApp" style="width:72px;height:72px;object-fit:contain"><strong>Conversar com ${escapeHTML(data.professor)}</strong></a>` : "<p>O professor ainda não cadastrou um telefone.</p>"}<div class="professor-contact-list"><h3>Meus alunos</h3>${students.map((st) => { const studentPhone = String(st.phone || "").replace(/\D/g, ""); const studentUrl = studentPhone ? `https://wa.me/${studentPhone.startsWith("55") ? studentPhone : "55" + studentPhone}` : ""; return `<div class="professor-contact-row">${studentUrl ? `<a class="professor-contact-name" href="${studentUrl}" target="_blank" rel="noopener noreferrer">${escapeHTML(st.name)}</a>` : `<strong>${escapeHTML(st.name)}</strong>`}<span>${escapeHTML(st.phone || "Telefone não cadastrado")}</span></div>`; }).join("")}</div></section>`;
  const contactPhoneForm = document.getElementById("contactPhoneForm");
  if (contactPhoneForm)
    contactPhoneForm.onsubmit = async (e) => {
      e.preventDefault();
      try {
        await req("/branding", {
          method: "PUT",
          body: JSON.stringify({
            color: data.color || brand.color,
            logo: null,
            phone: contactPhoneForm.phone.value,
          }),
        });
        await loadBrand();
        await contato();
      } catch (err) {
        alert(err.message || "Não foi possível salvar o telefone.");
      }
    };
}
async function marcaProfessor() {
  view.innerHTML = `<section class="card"><h2>Minha identidade</h2><p>A logo oficial do TREINA+ é fixa. Personalize apenas sua cor.</p>${logo()}<form id="brandForm" class="app-form"><label class="field">Cor da equipe<input type="color" name="color" value="${brand.color}"></label><label class="field">WhatsApp do professor<input name="phone" type="tel" value="${escapeHTML(brand.phone || "")}"></label><button class="btn-action ui-button btn">Salvar identidade</button></form></section>`;
  brandForm.onsubmit = async (e) => {
    e.preventDefault();
    try {
      await req("/branding", {
        method: "PUT",
        body: JSON.stringify({
          color: brandForm.color.value,
          logo: null,
          phone: brandForm.phone.value,
        }),
      });
      await loadBrand();
      localStorage.setItem("brandSetup_" + user.id, "1");
      tab = "agenda";
      render();
    } catch (err) {
      alert(err.message);
    }
  };
}

function welcomeProfessor() {
  tab = "marca";
  render().then(() => {
    const h = document.querySelector(".page-heading");
    if (h) h.textContent = "Bem-vindo, professor!";
  });
}
let editingWorkout = null;
async function studentWorkout(id) {
  tab = "treinos";
  await render();
  const row = document.getElementById("student-workouts-" + id);
  if (row) {
    row.open = true;
    row.scrollIntoView({ block: "start", behavior: "smooth" });
  }
}
const expandedWorkoutStudents = new Set();
async function treinosProfessor() {
  const [students, workouts] = await Promise.all([
    req("/students"),
    req("/workouts"),
  ]);
  view.innerHTML = `<div class="payment-page workout-management">${
    students
      .map(
        (st) =>
          `<details id="student-workouts-${st.id}" class="card payment-student" data-workout-student="${st.id}" ${expandedWorkoutStudents.has(String(st.id)) ? "open" : ""}><summary class="payment-student-toggle"><span class="nome-aluno-treinos">${escapeHTML(st.name)}</span><span class="payment-chevron" aria-hidden="true"></span></summary><div class="payment-student-content"><div class="workout-list">${
            workouts
              .filter((w) => Number(w.student_id) === Number(st.id))
              .map(
                (w) =>
                  `<details class="student-workout-entry"><summary class="student-workout-summary"><span>${escapeHTML(w.title)}</span><span class="payment-chevron"></span></summary><div class="workout-item-content">${formatPublishedExercises(w.content)}<div class="row"><button class="btn-action ui-button btn" onclick="editPublishedWorkout(${w.id})">✎ Editar</button><button class="btn-action ui-button btn" onclick="deletePublishedWorkout(${w.id})">Excluir</button></div></div></details>`,
              )
              .join("") || "<p>Nenhum treino.</p>"
          }</div><div class="workout-editor-actions"><button type="button" class="adicionar-treino" onclick="newPublishedWorkout(${st.id})">+ Adicionar treino</button><button type="button" class="workout-editor-close workout-editor-close-action" id="workout-editor-close-${st.id}" onclick="closeWorkoutEditor(${st.id})" hidden>✕ Fechar</button></div><div class="student-workout-editor" id="workout-editor-${st.id}"></div></div></details>`,
      )
      .join("") ||
    '<section class="card">Cadastre um aluno para adicionar treinos.</section>'
  }</div>`;
  document.querySelectorAll("[data-workout-student]").forEach((card) =>
    card.addEventListener("toggle", () => {
      const id = card.dataset.workoutStudent;
      if (card.open) expandedWorkoutStudents.add(id);
      else {
        expandedWorkoutStudents.delete(id);
        card.querySelector(".student-workout-editor").replaceChildren();
        editingWorkout = null;
      }
    }),
  );
}
function closeWorkoutEditor(id) {
  const el = document.getElementById("workout-editor-" + id);
  if (el) el.replaceChildren();
  const closeAction = document.getElementById("workout-editor-close-" + id);
  if (closeAction) closeAction.hidden = true;
  editingWorkout = null;
}
async function newPublishedWorkout(id) {
  editingWorkout = null;
  await showWorkoutEditor(id);
}
async function editPublishedWorkout(id) {
  const w = await req("/workouts/" + id);
  editingWorkout = w;
  await showWorkoutEditor(w.student_id);
}
async function deletePublishedWorkout(id) {
  if (!confirm("Excluir este treino?")) return;
  try {
    await req("/workouts/" + id, { method: "DELETE" });
    treinosProfessor();
  } catch (e) {
    alert(e.message);
  }
}
async function showWorkoutEditor(studentId) {
  const w = editingWorkout;
  expandedWorkoutStudents.add(String(studentId));
  const card = document.getElementById("student-workouts-" + studentId);
  if (card) card.open = true;
  const panel = document.getElementById("workout-editor-" + studentId);
  if (!panel) return;
  const closeAction = document.getElementById(
    "workout-editor-close-" + studentId,
  );
  if (closeAction) closeAction.hidden = false;
  panel.innerHTML = `<section class="workout-editor-surface"><form id="publishedWorkoutForm" class="workout-editor-form"><label class="workout-title-label">Título<input name="title" class="workout-title-input" value="${escapeHTML(w?.title || "")}" required></label><label class="workout-periodization-label">Periodização<input name="periodization" class="workout-periodization-input" value="${escapeHTML(w?.periodization || "")}"></label><div id="exerciseEditor"></div><button type="button" class="workout-add-exercise" onclick="addExercise()">+ Exercício</button><button class="workout-save-button">Salvar treino</button></form></section>`;
  try {
    workoutExercises = w ? JSON.parse(w.content) : [];
  } catch {
    workoutExercises = [];
  }
  if (!Array.isArray(workoutExercises)) workoutExercises = [];
  if (!workoutExercises.length)
    workoutExercises = [{ name: "", sets: 3, note: "" }];
  drawExerciseEditor();
  publishedWorkoutForm.onsubmit = async (e) => {
    e.preventDefault();
    if (
      !workoutExercises.length ||
      workoutExercises.some((x) => !x.name?.trim() || Number(x.sets) < 1)
    ) {
      alert("Informe exercícios e séries válidos.");
      return;
    }
    try {
      await req(w ? "/workouts/" + w.id : "/workouts", {
        method: w ? "PUT" : "POST",
        body: JSON.stringify({
          student_id: studentId,
          title: publishedWorkoutForm.title.value,
          periodization: publishedWorkoutForm.periodization.value,
          content: JSON.stringify(workoutExercises),
        }),
      });
      editingWorkout = null;
      treinosProfessor();
    } catch (err) {
      alert(err.message);
    }
  };
  panel.scrollIntoView({ behavior: "smooth" });
}

const expandedPaymentStudents = new Set();

async function pagamentos() {
  const rows = await req("/payments");
  const alerts = rows.flatMap((x) =>
    x.payments
      .filter((p) => p.alert)
      .map((p) => ({ name: x.student_name, due: p.due_date })),
  );
  view.innerHTML = `<div class="payment-page">${
    rows
      .map(
        (x) =>
          `<details class="card payment-student" data-payment-student="${x.student_id}" ${expandedPaymentStudents.has(String(x.student_id)) ? "open" : ""}><summary class="payment-student-toggle"><span>${escapeHTML(x.student_name)}</span><span class="payment-chevron" aria-hidden="true"></span></summary><div class="payment-student-content"><form class="app-form payment-plan" data-student="${x.student_id}"><label class="field">Primeiro vencimento<input class="form-control" type="date" name="start_date" value="${x.start_date || ""}" required></label><label class="field">Periodicidade<select class="form-select" name="cycle">${[
            ["mensal", "Mensal"],
            ["trimestral", "Trimestral"],
            ["semestral", "Semestral"],
            ["anual", "Anual"],
          ]
            .map(
              ([key, label]) =>
                `<option value="${key}" ${x.cycle === key ? "selected" : ""}>${label}</option>`,
            )
            .join(
              "",
            )}</select></label><label class="field">Valor (R$) — opcional<input class="form-control" type="number" min="0" step="0.01" name="amount" value="${x.amount ?? ""}"></label><button class="btn-action ui-button btn">Salvar vencimentos</button></form><div class="payment-items">${
            x.payments.length
              ? x.payments
                  .filter(
                    (p) =>
                      p.due_date <=
                      new Date(
                        new Date().setFullYear(new Date().getFullYear() + 1),
                      )
                        .toISOString()
                        .slice(0, 10),
                  )
                  .map(
                    (p) =>
                      `<div class="row"><div><b>${new Date(p.due_date + "T12:00:00").toLocaleDateString("pt-BR")}</b><div class="muted">${p.paid ? "Pago" : p.overdue ? "Atrasado" : "Pendente"}</div></div><label class="payment-check"><input type="checkbox" data-payment="${p.id}" ${p.paid ? "checked" : ""}> Pago</label></div>`,
                  )
                  .join("")
              : '<p class="muted">Configure o primeiro vencimento para gerar as cobranças.</p>'
          }</div></div></details>`,
      )
      .join("") ||
    '<section class="card">Cadastre um aluno primeiro para configurar os pagamentos.</section>'
  }</div>`;
  document.querySelectorAll("[data-payment-student]").forEach((card) =>
    card.addEventListener("toggle", () => {
      const id = card.dataset.paymentStudent;
      if (card.open) expandedPaymentStudents.add(id);
      else expandedPaymentStudents.delete(id);
    }),
  );
  document.querySelectorAll(".payment-plan").forEach((form) =>
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const data = new FormData(form);
      try {
        await req("/payments/plan", {
          method: "PUT",
          body: JSON.stringify({
            student_id: Number(form.dataset.student),
            start_date: data.get("start_date"),
            cycle: data.get("cycle"),
            amount:
              data.get("amount") === "" ? null : Number(data.get("amount")),
          }),
        });
        await pagamentos();
      } catch (err) {
        alert(err.message);
      }
    }),
  );
  document.querySelectorAll("[data-payment]").forEach((input) =>
    input.addEventListener("change", async () => {
      try {
        await req("/payments/" + input.dataset.payment, {
          method: "PATCH",
          body: JSON.stringify({ paid: input.checked }),
        });
        await pagamentos();
      } catch (err) {
        alert(err.message);
        input.checked = !input.checked;
      }
    }),
  );
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  token = null;
  user = null;
  brand = { color: "#65f6d2", logo: null, professor: "", phone: "" };
  document.documentElement.style.setProperty("--team-color", brand.color);
  document.documentElement.style.setProperty("--accent", brand.color);
  document.documentElement.style.setProperty("--team-color", brand.color);
  document.documentElement.style.setProperty("--accent", brand.color);
  const favicon = document.querySelector("link[rel=icon]");
  if (favicon) favicon.href = defaultLogoIcon(brand.color);
  const manifest = document.querySelector("link[rel=manifest]");
  if (manifest) manifest.href = "/manifest.json";
  previousTab = null;
  tab = "agenda";
  login();
}
Object.assign(window, {
  login,
  goBack,
  studentWorkout,
  treinosProfessor,
  closeWorkoutEditor,
  newPublishedWorkout,
  editPublishedWorkout,
  deletePublishedWorkout,
  marcaProfessor,
  evaluationMode,
  forgotPassword,
  register,
  setTab,
  toggleMenu,
  delLesson,
  changeLesson,
  shiftCalendar,
  addExercise,
  removeExercise,
  workout,
  treino,
  treinoDetalhe,
  studentCalendar,
  studentPayment,
  studentProfile,
  meuPerfil,
  studentLessonAction,
  studentLessonDelete,
  shiftStudentCalendar,
  leaveWorkoutPlayer,
  alunos,
  startWorkoutTimer,
  finishWorkoutTimer,
  openStudentPhotos,
  openEvaluationPage,
  logout,
});

if (token) loadBrand().then(render);
else render();

window.toggleStudentCreate = toggleStudentCreate;