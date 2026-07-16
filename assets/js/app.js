/* JSCCB 信用卡办理
 * 申请数据保存在 localStorage 键 `jsccb:applications`，可被同域下的 JSCCB工作台「信用卡审核」读取。
 * 卡种对应：A1=普卡, B2=金卡, C3=白金卡, D4=钻石卡；办卡流程 G6=身份信息步, H7=资料填写步。
 */
(function () {
  "use strict";

  var STORE_KEY = "jsccb:applications";
  var $ = function (id) { return document.getElementById(id); };

  // 卡种目录（参考建行信用卡视觉：欢享/千里行/正青春/生活卡PLUS）
  var CARDS = [
    { id: "puka", tier: "A1 · 普卡", cls: "tier-puka", icon: "🐴", name: "龙卡欢享信用卡银联版",
      no: "6217 **** **** 1001", fee: "免年费", limit: "5千-3万",
      benefits: ["新户办卡礼", "笔笔随机返现", "迎新享好礼"] },
    { id: "jinka", tier: "B2 · 金卡", cls: "tier-jinka", icon: "🌾", name: "龙卡千里行信用卡",
      no: "6217 **** **** 2002", fee: "刷免", limit: "1万-5万",
      benefits: ["12306 出行购票", "公共事业缴费", "加油返现"] },
    { id: "baijin", tier: "C3 · 白金卡", cls: "tier-baijin", icon: "🔥", name: "龙卡正青春信用卡数字版",
      no: "6227 **** **** 3003", fee: "580元/年", limit: "5万-20万",
      benefits: ["新户办卡礼", "云闪付消费立减", "境外笔笔1%返现"] },
    { id: "zuanshi", tier: "D4 · 钻石卡", cls: "tier-zuanshi", icon: "🐟", name: "建行生活卡PLUS版",
      no: "6227 **** **** 4004", fee: "1800元/年", limit: "20万-100万",
      benefits: ["新户办卡礼", "新户消费礼", "微信支付消费"] }
  ];

  var ADDONS = ["短信提醒", "失卡保障", "航空意外险", "机场贵宾厅", "道路救援"];

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

  // 视图切换
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

  // 渲染卡片
  function renderCards() {
    var box = $("card-list");
    box.innerHTML = "";
    CARDS.forEach(function (c) {
      var div = document.createElement("div");
      div.className = "cc-card " + c.cls;
      div.innerHTML =
        '<div class="cc-icon">' + c.icon + "</div>" +
        '<div><div class="tier">' + esc(c.tier) + "</div>" +
        '<div class="cc-name">' + esc(c.name) + "</div></div>" +
        '<div class="cc-chip"></div>' +
        '<div class="cc-no">' + esc(c.no) + "</div>" +
        '<div class="cc-meta"><span>年费 ' + esc(c.fee) + "</span><span>额度 " + esc(c.limit) + "</span></div>" +
        '<div class="cc-benefits">' + c.benefits.map(esc).join(" · ") + "</div>" +
        '<button class="cc-apply-btn" data-id="' + c.id + '">立即申请</button>';
      box.appendChild(div);
    });
    Array.prototype.forEach.call(box.querySelectorAll(".cc-apply-btn"), function (btn) {
      btn.addEventListener("click", function () { startApply(btn.getAttribute("data-id")); });
    });
  }

  // 增值服务
  function renderAddons() {
    var box = $("addon-checks");
    box.innerHTML = "";
    ADDONS.forEach(function (a) {
      var lab = document.createElement("label");
      lab.innerHTML = '<input type="checkbox" name="addon" value="' + esc(a) + '"> ' + esc(a);
      box.appendChild(lab);
    });
  }

  // 开始申请
  function startApply(id) {
    currentCard = CARDS.filter(function (c) { return c.id === id; })[0];
    var p = $("apply-card-preview");
    p.className = "apply-card-preview " + currentCard.cls;
    p.innerHTML = '<div class="p-tier">' + esc(currentCard.tier) + '</div><div class="p-name">' + esc(currentCard.name) + "</div>";
    $("form-step1").reset(); $("form-step2").reset();
    gotoStep(1);
    showView("apply");
    window.scrollTo(0, 0);
  }

  function gotoStep(n) {
    [1, 2, 3].forEach(function (i) {
      $("form-step" + i).classList.toggle("hidden", i !== n);
    });
    Array.prototype.forEach.call(document.querySelectorAll(".step"), function (s) {
      s.classList.toggle("active", parseInt(s.getAttribute("data-step"), 10) <= n);
    });
  }

  // 步骤1 -> 2
  $("form-step1").querySelector(".next-btn").addEventListener("click", function () {
    var f = $("form-step1");
    if (!f.name.value || !f.nameEn.value || !f.idno.value || !f.phone.value || !f.code.value) {
      alert("请完整填写身份信息"); return;
    }
    if (!/^\d{17}[\dxX]$/.test(f.idno.value)) { alert("身份证号格式不正确"); return; }
    if (!/^\d{6}$/.test(f.code.value) || f.code.value !== sentCode) { alert("验证码错误"); return; }
    if (!f.agree.checked) { alert("请先同意相关协议"); return; }
    gotoStep(2);
    window.scrollTo(0, 0);
  });

  // 步骤2 -> 3
  $("form-step2").querySelector(".next-btn2").addEventListener("click", function () {
    buildReview();
    gotoStep(3);
    window.scrollTo(0, 0);
  });

  // 返回
  document.querySelector(".prev-btn").addEventListener("click", function () { gotoStep(1); });
  document.querySelector(".prev-btn2").addEventListener("click", function () { gotoStep(2); });

  function val(form, name) { return (form[name] && form[name].value) || ""; }

  function buildReview() {
    var f1 = $("form-step1"), f2 = $("form-step2");
    var addons = Array.prototype.map.call(f1.querySelectorAll('input[name=addon]:checked'), function (c) { return c.value; });
    var rows = [
      ["申请卡种", currentCard.tier + " " + currentCard.name],
      ["姓名", val(f1, "name")],
      ["姓名拼音", val(f1, "nameEn")],
      ["身份证号", val(f1, "idno")],
      ["手机号", val(f1, "phone")],
      ["增值服务", addons.join("、") || "无"],
      ["学历", val(f2, "edu")],
      ["在职情况", val(f2, "employ")],
      ["单位全称", val(f2, "company")],
      ["职业", val(f2, "occupation")],
      ["婚姻状况", val(f2, "marry")],
      ["年收入", val(f2, "income")],
      ["单位地址", val(f2, "companyAddr")],
      ["住宅地址", val(f2, "homeAddr")],
      ["寄送地址", val(f2, "mailAddr")],
      ["邮箱", val(f2, "email")],
      ["直系亲属", val(f2, "kinName") + " / " + val(f2, "kinRel") + " / " + val(f2, "kinPhone")]
    ];
    $("review").innerHTML = rows.map(function (r) {
      return '<div class="r-row"><span class="r-label">' + esc(r[0]) + '</span><span class="r-val">' + esc(r[1] || "-") + "</span></div>";
    }).join("");
  }

  // 提交
  $("form-step3").querySelector(".submit-btn").addEventListener("click", function () {
    var f1 = $("form-step1"), f2 = $("form-step2");
    var addons = Array.prototype.map.call(f1.querySelectorAll('input[name=addon]:checked'), function (c) { return c.value; });
    var app = {
      no: genNo(),
      cardTier: currentCard.tier,
      cardName: currentCard.name,
      name: val(f1, "name"),
      nameEn: val(f1, "nameEn"),
      idno: val(f1, "idno"),
      phone: val(f1, "phone"),
      addons: addons,
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
      createdAt: new Date().toISOString()
    };
    var list = load();
    list.push(app);
    save(list);
    $("done-no").textContent = app.no;
    [1, 2, 3].forEach(function (i) { $("form-step" + i).classList.add("hidden"); });
    $("apply-done").classList.remove("hidden");
    window.scrollTo(0, 0);
  });

  $("done-back").addEventListener("click", function () {
    $("apply-done").classList.add("hidden");
    showView("home");
  });

  // 验证码（模拟）
  var codeTimer = null;
  $("code-btn").addEventListener("click", function () {
    var phone = $("form-step1").phone.value;
    if (!/^\d{11}$/.test(phone)) { alert("请输入正确的 11 位手机号"); return; }
    sentCode = String(Math.floor(Math.random() * 900000) + 100000);
    alert("验证码已发送（演示）：" + sentCode);
    var btn = $("code-btn"), n = 60;
    btn.disabled = true;
    codeTimer = setInterval(function () {
      n--; btn.textContent = n + "s";
      if (n <= 0) { clearInterval(codeTimer); btn.disabled = false; btn.textContent = "获取验证码"; }
    }, 1000);
  });

  // 进度查询
  $("q-btn").addEventListener("click", function () {
    var q = $("q-input").value.trim().toLowerCase();
    if (!q) { alert("请输入查询信息"); return; }
    var list = load().filter(function (a) {
      return (a.no || "").toLowerCase() === q ||
             (a.idno || "").toLowerCase() === q ||
             (a.phone || "").toLowerCase() === q;
    });
    var box = $("q-result");
    if (!list.length) { box.innerHTML = '<p class="q-empty">未找到申请记录</p>'; return; }
    box.innerHTML = list.map(function (a) {
      var st = { pending: "待审核", approved: "已通过", rejected: "已拒绝" }[a.status] || "待审核";
      var cls = a.status === "approved" ? "approved" : a.status === "rejected" ? "rejected" : "pending";
      return '<div class="q-item"><div class="q-head"><span class="q-name">' + esc(a.cardName) +
        '</span><span class="q-status ' + cls + '">' + st + "</span></div>" +
        '<div class="q-row">申请编号：' + esc(a.no) + "</div>" +
        '<div class="q-row">申请人：' + esc(a.name) + " / " + esc(a.idno) + "</div>" +
        '<div class="q-row">提交时间：' + esc(a.createdAt) + "</div></div>";
    }).join("");
  });

  // 注册 service worker
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("sw.js").catch(function () {});
    });
  }

  renderCards();
  renderAddons();
})();
