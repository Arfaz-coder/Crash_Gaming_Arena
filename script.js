// Theme Save
const savedTheme = localStorage.getItem("theme");
if(savedTheme === "light") document.body.classList.remove("dark-mode");
else document.body.classList.add("dark-mode");

function updateThemeButton(){
  const themeBtn = document.getElementById("themeToggleBtn");
  if(!themeBtn) return;
  const isDark = document.body.classList.contains("dark-mode");
  themeBtn.textContent = isDark ? "Dark Theme" : "Light Theme";
  themeBtn.classList.toggle("active", isDark);
}

function updateFullscreenButton(){
  const fullscreenBtn = document.getElementById("fullscreenToggleBtn");
  if(!fullscreenBtn) return;
  const inFullscreen = Boolean(document.fullscreenElement);
  fullscreenBtn.textContent = inFullscreen ? "Un Full Screen" : "Full Screen";
  fullscreenBtn.classList.toggle("active", inFullscreen);
}

function toggleTheme(){
  document.body.classList.toggle("dark-mode");
  if(document.body.classList.contains("dark-mode")) localStorage.setItem("theme","dark");
  else localStorage.setItem("theme","light");
  updateThemeButton();
}

// Sidebar Toggle
const sidebarEl = document.getElementById("sidebar");
if(sidebarEl){
  sidebarEl.classList.add("collapsed");
}
function toggleSidebar(){
  if(!sidebarEl) return;
  sidebarEl.classList.toggle("collapsed");
}
function closeSidebar(){
  if(!sidebarEl) return;
  sidebarEl.classList.add("collapsed");
}

