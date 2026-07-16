/* JSCCB 信用卡办理 v6
 * 卡种：普卡/金卡/白金卡/钻石卡（Tab 切换展示）
 * 申请数据保存在 localStorage 键 `jsccb:applications`
 * 与工作台共享审核状态
 */
(function () {
  "use strict";

  var STORE_KEY = "jsccb:applications";
  var $ = function (id) { return document.getElementById(id); };

  // 卡种目录
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

  // 城市数据（简化版，按省份）
  var CITY_DATA = {
    "北京市": ["北京市"],
    "天津市": ["天津市"],
    "河北省": ["石家庄市", "唐山市", "秦皇岛市", "邯郸市", "邢台市", "保定市", "张家口市", "承德市", "沧州市", "廊坊市", "衡水市"],
    "山西省": ["太原市", "大同市", "阳泉市", "长治市", "晋城市", "朔州市", "晋中市", "运城市", "忻州市", "临汾市", "吕梁市"],
    "内蒙古自治区": ["呼和浩特市", "包头市", "乌海市", "赤峰市", "通辽市", "鄂尔多斯市", "呼伦贝尔市", "巴彦淖尔市", "乌兰察布市", "兴安盟", "锡林郭勒盟", "阿拉善盟"],
    "辽宁省": ["沈阳市", "大连市", "鞍山市", "抚顺市", "本溪市", "丹东市", "锦州市", "营口市", "阜新市", "辽阳市", "盘锦市", "铁岭市", "朝阳市", "葫芦岛市"],
    "吉林省": ["长春市", "吉林市", "四平市", "辽源市", "通化市", "白山市", "松原市", "白城市", "延边朝鲜族自治州"],
    "黑龙江省": ["哈尔滨市", "齐齐哈尔市", "鸡西市", "鹤岗市", "双鸭山市", "大庆市", "伊春市", "佳木斯市", "七台河市", "牡丹江市", "黑河市", "绥化市", "大兴安岭地区"],
    "上海市": ["上海市"],
    "江苏省": ["南京市", "无锡市", "徐州市", "常州市", "苏州市", "南通市", "连云港市", "淮安市", "盐城市", "扬州市", "镇江市", "泰州市", "宿迁市"],
    "浙江省": ["杭州市", "宁波市", "温州市", "嘉兴市", "湖州市", "绍兴市", "金华市", "衢州市", "舟山市", "台州市", "丽水市"],
    "安徽省": ["合肥市", "芜湖市", "蚌埠市", "淮南市", "马鞍山市", "淮北市", "铜陵市", "安庆市", "黄山市", "滁州市", "阜阳市", "宿州市", "六安市", "亳州市", "池州市", "宣城市"],
    "福建省": ["福州市", "厦门市", "莆田市", "三明市", "泉州市", "漳州市", "南平市", "龙岩市", "宁德市"],
    "江西省": ["南昌市", "景德镇市", "萍乡市", "九江市", "新余市", "鹰潭市", "赣州市", "吉安市", "宜春市", "抚州市", "上饶市"],
    "山东省": ["济南市", "青岛市", "淄博市", "枣庄市", "东营市", "烟台市", "潍坊市", "济宁市", "泰安市", "威海市", "日照市", "莱芜市", "临沂市", "德州市", "聊城市", "滨州市", "菏泽市"],
    "河南省": ["郑州市", "开封市", "洛阳市", "平顶山市", "安阳市", "鹤壁市", "新乡市", "焦作市", "濮阳市", "许昌市", "漯河市", "三门峡市", "南阳市", "商丘市", "信阳市", "周口市", "驻马店市"],
    "湖北省": ["武汉市", "黄石市", "十堰市", "宜昌市", "襄阳市", "鄂州市", "荆门市", "孝感市", "荆州市", "黄冈市", "咸宁市", "随州市", "恩施土家族苗族自治州"],
    "湖南省": ["长沙市", "株洲市", "湘潭市", "衡阳市", "邵阳市", "岳阳市", "常德市", "张家界市", "益阳市", "郴州市", "永州市", "怀化市", "娄底市", "湘西土家族苗族自治州"],
    "广东省": ["广州市", "韶关市", "深圳市", "珠海市", "汕头市", "佛山市", "江门市", "湛江市", "茂名市", "肇庆市", "惠州市", "梅州市", "汕尾市", "河源市", "阳江市", "清远市", "东莞市", "中山市", "潮州市", "揭阳市", "云浮市"],
    "广西壮族自治区": ["南宁市", "柳州市", "桂林市", "梧州市", "北海市", "防城港市", "钦州市", "贵港市", "玉林市", "百色市", "贺州市", "河池市", "来宾市", "崇左市"],
    "海南省": ["海口市", "三亚市", "三沙市", "儋州市"],
    "重庆市": ["重庆市"],
    "四川省": ["成都市", "自贡市", "攀枝花市", "泸州市", "德阳市", "绵阳市", "广元市", "遂宁市", "内江市", "乐山市", "南充市", "眉山市", "宜宾市", "广安市", "达州市", "雅安市", "巴中市", "资阳市", "阿坝藏族羌族自治州", "甘孜藏族自治州", "凉山彝族自治州"],
    "贵州省": ["贵阳市", "六盘水市", "遵义市", "安顺市", "毕节市", "铜仁市", "黔西南布依族苗族自治州", "黔东南苗族侗族自治州", "黔南布依族苗族自治州"],
    "云南省": ["昆明市", "曲靖市", "玉溪市", "保山市", "昭通市", "丽江市", "普洱市", "临沧市", "楚雄彝族自治州", "红河哈尼族彝族自治州", "文山壮族苗族自治州", "西双版纳傣族自治州", "大理白族自治州", "德宏傣族景颇族自治州", "怒江傈僳族自治州", "迪庆藏族自治州"],
    "西藏自治区": ["拉萨市", "日喀则市", "昌都市", "林芝市", "山南市", "那曲市", "阿里地区"],
    "陕西省": ["西安市", "铜川市", "宝鸡市", "咸阳市", "渭南市", "延安市", "汉中市", "榆林市", "安康市", "商洛市"],
    "甘肃省": ["兰州市", "嘉峪关市", "金昌市", "白银市", "天水市", "武威市", "张掖市", "平凉市", "酒泉市", "庆阳市", "定西市", "陇南市", "临夏回族自治州", "甘南藏族自治州"],
    "青海省": ["西宁市", "海东市", "海北藏族自治州", "黄南藏族自治州", "海南藏族自治州", "果洛藏族自治州", "玉树藏族自治州", "海西蒙古族藏族自治州"],
    "宁夏回族自治区": ["银川市", "石嘴山市", "吴忠市", "固原市", "中卫市"],
    "新疆维吾尔自治区": ["乌鲁木齐市", "克拉玛依市", "吐鲁番市", "哈密市", "昌吉回族自治州", "博尔塔拉蒙古自治州", "巴音郭楞蒙古自治州", "阿克苏地区", "克孜勒苏柯尔克孜自治州", "喀什地区", "和田地区", "伊犁哈萨克自治州", "塔城地区", "阿勒泰地区"],
    "台湾省": ["台北市", "新北市", "桃园市", "台中市", "台南市", "高雄市"],
    "香港特别行政区": ["香港特别行政区"],
    "澳门特别行政区": ["澳门特别行政区"]
  };

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
  var currentCardId = "puka";
  var currentStep = 1;

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
  }

  // 渲染卡片 Tab 切换
  function renderCardDisplay() {
    var card = CARDS.filter(function (c) { return c.id === currentCardId; })[0];
    if (!card) return;
    
    var display = $("card-display");
    display.innerHTML = 
      '<div class="card-showcase">' +
        '<img src="' + card.img + '" alt="' + esc(card.name) + '" class="card-showcase-img"/>' +
        '<div class="card-showcase-info">' +
          '<p class="card-showcase-fee">' + esc(card.fee) + '，' + esc(card.feeNote) + '</p>' +
          '<p class="card-showcase-tags">中国银联 | ' + esc(card.tier) + ' | 磁条+IC+非接触</p>' +
        '</div>' +
      '</div>';
    
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
        
        tabs.forEach(function(t) { t.classList.remove("active"); });
        tab.classList.add("active");
        
        renderCardDisplay();
      });
    });
  }

  // 设置芯片组点击
  function setupChipGroup(groupId, hiddenName) {
    var group = document.getElementById(groupId);
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

  // 设置省市联动
  function setupProvinceCity(provinceSelectName, citySelectName) {
    var provinceSel = document.querySelector('select[name="' + provinceSelectName + '"]');
    var citySel = document.querySelector('select[name="' + citySelectName + '"]');
    if (!provinceSel || !citySel) return;
    
    provinceSel.addEventListener("change", function() {
      var province = provinceSel.value;
      citySel.innerHTML = '<option value="">城市</option>';
      if (province && CITY_DATA[province]) {
        CITY_DATA[province].forEach(function(city) {
          var opt = document.createElement("option");
          opt.value = city;
          opt.textContent = city;
          citySel.appendChild(opt);
        });
      }
    });
  }

  // 开始申请
  function startApply(id) {
    currentCard = CARDS.filter(function (c) { return c.id === id; })[0];
    if (!currentCard) return;
    
    var p = $("apply-card");
    p.innerHTML = '<img src="' + currentCard.img + '" class="apply-card-img"/>';
    
    var feeContent = $("fee-content");
    if (feeContent) {
      feeContent.innerHTML = 
        '<p class="fee-line"><strong>' + esc(currentCard.fee) + '</strong></p>' +
        '<p class="fee-note">' + esc(currentCard.feeNote) + '</p>';
    }
    
    $("form-step1").reset(); 
    $("form-step2").reset();
    $("apply-done").classList.add("hidden");
    
    gotoStep(1);
    showView("apply");
    window.scrollTo(0, 0);
  }

  function gotoStep(n) {
    currentStep = n;
    [1, 2].forEach(function (i) {
      var el = $("form-step" + i);
      if (el) el.classList.toggle("hidden", i !== n);
    });
    
    // 控制卡片预览显示（只在步骤1显示）
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
    if (progress) {
      progress.style.width = (n === 1 ? 50 : 80) + "%";
    }
    
    var stepCurrent = document.querySelector(".step-current");
    if (stepCurrent) stepCurrent.textContent = n;
  }

  function val(form, name) { return (form[name] && form[name].value) || ""; }

  // 提交
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
        contactType: val(f2, "contactType"),
        contactArea: val(f2, "contactArea"),
        contactPhone: val(f2, "contactPhone"),
        companyProvince: val(f2, "companyProvince"),
        companyCity: val(f2, "companyCity"),
        companyAddr: val(f2, "companyAddr"),
        homeProvince: val(f2, "homeProvince"),
        homeCity: val(f2, "homeCity"),
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
      [1, 2].forEach(function (i) { 
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

  // 返回按钮
  var stepBack = $("step-back");
  if (stepBack) {
    stepBack.addEventListener("click", function() {
      if (currentStep === 2) {
        gotoStep(1);
      } else {
        showView("home");
      }
    });
  }

  // 验证码
  var codeBtn = $("code-btn");
  if (codeBtn) {
    codeBtn.addEventListener("click", function () {
      var phone = $("form-step1").phone.value;
      if (!/^\d{11}$/.test(phone)) { alert("请输入正确的 11 位手机号"); return; }
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
      var agrees = f.querySelectorAll('input[name="agree[]"]:checked');
      if (agrees.length < 3) { alert("请阅读并同意全部协议"); return; }
      gotoStep(2);
      window.scrollTo(0, 0);
    });
  }

  // 进度查询 - 显示审核结果
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
    setupChipGroup("edu-group", "edu");
    setupChipGroup("employ-group", "employ");
    setupChipGroup("marry-group", "marry");
    setupChipGroup("contact-group", "contactType");
    setupChipGroup("mail-group", "mailAddr");
    setupProvinceCity("companyProvince", "companyCity");
    setupProvinceCity("homeProvince", "homeCity");
    setupAgreeAll();
    setupStep1Next();
    setupSubmit();
    
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
