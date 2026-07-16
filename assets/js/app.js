/* JSCCB ????? v4
 * ??:??/??/???/???(??????)
 * ??????? localStorage ? `jsccb:applications`
 */
(function () {
  "use strict";

  var STORE_KEY = "jsccb:applications";
  var $ = function (id) { return document.getElementById(id); };

  // ???? - ????????????????
  var CARDS = [
    { id: "puka", tier: "??", cls: "tier-puka", name: "???????????",
      img: "assets/images/card_puka.png",
      fee: "200?/?", feeNote: "??5??????", limit: "3?-1?",
      benefits: ["?????", "???????", "????1%??"],
      minLimit: 3000, maxLimit: 10000 },
    { id: "jinka", tier: "??", cls: "tier-jinka", name: "????????",
      img: "assets/images/card_jinka.png",
      fee: "500?/?", feeNote: "??7??????", limit: "1?-3?",
      benefits: ["?????", "12306????", "??????"],
      minLimit: 10000, maxLimit: 30000 },
    { id: "baijin", tier: "???", cls: "tier-baijin", name: "????????",
      img: "assets/images/card_baijin.png",
      fee: "1000?/?", feeNote: "??12??????", limit: "3?-6?",
      benefits: ["?????", "?????", "??????"],
      minLimit: 30000, maxLimit: 60000 },
    { id: "zuanshi", tier: "???", cls: "tier-zuanshi", name: "??????????",
      img: "assets/images/card_zuanshi.png",
      fee: "2000?/?", feeNote: "??20??????", limit: "6?-10?",
      benefits: ["?????", "??????", "?????"],
      minLimit: 60000, maxLimit: 100000 }
  ];

  // ??????????????
  window.JSCCB_CARDS = CARDS;
  window.JSCCB_genApprovedLimit = function (cardId) {
    var c = CARDS.filter(function (x) { return x.id === cardId; })[0];
    if (!c) return 0;
    var ranges = Math.floor((c.maxLimit - c.minLimit) / 1000);
    var step = Math.floor(Math.random() * (ranges + 1));
    return c.minLimit + step * 1000;
  };

  var currentCard = null;
  var sentCode = null;

  function load() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY)) || []; }
    catch (e) { return []; }
  }
  function save(list) { localStorage.setItem(STORE_KEY, JSON.stringify(list)); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function genNo() {
    var d = new Date();
    var p = "" + d.getFullYear() + String(d.getMonth() + 1).padStart(2, "0") + String(d.getDate()).padStart(2, "0");
    var r = String(Math.floor(Math.random() * 9000) + 1000);
    return "CC" + p + r;
  }

  // ????
  function showView(v) {
    ["home", "apply", "progress"].forEach(function (n) {
      $("view-" + n).classList.toggle("hidden", n !== v);
    });
    Array.prototype.forEach.call(document.querySelectorAll(".nav-btn"), function (b) {
      b.classList.toggle("active", b.getAttribute("data-view") === v);
    });
  }
  Array.prototype.forEach.call(document.querySelectorAll(".nav-btn"), function (b) {
    b.addEventListener("click", function () { showView(b.getAttribute("data-view")); });
  });

  // ???? - ?????
  function renderCards() {
    var box = $("card-list");
    box.innerHTML = "";
    CARDS.forEach(function (c) {
      var div = document.createElement("div");
      div.className = "cc-card";
      div.innerHTML =
        '<div class="cc-img-wrap"><img src="' + c.img + '" alt="' + esc(c.name) + '" class="cc-img"/></div>' +
        '<div class="cc-hot">HOT</div>' +
        '<div class="cc-benefits">' + c.benefits.map(function(b){ return '<span>'+esc(b)+'</span>'; }).join('') + '</div>' +
        '<button class="cc-apply-btn" data-id="' + c.id + '">????</button>' +
        '<div class="cc-dots"><span class="active"></span><span></span><span></span><span></span></div>' +
        '<div class="cc-more">????</div>';
      box.appendChild(div);
    });
    // ??????
    Array.prototype.forEach.call(box.querySelectorAll(".cc-apply-btn"), function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        var cardId = btn.getAttribute("data-id");
        startApply(cardId);
      });
    });
  }

  // ????
  function startApply(id) {
    currentCard = CARDS.filter(function (c) { return c.id === id; })[0];
    if (!currentCard) {
      console.error("Card not found:", id);
      return;
    }
    // ??????
    var p = $("apply-card");
    if (!p) {
      console.error("apply-card element not found");
      return;
    }
    p.innerHTML = '<img src="' + currentCard.img + '" class="apply-card-img"/><div class="apply-card-info"><div class="apply-tier">' + esc(currentCard.tier) + '</div><div class="apply-name">' + esc(currentCard.name) + '</div></div>';
    
    // ????
    $("form-step1").reset(); 
    $("form-step2").reset();
    $("form-step3").classList.add("hidden");
    $("apply-done").classList.add("hidden");
    
    gotoStep(1);
    showView("apply");
    window.scrollTo(0, 0);
  }

  function gotoStep(n) {
    [1, 2, 3].forEach(function (i) {
      var el = $("form-step" + i);
      if (el) el.classList.toggle("hidden", i !== n);
    });
    // ?????
    var steps = document.querySelectorAll(".step");
    steps.forEach(function(s, idx) {
      s.classList.toggle("active", idx < n);
      s.classList.toggle("current", idx === n - 1);
    });
    // ?????
    var progress = document.querySelector(".step-progress-bar");
    if (progress) {
      progress.style.width = (n === 1 ? 50 : n === 2 ? 80 : 100) + "%";
    }
  }

  function val(form, name) { return (form[name] && form[name].value) || ""; }

  function buildReview() {
    var f1 = $("form-step1"), f2 = $("form-step2");
    var rows = [
      ["????", currentCard.tier + " " + currentCard.name],
      ["??", val(f1, "name")],
      ["????", val(f1, "nameEn")],
      ["????", val(f1, "idno")],
      ["???", val(f1, "phone")],
      ["??", val(f2, "edu")],
      ["????", val(f2, "employ")],
      ["????", val(f2, "company")],
      ["??", val(f2, "occupation")],
      ["????", val(f2, "marry")],
      ["???", val(f2, "income") + "??"],
      ["????", val(f2, "companyAddr")],
      ["????", val(f2, "homeAddr")],
      ["????", val(f2, "mailAddr") === "company" ? "????" : val(f2, "mailAddr") === "home" ? "????" : "??"],
      ["??", val(f2, "zip")],
      ["??", val(f2, "email")],
      ["????", val(f2, "kinName") + " / " + val(f2, "kinRel") + " / " + val(f2, "kinPhone")]
    ];
    $("review").innerHTML = rows.map(function (r) {
      return '<div class="r-row"><span class="r-label">' + esc(r[0]) + '</span><span class="r-val">' + esc(r[1] || "-") + "</span></div>";
    }).join("");
  }

  // ??
  function setupSubmit() {
    var f3 = $("form-step3");
    if (!f3) return;
    var btn = f3.querySelector(".submit-btn");
    if (!btn) return;
    btn.addEventListener("click", function () {
      var f1 = $("form-step1"), f2 = $("form-step2");
      var app = {
        no: genNo(),
        cardId: currentCard.id,
        cardTier: currentCard.tier,
        cardName: currentCard.name,
        name: val(f1, "name"),
        nameEn: val(f1, "nameEn"),
        idno: val(f1, "idno"),
        phone: val(f1, "phone"),
        edu: val(f2, "edu"),
        employ: val(f2, "employ"),
        company: val(f2, "company"),
        occupation: val(f2, "occupation"),
        marry: val(f2, "marry"),
        income: val(f2, "income"),
        companyAddr: val(f2, "companyAddr"),
        homeAddr: val(f2, "homeAddr"),
        mailAddr: val(f2, "mailAddr"),
        zip: val(f2, "zip"),
        email: val(f2, "email"),
        kinName: val(f2, "kinName"),
        kinRel: val(f2, "kinRel"),
        kinPhone: val(f2, "kinPhone"),
        status: "pending",
        approvedAmount: 0,
        createdAt: new Date().toISOString()
      };
      var list = load();
      list.push(app);
      save(list);
      $("done-no").textContent = app.no;
      [1, 2, 3].forEach(function (i) { 
        var el = $("form-step" + i);
        if (el) el.classList.add("hidden");
      });
      $("apply-done").classList.remove("hidden");
      window.scrollTo(0, 0);
    });
  }

  var doneBack = $("done-back");
  if (doneBack) {
    doneBack.addEventListener("click", function () {
      $("apply-done").classList.add("hidden");
      showView("home");
    });
  }

  // ???(??)
  var codeBtn = $("code-btn");
  if (codeBtn) {
    codeBtn.addEventListener("click", function () {
      var phone = $("form-step1").phone.value;
      if (!/^\d{11}$/.test(phone)) { alert("?????? 11 ????"); return; }
      sentCode = String(Math.floor(Math.random() * 900000) + 100000);
      alert("??????(??):" + sentCode);
      var btn = $("code-btn"), n = 60;
      btn.disabled = true;
      var timer = setInterval(function () {
        n--; btn.textContent = n + "s";
        if (n <= 0) { clearInterval(timer); btn.disabled = false; btn.textContent = "?????"; }
      }, 1000);
    });
  }

  // ??1 -> 2
  function setupStep1Next() {
    var f = $("form-step1");
    if (!f) return;
    var btn = f.querySelector(".next-btn");
    if (!btn) return;
    btn.addEventListener("click", function () {
      if (!f.name.value || !f.nameEn.value || !f.idno.value || !f.phone.value || !f.code.value) {
        alert("?????????"); return;
      }
      if (!/^\d{17}[\dxX]$/.test(f.idno.value)) { alert("?????????"); return; }
      if (!/^\d{6}$/.test(f.code.value) || f.code.value !== sentCode) { alert("?????"); return; }
      // ????
      var agrees = f.querySelectorAll('input[name="agree[]"]:checked');
      if (agrees.length < 3) { alert("??????????"); return; }
      gotoStep(2);
      window.scrollTo(0, 0);
    });
  }

  // ??2 -> 3
  function setupStep2Next() {
    var f = $("form-step2");
    if (!f) return;
    var btn = f.querySelector(".next-btn2");
    if (!btn) return;
    btn.addEventListener("click", function () {
      buildReview();
      gotoStep(3);
      window.scrollTo(0, 0);
    });
  }

  // ????
  var prevBtn = document.querySelector(".prev-btn");
  if (prevBtn) prevBtn.addEventListener("click", function () { gotoStep(1); });
  
  var prevBtn2 = document.querySelector(".prev-btn2");
  if (prevBtn2) prevBtn2.addEventListener("click", function () { gotoStep(2); });

  // ????
  var qBtn = $("q-btn");
  if (qBtn) {
    qBtn.addEventListener("click", function () {
      var q = $("q-input").value.trim().toLowerCase();
      if (!q) { alert("???????"); return; }
      var list = load().filter(function (a) {
        return (a.no || "").toLowerCase() === q ||
               (a.idno || "").toLowerCase() === q ||
               (a.phone || "").toLowerCase() === q;
      });
      var box = $("q-result");
      if (!list.length) { box.innerHTML = '<p class="q-empty">???????</p>'; return; }
      box.innerHTML = list.map(function (a) {
        var st = { pending: "???", approved: "???", rejected: "???" }[a.status] || "???";
        var cls = a.status === "approved" ? "approved" : a.status === "rejected" ? "rejected" : "pending";
        var limitStr = a.approvedAmount ? "????:" + a.approvedAmount + "?" : "";
        return '<div class="q-item"><div class="q-head"><span class="q-name">' + esc(a.cardName) +
          '</span><span class="q-status ' + cls + '">' + st + "</span></div>" +
          '<div class="q-row">????:' + esc(a.no) + "</div>" +
          '<div class="q-row">???:' + esc(a.name) + " / " + esc(a.idno) + "</div>" +
          (limitStr ? '<div class="q-row">' + limitStr + "</div>" : "") +
          '<div class="q-row">????:' + esc(a.createdAt) + "</div></div>";
      }).join("");
    });
  }

  // ?? service worker
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("sw.js").catch(function () {});
    });
  }

  // ???
  function init() {
    renderCards();
    setupStep1Next();
    setupStep2Next();
    setupSubmit();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
