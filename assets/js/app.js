/* JSCCB 信用卡办理 v5
 * 卡种：普卡/金卡/白金卡/钻石卡（Tab 切换展示）
 * 申请数据保存在 localStorage 键 `jsccb:applications`
 */
(function () {
  "use strict";

  var STORE_KEY = "jsccb:applications";
  var $ = function (id) { return document.getElementById(id); };

  // 卡种目录 - 按普卡→金卡→白金卡→钻石卡排序
  var CARDS = [
    { id: "puka", tier: "普卡", cls: "tier-puka", name: "龙卡正青春信用卡数字版",
      img: "assets/images/card_puka.png",
      fee: "200元/年", feeNote: "消费5笔免次年年费", limit: "3千-1万",
      benefits: ["新户办卡礼", "云闪付消费立减", "境外笔笔1%返现"],
      minLimit: 3000, maxLimit: 10000 },
    { id: "jinka", tier: "金卡", cls: "tier-jinka", name: "龙卡千里行信用卡",
      img: "assets/images/card_jinka.png",
      fee: "500元/年", feeNote: "消费7笔免次年年费", limit: "1万-3万",
      benefits: ["新户办卡礼", "12306出行购票", "公共事业缴费"],
      minLimit: 10000, maxLimit: 30000 },
    { id: "baijin", tier: "白金卡", cls: "tier-baijin", name: "建行生活卡银联版",
      img: "assets/images/card_baijin.png",
      fee: "1000元/年", feeNote: "消费12笔免次年年费", limit: "3万-6万",
      benefits: ["新户办卡礼", "新户消费礼", "微信支付消费"],
      minLimit: 30000, maxLimit: 60000 },
    { id: "zuanshi", tier: "钻石卡", cls: "tier-zuanshi", name: "龙卡欢享信用卡银联版",
      img: "assets/images/card_zuanshi.png",
      fee: "2000元/年", feeNote: "消费20笔免次年年费", limit: "6万-10万",
      benefits: ["新户办卡礼", "笔笔随机返现", "迎新享好礼"],
      minLimit: 60000, maxLimit: 100000 }
  ];

  // 供工作台审核时调用的全局函数
  window.JSCCB_CARDS = CARDS;
  window.JSCCB_genApprovedLimit = function (cardId) {
    var c = CARDS.filter(function (x) { return x.id === cardId; })[0];
    if (!c) return 0;
    var ranges = Math.floor((c.maxLimit - c.minLimit) / 1000);
    var step = Math.floor(Math.random() * (ranges + 1));
    return c.minLimit + step * 1000;
  };

  var currentCard = null;
  var currentCardId = "puka"; // 默认选中普卡

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

  // 渲染卡片 Tab 切换
  function renderCardDisplay() {
    var card = CARDS.filter(function (c) { return c.id === currentCardId; })[0];
    if (!card) return;
    
    // 更新卡片展示
    var display = $("card-display");
    display.innerHTML = 
      '<div class="card-showcase">' +
        '<img src="' + card.img + '" alt="' + esc(card.name) + '" class="card-showcase-img"/>' +
        '<div class="card-showcase-info">' +
          '<h2 class="card-showcase-name">' + esc(card.name) + '</h2>' +
          '<p class="card-showcase-fee">' + esc(card.fee) + '，' + esc(card.feeNote) + '</p>' +
          '<p class="card-showcase-tags">中国银联 | ' + esc(card.tier) + ' | 磁条+IC+非接触</p>' +
        '</div>' +
      '</div>';
    
    // 更新权益列表
    var benefitsList = $("benefits-list");
    benefitsList.innerHTML = card.benefits.map(function(b) { 
      return '<li>' + esc(b) + '</li>'; 
    }).join('');
  }

  // Tab 切换
  function setupTabs() {
    var tabs = document.querySelectorAll(".card-tab");
    tabs.forEach(function(tab) {
      tab.addEventListener("click", function() {
        var cardId = tab.getAttribute("data-card");
        currentCardId = cardId;
        
        // 更新 Tab 样式
        tabs.forEach(function(t) { t.classList.remove("active"); });
        tab.classList.add("active");
        
        // 重新渲染
        renderCardDisplay();
      });
    });
  }

  // 开始申请
  function startApply(id) {
    currentCard = CARDS.filter(function (c) { return c.id === id; })[0];
    if (!currentCard) {
      console.error("Card not found:", id);
      return;
    }
    // 显示预览卡片
    var p = $("apply-card");
    if (!p) {
      console.error("apply-card element not found");
      return;
    }
    p.innerHTML = '<img src="' + currentCard.img + '" class="apply-card-img"/><div class="apply-card-info"><div class="apply-tier">' + esc(currentCard.tier) + '</div><div class="apply-name">' + esc(currentCard.name) + '</div></div>';
    
    // 显示年费介绍
    var feeContent = $("fee-content");
    if (feeContent) {
      feeContent.innerHTML = 
        '<p class="fee-line"><strong>' + esc(currentCard.fee) + '</strong></p>' +
        '<p class="fee-note">' + esc(currentCard.feeNote) + '</p>';
    }
    
    // 重置表单
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
    // 更新步骤条
    var steps = document.querySelectorAll(".step-labels .step");
    steps.forEach(function(s, idx) {
      s.classList.toggle("active", idx < n);
      s.classList.toggle("current", idx === n - 1);
    });
    // 更新进度条
    var progress = document.querySelector(".step-progress-bar");
    if (progress) {
      progress.style.width = (n === 1 ? 50 : n === 2 ? 80 : 100) + "%";
    }
    // 更新步骤数字
    var stepCurrent = document.querySelector(".step-current");
    if (stepCurrent) stepCurrent.textContent = n;
  }

  function val(form, name) { return (form[name] && form[name].value) || ""; }

  function buildReview() {
    var f1 = $("form-step1"), f2 = $("form-step2");
    var rows = [
      ["申请卡种", currentCard.tier + " " + currentCard.name],
      ["姓名", val(f1, "name")],
      ["身份证号", val(f1, "idno")],
      ["手机号", val(f1, "phone")],
      ["学历", val(f2, "edu")],
      ["在职情况", val(f2, "employ")],
      ["单位全称", val(f2, "company")],
      ["职业", val(f2, "occupation")],
      ["婚姻状况", val(f2, "marry")],
      ["年收入", val(f2, "income") + "万元"],
      ["单位地址", val(f2, "companyAddr")],
      ["住宅地址", val(f2, "homeAddr")],
      ["寄送地址", val(f2, "mailAddr") === "company" ? "单位地址" : val(f2, "mailAddr") === "home" ? "住宅地址" : "其他"],
      ["邮编", val(f2, "zip")],
      ["邮箱", val(f2, "email")],
      ["直系亲属", val(f2, "kinName") + " / " + val(f2, "kinRel") + " / " + val(f2, "kinPhone")]
    ];
    $("review").innerHTML = rows.map(function (r) {
      return '<div class="r-row"><span class="r-label">' + esc(r[0]) + '</span><span class="r-val">' + esc(r[1] || "-") + "</span></div>";
    }).join("");
  }

  // 提交
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

  // 验证码（模拟）- 不弹窗，任意输入都通过
  var codeBtn = $("code-btn");
  if (codeBtn) {
    codeBtn.addEventListener("click", function () {
      var phone = $("form-step1").phone.value;
      if (!/^\d{11}$/.test(phone)) { alert("请输入正确的 11 位手机号"); return; }
      // 不弹窗显示验证码
      var btn = $("code-btn"), n = 60;
      btn.disabled = true;
      var timer = setInterval(function () {
        n--; btn.textContent = n + "s";
        if (n <= 0) { clearInterval(timer); btn.disabled = false; btn.textContent = "获取验证码"; }
      }, 1000);
    });
  }

  // 一键勾选
  function setupAgreeAll() {
    var agreeAll = document.querySelector("#agree-all input");
    var agrees = document.querySelectorAll('input[name="agree[]"]');
    
    if (agreeAll) {
      agreeAll.addEventListener("change", function() {
        var checked = agreeAll.checked;
        agrees.forEach(function(cb) { cb.checked = checked; });
      });
    }
  }

  // 联系方式单选
  function setupContactGroup() {
    var group = document.querySelector(".contact-group");
    if (!group) return;
    var chips = group.querySelectorAll(".chip");
    chips.forEach(function(chip) {
      chip.addEventListener("click", function() {
        chips.forEach(function(c) { c.classList.remove("active"); });
        chip.classList.add("active");
        var input = chip.querySelector("input");
        if (input) input.checked = true;
      });
    });
  }

  // 寄送地址单选
  function setupMailGroup() {
    var group = document.querySelector(".mail-group");
    if (!group) return;
    var chips = group.querySelectorAll(".chip");
    chips.forEach(function(chip) {
      chip.addEventListener("click", function() {
        chips.forEach(function(c) { c.classList.remove("active"); });
        chip.classList.add("active");
        var input = chip.querySelector("input");
        if (input) input.checked = true;
      });
    });
  }

  // 步骤1 -> 2
  function setupStep1Next() {
    var f = $("form-step1");
    if (!f) return;
    var btn = f.querySelector(".next-btn");
    if (!btn) return;
    btn.addEventListener("click", function () {
      if (!f.name.value || !f.idno.value || !f.phone.value || !f.code.value) {
        alert("请完整填写身份信息"); return;
      }
      if (!/^\d{17}[\dxX]$/.test(f.idno.value)) { alert("身份证号格式不正确"); return; }
      // 验证码任意输入都通过
      // 检查协议
      var agrees = f.querySelectorAll('input[name="agree[]"]:checked');
      if (agrees.length < 3) { alert("请阅读并同意全部协议"); return; }
      gotoStep(2);
      window.scrollTo(0, 0);
    });
  }

  // 步骤2 -> 3
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

  // 返回按钮
  var prevBtn = document.querySelector(".prev-btn");
  if (prevBtn) prevBtn.addEventListener("click", function () { gotoStep(1); });
  
  var prevBtn2 = document.querySelector(".prev-btn2");
  if (prevBtn2) prevBtn2.addEventListener("click", function () { gotoStep(2); });

  // 进度查询
  var qBtn = $("q-btn");
  if (qBtn) {
    qBtn.addEventListener("click", function () {
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
        var limitStr = a.approvedAmount ? "初审额度：" + a.approvedAmount + "元" : "";
        return '<div class="q-item"><div class="q-head"><span class="q-name">' + esc(a.cardName) +
          '</span><span class="q-status ' + cls + '">' + st + "</span></div>" +
          '<div class="q-row">申请编号：' + esc(a.no) + "</div>" +
          '<div class="q-row">申请人：' + esc(a.name) + " / " + esc(a.idno) + "</div>" +
          (limitStr ? '<div class="q-row">' + limitStr + "</div>" : "") +
          '<div class="q-row">提交时间：' + esc(a.createdAt) + "</div></div>";
      }).join("");
    });
  }

  // 注册 service worker
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("sw.js").catch(function () {});
    });
  }

  // 初始化
  function init() {
    renderCardDisplay();
    setupTabs();
    setupAgreeAll();
    setupContactGroup();
    setupMailGroup();
    setupStep1Next();
    setupStep2Next();
    setupSubmit();
    
    // 绑定申请按钮
    var applyBtn = $("apply-btn");
    if (applyBtn) {
      applyBtn.addEventListener("click", function() {
        startApply(currentCardId);
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