// Sidebar & Sections
function showSection(id){
  document.querySelectorAll(".main > div").forEach(sec=>sec.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
  const homeHeader = document.getElementById("homeHeader");
  if(homeHeader){
    homeHeader.classList.toggle("hidden", id !== "home");
  }
  if(id === "search") filterGames();
  if(id === "home") animateCards("#home .game-card, #home .top-game-card");
}

// Fullscreen
function toggleFullscreen(){
  if(!document.fullscreenElement) document.documentElement.requestFullscreen();
  else document.exitFullscreen();
  updateFullscreenButton();
}

// Profile Picture
function uploadProfilePic(){
  const file=document.getElementById("uploadPic").files[0];
  if(file){
    const reader=new FileReader();
    reader.onload=e=>saveProfilePicture(e.target.result);
    reader.readAsDataURL(file);
  }
}

// Auth System
let users = JSON.parse(localStorage.getItem("users")) || {};
let currentUser = localStorage.getItem("currentUser");

function refreshUsersFromStorage(){
  users = JSON.parse(localStorage.getItem("users")) || {};
}

function migrateUsersSchema(){
  let changed = false;
  Object.keys(users).forEach(username=>{
    if(typeof users[username] === "string"){
      users[username] = { password: users[username], playSeconds: 0, profilePic: "" };
      changed = true;
    } else {
      users[username].playSeconds = users[username].playSeconds || 0;
      users[username].profilePic = users[username].profilePic || "";
    }
  });
  if(changed) localStorage.setItem("users", JSON.stringify(users));
}

function applyProfilePicture(src){
  const profilePicEl = document.getElementById("profilePic");
  const navIconEl = document.getElementById("profileNavIcon");
  const navImgEl = document.getElementById("profileNavImg");
  if(profilePicEl){
    profilePicEl.src = src || "profile-placeholder.jpg";
  }
  if(navIconEl && navImgEl){
    navImgEl.src = src || "";
    navIconEl.classList.toggle("has-photo", Boolean(src));
  }
}

function loadProfilePicture(){
  if(currentUser){
    applyProfilePicture(users[currentUser]?.profilePic || "");
    return;
  }
  const guestPic = localStorage.getItem("guestProfilePic") || "";
  applyProfilePicture(guestPic);
}

function saveProfilePicture(dataUrl){
  if(currentUser && users[currentUser]){
    users[currentUser].profilePic = dataUrl;
    localStorage.setItem("users", JSON.stringify(users));
  } else {
    localStorage.setItem("guestProfilePic", dataUrl);
  }
  applyProfilePicture(dataUrl);
}

function getHoursForUser(username){
  refreshUsersFromStorage();
  if(!username || !users[username]) return 0;
  return (users[username].playSeconds || 0) / 3600;
}

function formatHoursPlayed(hoursValue){
  const totalMinutes = Math.floor(Math.max(hoursValue, 0) * 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
}

function updateHoursUI(){
  const hoursEl = document.getElementById("hoursPlayed");
  const progressEl = document.getElementById("progressFill");
  if(!hoursEl || !progressEl) return;

  const hours = getHoursForUser(currentUser);
  hoursEl.innerText = `Hours Played: ${formatHoursPlayed(hours)}`;
  progressEl.style.width = `${Math.min((hours / 50) * 100, 100)}%`;
}

function updateAuthUI(){
  const userEl = document.getElementById("username");
  const statusEl = document.getElementById("authStatus");
  const logoutBtn = document.querySelector(".logout-btn");
  if(userEl) userEl.innerText = currentUser || "Guest";
  if(statusEl) statusEl.innerText = currentUser ? `Logged in as ${currentUser}` : "Not logged in";
  if(logoutBtn) logoutBtn.disabled = !currentUser;
  loadProfilePicture();
  updateHoursUI();
}

function readAuthForm(){
  const usernameInput = document.getElementById("authUsername");
  const passwordInput = document.getElementById("authPassword");
  const username = usernameInput ? usernameInput.value.trim() : "";
  const password = passwordInput ? passwordInput.value.trim() : "";
  return { username, password, usernameInput, passwordInput };
}

function setCurrentUser(username){
  refreshUsersFromStorage();
  currentUser = username;
  if(username) localStorage.setItem("currentUser", username);
  else localStorage.removeItem("currentUser");
  updateAuthUI();
}

function signup(){
  refreshUsersFromStorage();
  const { username, password, passwordInput } = readAuthForm();
  if(!username || !password){
    alert("Enter username and password.");
    return;
  }
  if(users[username]){
    alert("Username already exists.");
    return;
  }
  users[username] = { password, playSeconds: 0 };
  localStorage.setItem("users", JSON.stringify(users));
  setCurrentUser(username); // Auto login after signup
  if(passwordInput) passwordInput.value = "";
  alert("Signup successful. You are now logged in.");
}

function login(){
  refreshUsersFromStorage();
  const { username, password, passwordInput } = readAuthForm();
  if(!username || !password){
    alert("Enter username and password.");
    return;
  }
  if(users[username] && users[username].password === password){
    setCurrentUser(username);
    if(passwordInput) passwordInput.value = "";
    alert("Login successful!");
  } else {
    alert("Invalid login!");
  }
}

function logout(){
  setCurrentUser("");
}

migrateUsersSchema();
if(currentUser && !users[currentUser]) setCurrentUser("");
updateAuthUI();
const RAW_GAMES = [
  { name:"Cryzen", genre:"Shooting game", url:"https://cryzen.io/play" },
  { name:"Venge", genre:"Shooting game", url:"https://venge.io/" },
  { name:"Slow Road", genre:"Driving game", url:"https://slowroads.io/" },
  { name:"obby roads", genre:"Road obstacle driving game", url:"https://obbyroads.io/" },
  { name:"Deadshot", genre:"Shooting game", url:"https://deadshot.io/" },
  { name:"Krunker", genre:"Shooting game", url:"https://krunker.io" },
  { name:"tribals.io", genre:"Island survival", url:"https://tribals.io/" },
  { name:"slither", genre:"Snake game", url:"https://slither.io/" },
  { name:"paper", genre:"Territory game", url:"https://paper-io.com/" },
  { name:"smash karts", genre:"Driving game", url:"https://smashkarts.io" },
  { name:"hole", genre:"City eating game", url:"https://holeio.com/" },
  { name:"Little Big Snake", genre:"snake evolution", url:"https://littlebigsnake.com" },
  { name:"Mope", genre:"animal evolution survival", url:"https://mope.io" },
  { name:"Fly Or Die", genre:"evolution flight game", url:"https://flyordie.io" },
  { name:"Exo craft", genre:"space mining + battles", url:"https://exocraft.io" },
  { name:"Star blast", genre:"space shooter", url:"https://starblast.io" },
  { name:"Lordz", genre:"medieval army battle", url:"https://lordz.io" },
  { name:"Tile Man", genre:"Territory game", url:"https://tileman.io" },
  { name:"Evo Wars", genre:"Evolution + fighting", url:"https://evowars.io" },
  { name:"Battle Dudes", genre:"2D shooter", url:"https://battledudes.io" },
  { name:"Nugget Royale", genre:"chicken survival battle", url:"https://nuggetroyale.io" },
  { name:"Creatur", genre:"Evolution + fighting", url:"https://creatur.io" },
  { name:"Snowball.io", genre:"Snow ball fight game", url:"https://snowball-io.io/" },
  { name:"mine-craft", genre:"Mine & craft", url:"https://mine-craft.io/" },
  { name:"Super hex.io", genre:"Territory capture", url:"https://superhex.io" },
  { name:"Night point.io", genre:"zombie survival shooter", url:"https://nightpoint.io" },
  { name:"Aquar.io", genre:"underwater fish evolution & battle", url:"https://aquar.io" },
  { name:"Splix.io", genre:"classic block territory capture", url:"https://splix.io" },
  { name:"Diep.io", genre:"tank battle game", url:"https://diep.io" },
  { name:"orb.farm", genre:"Sandbox game", url:"https://orb.farm/" },
  { name:"orbz", genre:".", url:"https://orbz.io/" },
  { name:"Deeeep.io", genre:"underwater survival", url:"https://deeeep.io" },
  { name:"project sand.io", genre:"Sandbox game", url:"https://www.projectsand.io/" },
  { name:"rocket bot royale2", genre:"Tank war", url:"https://rocketbotroyale2.winterpixel.io/" },
  { name:"Narwhale.io", genre:"battle with narwhals using tusks, slice enemies in half", url:"http://narwhale.io/" },
  { name:"ducklings.io", genre:"Animal evolution game", url:"https://ducklings.io/" },
  { name:"taming.io", genre:"Survival game", url:"https://taming.io/" },
  { name:"ant war.io", genre:"Ant game", url:"https://antwar.io/" },
  { name:"Mine fun.io", genre:"Minecraft game", url:"https://minefun.io/" },
  { name:"yohoho.io", genre:"Pirate game", url:"https://yohoho.io/" },
  { name:"vectaria.io", genre:"Mine and craft", url:"https://vectaria.io/" },
  { name:"bloxd", genre:"Minecraft server game", url:"https://bloxd.io/" },
  { name:"dig dig.io", genre:"Cave digging game", url:"https://digdig.io/" },
  { name:"sharkz.io", genre:"Underwater fish eating game", url:"http://sharkz.io/" },
  { name:"blob game.io", genre:"Cell eating game", url:"https://blobgame.io/" },
  { name:"Fall-io", genre:"Parkour game", url:"https://fall-io.web.app/" },
  { name:"Google puzzle 25", genre:"Puzzle game", url:"https://io.google/2025/puzzle" },
  { name:"Google puzzle 24", genre:"Puzzle game", url:"https://io.google/2024/puzzle/" },
  { name:"Flip", genre:"Card game", url:"https://flip.withgoogle.com/" },
  { name:"sea dragons.io", genre:"Underwater evolution game", url:"https://seadragons.io/?v=1.1.43" },
  { name:"Gold digger", genre:"Digging game", url:"https://golddigger.frvr.com/" },
  { name:"Farm rpg", genre:"Farming game", url:"https://farmrpg.com/" },
  { name:"Mazele", genre:"Puzzle game", url:"https://mazele.io/" },
  { name:"Worms zone", genre:"Snake evolution game", url:"https://worms.zone/game/web/" },
  { name:"Territorial-io", genre:"Territory capture game", url:"https://territorial-io.com/" },
  { name:"Minigiants", genre:"Attack game", url:"https://minigiants.io/?v=1.6.84" },
  { name:"Swordmasters.io", genre:"Attack game", url:"https://swordmasters.io/" },
  { name:"Solosurvivor", genre:"Surviving game", url:"https://solosurvivor.co/" },
  { name:"skribbl", genre:"Multiplayer guess game", url:"https://skribbl.io/" },
  { name:"Knife-io", genre:"Attack game", url:"https://knife-io.com/" },
  { name:"Gartic", genre:"Multiplayer quiz", url:"https://gartic.io/" },
  { name:"Hurricane-io", genre:"Storm game", url:"https://hurricane-io.com/" },
  { name:"Generals", genre:"Territory capture game", url:"https://generals.io/" },
  { name:"Mahjon", genre:"Card game", url:"https://mahjon.gg/" },
  { name:"Hexanaut", genre:"Territory capture game", url:"https://hexanaut.io/" },
  { name:"BuildRoyale", genre:"Battle royale shooter", url:"https://buildroyale.io/" },

  // Desktop-only games
  { name:"Zombs.io", genre:"Base building + survival", url:"https://zombs.io/", desktopOnly:true },
  { name:"Starve.io", genre:"Survival in harsh environments", url:"https://starve.io/", desktopOnly:true },
  { name:"shellshock", genre:"Shooting game", url:"https://shellshock.io", desktopOnly:true },
  { name:"warbrokers", genre:"Shooting game", url:"https://warbrokers.io", desktopOnly:true },
  { name:"miniroyale", genre:"Shooting game", url:"https://miniroyale.io/", desktopOnly:true },
  { name:"repuls", genre:"Shooting game", url:"https://repuls.io/", desktopOnly:true },
  { name:"agar", genre:"Cell eating game", url:"https://agar.io", desktopOnly:true },
  { name:"Minecraft 1.1", genre:"Mine & craft", url:"https://classic.minecraft.net/", desktopOnly:true },
  { name:"nend.io", genre:".", url:"https://nend.io/", desktopOnly:true },
  { name:"Krew.io", genre:"multiplayer ship battle on the ocean", url:"https://krew.io", desktopOnly:true },
  { name:"Zombs Royale", genre:"battle royale shooter", url:"https://zombsroyale.io", desktopOnly:true },
  { name:"Bruh.io", genre:"battle royale shooter", url:"https://bruh.io", desktopOnly:true },
  { name:"Powerline.io", genre:"Tron-like neon snakes", url:"https://powerline.io", desktopOnly:true },
  { name:"Dashcraft.io", genre:"Driving game", url:"https://dashcraft.io/", desktopOnly:true },
  { name:"Oib.io", genre:"command stickman armies and fight others", url:"https://oib.io", desktopOnly:true },
  { name:"Battletanks", genre:"Tank battle game", url:"http://battletanks.io/", desktopOnly:true },
  { name:"Tyran", genre:"Shooting game", url:"https://tyran.io/", desktopOnly:true },
  { name:"Impostor", genre:"Among us", url:"https://impostor.io/", desktopOnly:true }
];

const USER_TIER_INPUT = {
  s: [
    "cryzen","venge","slow roads","obby roads","deadshot","krunker","tribals","smash kart","fly or die","nugget royal","snowball.io","ducklings","robot bot royale","fall-io","swordmasters.io","hexanaut","shellshock","repuls","dashcraft.io"
  ],
  a: [
    "slither","paper","hole","littlebig snake","mope","exocraft","starblast","lordz","evo wars","battle dudes","creatur","mine-craft","aquar.io","orbz","deeeep.io","taming.io","ant war","google puzzle25","google puzzle24","minigiants","solosurvivor","skribbl","gartic","buildroyale","starve.io","warbrokers","agar.io","zombs royale","impostor","miniroyale"
  ],
  b: [
    "tileman.io","superhex.io","nigth point","splix","diep","mine fun.io","yoho.io","vectaria","bloxd.io","flip","gold digger","farm rpg","worms zone","territorial-io","hurricane-io","zombs.io","minecraft 1.1","nend","krew","bruh.io","battletanks","tyran"
  ],
  c: [
    "orbfarm","project sand","narwhale.io","dig dig","blop","sea dradons.io","mazele","knife-io","generals","mahjon","powerline.io","oib.io"
  ]
};

const TIER_NAME_ALIASES = {
  slowroads: "slowroad",
  tribals: "tribalsio",
  smashkart: "smashkarts",
  nuggetroyal: "nuggetroyale",
  ducklings: "ducklingsio",
  robotbotroyale: "rocketbotroyale2",
  antwar: "antwario",
  agario: "agar",
  tilemanio: "tileman",
  nigthpoint: "nightpointio",
  splix: "splixio",
  diep: "diepio",
  yohoio: "yohohoio",
  vectaria: "vectariaio",
  bloxdio: "bloxd",
  krew: "krewio",
  projectsand: "projectsandio",
  digdig: "digdigio",
  blop: "blobgameio",
  seadradonsio: "seadragonsio",
  seasdradonsio: "seadragonsio"
};

function getTierLookupKey(name){
  const normalized = normalizeName(name);
  return TIER_NAME_ALIASES[normalized] || normalized;
}

const USER_TIER_LOOKUP = Object.entries(USER_TIER_INPUT).reduce((lookup, [tier, names])=>{
  names.forEach(name=>{
    lookup[getTierLookupKey(name)] = tier;
  });
  return lookup;
}, {});

function getTierForGameName(name){
  return USER_TIER_LOOKUP[getTierLookupKey(name)] || "";
}

function getIconCandidates(name){
  const n = name.trim();
  return [`${n}.jpg`];
}

function getLocalImagePath(name){
  return getIconCandidates(name)[0];
}

function attachImageFallback(imgEl, candidates){
  if(!imgEl || !candidates || !candidates.length) return;
  let index = 0;
  imgEl.src = candidates[index];
  imgEl.onerror = ()=>{
    index += 1;
    if(index < candidates.length){
      imgEl.src = candidates[index];
    } else {
      imgEl.onerror = null;
    }
  };
}

function getCategoriesFromGenre(genre){
  const g = (genre || "").toLowerCase();
  const categories = [];
  if(g.includes("shoot") || g.includes("fps") || g.includes("battle royale") || g.includes("tank") || g.includes("attack") || g.includes("fighting")) {
    categories.push("shooting");
    categories.push("multiplayer");
  }
  if(g.includes("driving") || g.includes("race") || g.includes("kart")) categories.push("driving");
  if(g.includes("multiplayer") || g.includes("battle") || g.includes("territory") || g.includes("quiz") || g.includes("snake") || g.includes("io")) categories.push("multiplayer");
  if(g.includes("single") || g.includes("puzzle") || g.includes("farming") || g.includes("sandbox") || g.includes("maze")) categories.push("singleplayer");
  if(categories.length === 0) categories.push("singleplayer");
  return [...new Set(categories)];
}

function buildKeywords(name, genre){
  const g = (genre || "").toLowerCase();
  const keywords = [name.toLowerCase(), g, "online game", "io game"];
  if(g.includes("attack") || g.includes("battle") || g.includes("fighting")) keywords.push("attacking game", "attack each other", "dual player game", "pvp game");
  if(g.includes("snake")) keywords.push("snake game", "eat and grow");
  if(g.includes("territory")) keywords.push("capture area", "territory capture");
  if(g.includes("survival")) keywords.push("surviving game", "survival challenge");
  if(g.includes("shooter") || g.includes("fps")) keywords.push("gun game", "shooting game");
  return [...new Set(keywords)];
}

const GAME_LIBRARY = RAW_GAMES.reduce((list, raw)=>{
  const normalized = normalizeName(raw.name);
  if(list.some(game=>normalizeName(game.name) === normalized)) return list;

  const genre = (raw.genre || "Action game").trim();
  list.push({
    name: raw.name.trim(),
    url: (raw.url || "").trim(),
    desc: `${genre}. ${raw.name.trim()} is an online game where players enjoy ${genre.toLowerCase()} gameplay.`,
    keywords: buildKeywords(raw.name.trim(), genre),
    icon: getLocalImagePath(raw.name.trim()),
    iconCandidates: getIconCandidates(raw.name.trim()),
    categories: getCategoriesFromGenre(genre),
    desktopOnly: Boolean(raw.desktopOnly),
    tier: getTierForGameName(raw.name)
  });
  return list;
}, []);
const IS_DESKTOP_DEVICE = window.matchMedia("(min-width: 1025px)").matches;
const TIER_RANK = { s: 0, a: 1, b: 2, c: 3 };
const DAILY_VISITS_STORAGE_KEY = "dailyGameVisitsV1";

function getTodayKey(){
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function readDailyVisits(){
  try {
    const raw = localStorage.getItem(DAILY_VISITS_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function getTodayVisitCount(gameName){
  const visits = readDailyVisits();
  const today = visits[getTodayKey()] || {};
  return today[normalizeName(gameName)] || 0;
}

function recordGameVisit(gameName){
  const visits = readDailyVisits();
  const todayKey = getTodayKey();
  const today = visits[todayKey] || {};
  const key = normalizeName(gameName);
  today[key] = (today[key] || 0) + 1;
  visits[todayKey] = today;

  // Keep only recent dates to avoid unbounded localStorage growth.
  const keepDates = Object.keys(visits).sort().slice(-30);
  const compacted = {};
  keepDates.forEach(dateKey=>{
    compacted[dateKey] = visits[dateKey];
  });
  localStorage.setItem(DAILY_VISITS_STORAGE_KEY, JSON.stringify(compacted));
}

function getAvailableGames(){
  return GAME_LIBRARY
    .map((game, index)=>({ game, index }))
    .filter(({ game })=>IS_DESKTOP_DEVICE || !game.desktopOnly)
    .sort((left, right)=>{
      const leftRank = Object.prototype.hasOwnProperty.call(TIER_RANK, left.game.tier) ? TIER_RANK[left.game.tier] : 999;
      const rightRank = Object.prototype.hasOwnProperty.call(TIER_RANK, right.game.tier) ? TIER_RANK[right.game.tier] : 999;
      if(leftRank !== rightRank) return leftRank - rightRank;

      const leftVisits = getTodayVisitCount(left.game.name);
      const rightVisits = getTodayVisitCount(right.game.name);
      if(leftVisits !== rightVisits) return rightVisits - leftVisits;

      return left.index - right.index;
    })
    .map(({ game })=>game);
}
let selectedCategory = "all";
function normalizeName(value){
  return value.toLowerCase().replace(/[^a-z0-9]/g,"");
}
function getGameByName(name){
  const normalized = normalizeName(name);
  return getAvailableGames().find(game=>normalizeName(game.name) === normalized);
}
function openGame(name,url,desc,icon){
  recordGameVisit(name);
  const matched = getGameByName(name);
  localStorage.setItem("selectedGame", JSON.stringify({
    name,
    url,
    desc,
    icon,
    iconCandidates: matched?.iconCandidates || [icon]
  }));
  window.location.href="game.html";
}
function openGameByName(name){
  const game = getGameByName(name);
  if(!game) return;
  openGame(game.name, game.url, game.desc, game.icon);
}

function renderHomeGames(){
  const grid = document.getElementById("homeGamesGrid");
  if(!grid) return;
  grid.innerHTML = "";
  getAvailableGames().forEach(game=>{
    const card = document.createElement("div");
    card.className = "game-card";
    card.dataset.name = game.name;
    card.innerHTML = `<img alt="${game.name}"><p>${game.name}</p>`;
    const img = card.querySelector("img");
    attachImageFallback(img, game.iconCandidates);
    card.onclick = ()=> openGameByName(game.name);
    grid.appendChild(card);
  });
}

function renderTopGames(){
  const row = document.getElementById("topGamesRow");
  if(!row) return;
  row.innerHTML = "";

  const fixedTopGames = [
    "Deadshot",
    "smash karts",
    "Fly Or Die",
    "Swordmasters.io",
    "Lordz",
    "Cryzen",
    "Snowball.io",
    "Fall-io",
    "obby roads",
    "Slow Road"
  ];

  const availableByName = new Map(
    getAvailableGames().map(game=>[normalizeName(game.name), game])
  );

  fixedTopGames
    .map(name=>availableByName.get(normalizeName(name)))
    .filter(Boolean)
    .forEach(game=>{
    const card = document.createElement("article");
    card.className = "top-game-card";
    card.innerHTML = `<img alt="${game.name}"><p>${game.name}</p>`;
    const img = card.querySelector("img");
    attachImageFallback(img, game.iconCandidates);
    card.onclick = ()=> openGameByName(game.name);
    row.appendChild(card);
    });
}

// Search
function filterGames(){
  const input = document.getElementById("searchInput").value.toLowerCase().trim();
  const results = document.getElementById("searchResults");
  results.innerHTML = "";

  const filteredGames = getAvailableGames().filter(game=>{
    const searchText = `${game.name} ${game.desc} ${(game.keywords || []).join(" ")}`.toLowerCase();
    const matchesName = searchText.includes(input);
    const matchesCategory = selectedCategory === "all" || game.categories.includes(selectedCategory);
    return matchesName && matchesCategory;
  });

  if(filteredGames.length === 0){
    results.innerHTML = `<div class="search-empty">No games found in this category.</div>`;
    return;
  }

  filteredGames.forEach(game=>{
    const card = document.createElement("div");
    card.className = "search-result-card";
    card.innerHTML = `<img alt="${game.name}"><p>${game.name}</p>`;
    const img = card.querySelector("img");
    attachImageFallback(img, game.iconCandidates);
    card.onclick = ()=> openGameByName(game.name);
    results.appendChild(card);
  });
  animateCards("#searchResults .search-result-card");
}

function setSearchCategory(category, buttonEl){
  selectedCategory = category;
  document.querySelectorAll(".category-folder").forEach(btn=>btn.classList.remove("active"));
  if(buttonEl) buttonEl.classList.add("active");
  filterGames();
}

function initStartupLoader(){
  const loader = document.getElementById("startupLoader");
  if(!loader) return;

  setTimeout(()=>{
    loader.classList.add("is-hidden");
    setTimeout(()=>{
      if(loader.parentNode) loader.parentNode.removeChild(loader);
    }, 320);
  }, 1000);
}

function initTopGamesArrows(){
  const row = document.getElementById("topGamesRow");
  const prevBtn = document.getElementById("topGamesPrevBtn");
  const nextBtn = document.getElementById("topGamesNextBtn");
  if(!row || !prevBtn || !nextBtn) return;

  const getScrollStep = ()=>{
    const firstCard = row.querySelector(".top-game-card");
    const cardWidth = firstCard ? firstCard.getBoundingClientRect().width : 160;
    const gap = parseFloat(getComputedStyle(row).columnGap || getComputedStyle(row).gap || "12");
    return Math.max((cardWidth + gap) * 2, 180);
  };

  const updateArrowState = ()=>{
    const maxLeft = Math.max(row.scrollWidth - row.clientWidth, 0);
    prevBtn.disabled = row.scrollLeft <= 2;
    nextBtn.disabled = row.scrollLeft >= (maxLeft - 2);
  };

  prevBtn.addEventListener("click", ()=>{
    row.scrollBy({ left: -getScrollStep(), behavior: "smooth" });
  });

  nextBtn.addEventListener("click", ()=>{
    row.scrollBy({ left: getScrollStep(), behavior: "smooth" });
  });

  row.addEventListener("scroll", updateArrowState);
  window.addEventListener("resize", updateArrowState);
  updateArrowState();
}

// Auto-close sidebar when cursor enters game areas
["home", "searchResults"].forEach(id=>{
  const area = document.getElementById(id);
  if(area){
    area.addEventListener("mouseenter", closeSidebar);
  }
});

if(document.getElementById("searchInput")){
  filterGames();
}

renderHomeGames();
renderTopGames();
initTopGamesArrows();
initStartupLoader();
updateThemeButton();
updateFullscreenButton();
document.addEventListener("fullscreenchange", updateFullscreenButton);

// Keep account hours in sync when returning from other pages/tabs
window.addEventListener("focus", updateAuthUI);
document.addEventListener("visibilitychange", ()=>{
  if(!document.hidden) updateAuthUI();
});

function animateCards(selector){
  const cards = document.querySelectorAll(selector);
  cards.forEach((card, index)=>{
    card.classList.add("reveal-card");
    card.style.animationDelay = `${Math.min(index * 40, 320)}ms`;
  });
}

animateCards("#home .game-card, #home .top-game-card");


