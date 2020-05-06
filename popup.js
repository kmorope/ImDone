chrome.runtime.onInstalled.addListener(() => {
  let baseData = [
    "stackoverflow",
    "github",
    "dev.to",
    "codepen",
    "w3schools",
    "mdn",
  ];
  let defaultConfig = {
    whiteList: true,
    storeSessions: true,
  };
  let historicalModel = {
    sessions: [],
  };

  window.localStorage.setItem("configuration", JSON.stringify(defaultConfig));
  window.localStorage.setItem("whiteList", baseData.join(","));
  window.localStorage.setItem("historical", JSON.stringify(historicalModel));
});

document.addEventListener("DOMContentLoaded", () => {
  let imDoneBtn = document.querySelector(".done");
  let noBtn = document.querySelector(".cancel");
  let confirmBtn = document.querySelector(".success");
  let settingsBtn = document.querySelector(".settings");
  let historicalBtn = document.querySelector(".historical");
  let historicalCloseBtn = document.querySelector(".close-historical");

  imDoneBtn.addEventListener("click", () => {
    toggleConfirm();
  });

  confirmBtn.addEventListener("click", () => {
    doIt();
  });

  noBtn.addEventListener("click", () => {
    cancel();
  });

  historicalBtn.addEventListener("click", () => {
    toggleHistorical();
  });

  historicalCloseBtn.addEventListener("click", () => {
    toggleHistorical();
  });

  let historical = loadHistoricalData();
  if (historical.session.length > 0) {
    historical.session.forEach((sessionElement) => {
      createHistoricalItem(sessionElement.tabs, sessionElement.createdAt);
    });
  }
});

function toggleHistorical() {
  document.querySelector(".disclaimer").classList.toggle("hidden");
  document.querySelector(".done").classList.toggle("hidden");
  document.querySelector(".historical-content").classList.toggle("hidden");
}

function toggleConfirm() {
  document.querySelector(".confirm").classList.toggle("hidden");
  document.querySelector(".disclaimer").classList.toggle("hidden");
  document.querySelector(".done").classList.toggle("hidden");
}

function cancel() {
  document.querySelector(".confirm").classList.add("hidden");
  document.querySelector(".disclaimer").classList.remove("hidden");
  document.querySelector(".done").classList.remove("hidden");
}

function doIt() {
  let currentSesion = [];
  let tabsToClose = [];
  chrome.tabs.query({}, (tabs) => {
    var newURL = "http://www.google.com/";
    chrome.tabs.create({ url: newURL });
    tabs.forEach((tb) => {
      currentSesion.push(tb.url);
      tabsToClose.push(tb.id);
    });
    saveSession(currentSesion);
    closeTabs(tabsToClose);
  });
}

function closeTabs(tabsToClose) {
  tabsToClose.forEach((tab) => {
    chrome.tabs.remove(tab);
  });
}

function saveSession(currentSesion) {
  let session = {
    tabs: currentSesion,
    createdAt: new Date(),
  };
  let historical = loadHistoricalData();
  historical.session.push(session);
  saveHistoricalData(historical);
}

function loadHistoricalData() {
  let historical = window.localStorage.getItem("historical");
  if (typeof historical !== "undefined" && historical !== null) {
    return JSON.parse(historical);
  } else {
    let historicalModel = {
      session: [],
    };
    window.localStorage.setItem("historical", JSON.stringify(historicalModel));
    return historicalModel;
  }
}

function saveHistoricalData(historical) {
  let historicalData = window.localStorage.getItem("historical");
  if (typeof historicalData !== "undefined" && historicalData !== null) {
    window.localStorage.removeItem("historical");
  }
  window.localStorage.setItem("historical", JSON.stringify(historical));
}

function createHistoricalItem(tabs, date) {
  let historicalList = document.querySelector(".historical-list");
  let container = document.createElement("div");
  let content = document.createElement("div");
  let checkBox = document.createElement("input");
  let label = document.createElement("label");
  let tabContent = document.createElement("div");
  let items = document.createElement("div");

  tabs.forEach((tab) => {
    let tabAnchor = document.createElement("a");
    tabAnchor.href = tab;
    tabAnchor.innerText = tab;
    tabAnchor.title = tab;
    items.appendChild(tabAnchor);
  });

  container.classList.add("tabs");
  content.classList.add("tab");
  checkBox.type = "checkbox";
  let chkId = uuidv4();
  checkBox.id = chkId;
  label.classList.add("tab-label");
  label.htmlFor = chkId;
  label.innerText = formatDate(new Date(date));
  tabContent.classList.add("tab-content");
  items.classList.add("items");

  tabContent.appendChild(items);
  content.appendChild(checkBox);
  content.appendChild(label);
  content.appendChild(tabContent);

  container.appendChild(content);
  historicalList.appendChild(container);
}

function uuidv4() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function formatDate(date) {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return `${
    months[date.getMonth()]
  } ${date.getDate()}, ${date.getFullYear()} - ${date.getHours()}:${date.getMinutes()}`;
}

function restoreSession(tabs) {
  tabs.forEach((tab) => {
    chrome.tabs.create({ url: tab });
  });
}
