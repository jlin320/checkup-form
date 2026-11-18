/* Shared form definitions + renderers for the three 林醫院 health-check forms.
   Used by patient.html (page 1 on the phone), staff.html (both pages) and report.html (print). */
(function (G) {
  "use strict";

  var HOSPITAL = { name: "林醫院", tel: "03-5962316", addr: "新竹縣竹東鎮東林路76號" };

  var HX = [["htn","高血壓"],["dm","糖尿病"],["heart","心臟病"],["cancer","癌症"],["cataract","白內障"],["stroke","中風"],["epilepsy","癲癇"],
    ["asthma","氣喘"],["copd","慢性氣管炎、肺氣腫"],["tb","肺結核"],["kidney","腎臟病"],["liver","肝病"],["anemia","貧血"],
    ["otitis","中耳炎"],["hearing","聽力障礙"],["thyroid","甲狀腺疾病"],["ulcer","消化性潰瘍、胃炎"],["gerd","逆流性食道炎"],
    ["fracture","骨折"],["surgery","手術開刀"],["other","其他慢性病"],["none","以上皆無"]];
  var HX_TEXT = { cancer: "hx_cancer", fracture: "hx_fracture", surgery: "hx_surgery", other: "hx_other" };

  var SX = [["cough","咳嗽"],["sputum","咳痰"],["dyspnea","呼吸困難"],["chest","胸痛"],["palp","心悸"],["dizzy","頭暈"],["headache","頭痛"],["tinnitus","耳鳴"],
    ["fatigue","倦怠"],["nausea","噁心"],["abd","腹痛"],["constip","便秘"],["diarrhea","腹瀉"],["bloody","血便"],["ubp","上背痛"],["lbp","下背痛"],
    ["numb","手腳麻痛"],["joint","關節疼痛"],["dysuria","排尿不適"],["freq","多尿、頻尿"],["weak","手腳肌肉無力"],
    ["wtloss","體重減輕3公斤以上"],["other","其他症狀"],["none","以上皆無"]];

  var HABITS = {
    smoke: { q: "1.請問您過去一個月內是否有吸菸？", opts: [["never","從未吸菸"],["occ","偶爾吸(不是天天)"],["daily","（幾乎）每天吸"],["quit","已經戒菸"]] },
    betel: { q: "2.請問您最近六個月內是否有嚼食檳榔？", opts: [["never","從未嚼食檳榔"],["occ","偶爾嚼(不是天天)"],["daily","（幾乎）每天嚼"],["quit","已經戒食"]] },
    alc:   { q: "3.請問您過去一個月內是否有喝酒？", opts: [["never","從未喝酒"],["occ","偶爾喝(不是天天)"],["daily","（幾乎）每天喝"],["quit","已經戒酒"]] }
  };

  var PE_BASE = [["head","頭頸部 (結膜、淋巴腺、甲狀腺)"],["resp","呼 吸 系 統"],["cv","心臟血管系統 (心律、心雜音)"],
    ["gi","消化系統 (黃膽、肝臟、腹部)"],["neuro","神經系統 (感覺)"],["msk","肌肉骨骼 (四肢)"]];

  // lab definitions: ref text printed on the form + numeric rule for H/L marks
  function sexRange(m, f) { return function (sex) { return sex === "F" ? f : m; }; }
  var LABS = {
    wbc:  { label: "白 血 球 數", unit: "/ul",   ref: "4500-10000", rule: { min: 4500, max: 10000 } },
    hb:   { label: "血 色 素",     unit: "g/dl",  ref: "男12.5-17.5；女11.5-15.5", rule: sexRange({ min: 12.5, max: 17.5 }, { min: 11.5, max: 15.5 }) },
    glu:  { label: "空 腹 血 糖",  unit: "mg/dl", ref: "70-100", rule: { min: 70, max: 100 } },
    tg:   { label: "三 酸 甘 油 酯", unit: "mg/dl", ref: "30-150", rule: { min: 30, max: 150 } },
    chol: { label: "膽 固 醇",     unit: "mg/dl", ref: "<200", rule: { lt: 200 } },
    hdl:  { label: "高 密 度 膽 固 醇", unit: "mg/dl", ref: ">40", rule: { gt: 40 } },
    ldl:  { label: "低 密 度 膽 固 醇", unit: "mg/dl", ref: "<130mg/dl", rule: { lt: 130 } },
    cr:   { label: "肌酸酐 (creatinine)", unit: "mg/dl", ref: "男0.7-1.3；女0.5-1.1", rule: sexRange({ min: 0.7, max: 1.3 }, { min: 0.5, max: 1.1 }) },
    gpt:  { label: "肝 功 能(SGPT)", unit: "U/L", ref: "男8-42；女6-27", rule: sexRange({ min: 8, max: 42 }, { min: 6, max: 27 }) },
    hav_igg:  { label: "A 型肝炎 IgG 抗體", unit: "S/CO", ref: "(+)>=1.0" },
    hav_igm:  { label: "A 型肝炎 IgM 抗體", unit: "S/CO", ref: "(-)<0.8;(+/-)0.8-1.2;(+)>1.2" },
    typh_b:   { label: "血 液 傷 寒", unit: "", ref: "(-) 陰 性" },
    typh_s:   { label: "糞 便 傷 寒", unit: "", ref: "(-) 陰 性" },
    amoeba:   { label: "阿米巴痢疾", unit: "", ref: "(-) 陰 性" },
    parasite: { label: "寄生蟲卵", unit: "", ref: "(-) 陰 性" },
    syphilis: { label: "梅 毒 試 驗", unit: "", ref: "(-) 陰 性" }
  };
  var LAB_ORDER = ["wbc","hb","glu","tg","chol","hdl","ldl","cr","gpt"];

  var FORMS = {
    general: { key: "general", short: "一般體檢", title: "一般體格及健康檢查紀錄表", photo: true, starPhone: true,
      pickup: "取件日為10個工作天不含假日", desc: "一般勞工體格及健康檢查",
      pe: PE_BASE.concat([["skin","皮膚"]]), vitals: ["height","weight","waist","bp"],
      labs: LAB_ORDER, hdlRef: ">40", hdlGt: 40, note2: false },
    cpc: { key: "cpc", short: "中油體檢", title: "一般體格及健康檢查紀錄表（中油）", photo: false, starPhone: true,
      pickup: "取件日為10個工作天不含假日", desc: "中油公司員工",
      pe: PE_BASE.concat([["skin","皮膚"]]), vitals: ["height","weight","waist","temp","resp","pulse","bp"],
      labs: LAB_ORDER, hdlRef: ">50", hdlGt: 50, note2: true },
    food: { key: "food", short: "供膳體檢", title: "一般(供膳)體格及健康檢查紀錄表", photo: true, starPhone: false,
      pickup: "取件日為(糞便)繳交後10個工作天不含假日", desc: "餐飲／供膳從業人員（需另交糞便檢體）",
      pe: PE_BASE.concat([["skin","手部皮膚病、出疹、膿瘡、外傷"]]), vitals: ["height","weight","waist","bp"],
      labs: ["wbc","hb","glu","chol","tg","hdl","ldl","cr","gpt","hav_igg","hav_igm","typh_b","typh_s","amoeba","parasite","syphilis"],
      hdlRef: ">50", hdlGt: 50, note2: true }
  };
  var VITALS = { height: ["身 高", "公 分"], weight: ["體 重", "公 斤"], waist: ["腰 圍", "公 分"],
    temp: ["體 溫", "°C"], resp: ["呼 吸", "分/次"], pulse: ["脈 搏", "次"] };

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function labRule(form, key, sex) {
    if (key === "hdl") return { gt: FORMS[form].hdlGt };
    var r = LABS[key] && LABS[key].rule;
    return typeof r === "function" ? r(sex) : r;
  }
  function labFlag(form, key, value, sex) {
    var r = labRule(form, key, sex);
    var v = parseFloat(String(value || "").replace(/,/g, ""));
    if (!r || isNaN(v) || !/^\s*[<>]?\s*-?[\d.,]+\s*$/.test(String(value))) return "";
    if (r.min != null && v < r.min) return "L";
    if (r.max != null && v > r.max) return "H";
    if (r.lt != null && v >= r.lt) return "H";
    if (r.gt != null && v <= r.gt) return "L";
    return "";
  }
  function labRef(form, key) { return key === "hdl" ? FORMS[form].hdlRef : LABS[key].ref; }

  /* ================================================================ input builders
     Every field is a plain input/select with name=<key>; checkbox groups use name=<group> value=<item>. */
  function txt(k, opt) {
    opt = opt || {};
    return '<input class="in ' + (opt.cls || "") + '" name="' + k + '"' +
      (opt.num ? ' inputmode="' + (opt.dec ? "decimal" : "numeric") + '"' : "") +
      (opt.ph ? ' placeholder="' + esc(opt.ph) + '"' : "") +
      (opt.max ? ' maxlength="' + opt.max + '"' : "") +
      (opt.list ? ' list="' + opt.list + '"' : "") + ' autocomplete="off">';
  }
  function radios(k, opts, cls) {
    return '<div class="opts ' + (cls || "") + '">' + opts.map(function (o) {
      return '<label class="opt"><input type="radio" name="' + k + '" value="' + o[0] + '"><span>' + esc(o[1]) + "</span></label>";
    }).join("") + "</div>";
  }
  function checks(k, opts, extra) {
    return '<div class="opts grid">' + opts.map(function (o) {
      var x = extra && extra[o[0]];
      return '<label class="opt' + (x ? " wide" : "") + '"><input type="checkbox" name="' + k + '" value="' + o[0] + '"><span>' + esc(o[1]) + "</span>" +
        (x ? txt(x, { cls: "sm", ph: "說明" }) : "") + "</label>";
    }).join("") + "</div>";
  }
  function ymd(prefix, label, withDay) {
    return '<div class="ymd"><span class="lbl">' + label + '</span>' +
      txt(prefix + "_y", { num: 1, cls: "y", ph: "民國年", max: 3 }) + "<i>年</i>" +
      txt(prefix + "_m", { num: 1, cls: "m", ph: "月", max: 2 }) + "<i>月</i>" +
      (withDay === false ? "" : txt(prefix + "_d", { num: 1, cls: "m", ph: "日", max: 2 }) + "<i>日</i>") + "</div>";
  }
  function field(label, inner, cls) {
    return '<div class="fld ' + (cls || "") + '"><label class="lbl">' + label + "</label>" + inner + "</div>";
  }
  function job(p, title) {
    return '<div class="job"><div class="sub">' + title + "</div>" +
      field("工作內容", txt(p + "_title", { ph: "例如：作業員" })) +
      ymd(p + "_s", "起始日期", false) + ymd(p + "_e", "截止日期", false) +
      '<div class="ymd"><span class="lbl">共</span>' + txt(p + "_ty", { num: 1, cls: "m" }) + "<i>年</i>" +
      txt(p + "_tm", { num: 1, cls: "m" }) + "<i>月</i></div></div>";
  }
  function habit(k, n1, u1, n2, u2) {
    var h = HABITS[k];
    var daily = k === "alc"
      ? '平均每週喝 ' + txt("alc_n", { num: 1, cls: "m" }) + ' 次，最常喝 ' + txt("alc_kind", { cls: "s", ph: "例：啤" }) + ' 酒，每次 ' + txt("alc_b", { num: 1, dec: 1, cls: "m" }) + " 瓶"
      : "平均每天" + n1 + " " + txt(k + "_n", { num: 1, cls: "m" }) + " " + u1 + "，已" + n2 + " " + txt(k + "_y", { num: 1, cls: "m" }) + " 年";
    return '<div class="habit"><div class="q">' + h.q + "</div>" + radios(k, h.opts) +
      '<div class="more" data-show="' + k + '=daily">' + daily + "</div>" +
      '<div class="more" data-show="' + k + '=quit">戒了 ' + txt(k + "_qy", { num: 1, cls: "m" }) + " 年 " + txt(k + "_qm", { num: 1, cls: "m" }) + " 個月</div></div>";
  }

  function page1Html(formKey) {
    var f = FORMS[formKey];
    return '<section class="card"><h2>一、基本資料</h2>' +
      field("★電話", txt("phone", { num: 1, ph: "手機號碼", max: 20 })) +
      field("1.姓名", txt("name", { max: 30 })) +
      field("2.性別", radios("sex", [["M","男"],["F","女"]])) +
      field("3.身分證字號(護照號碼)", txt("id_no", { max: 20, cls: "upper" })) +
      ymd("birth", "4.出生日期") + ymd("hire", "5.受僱日期") + ymd("exam", "6.檢查日期") +
      field("7.事業單位名稱", txt("company", { max: 40 })) +
      '<p class="hint">◆ 日期請寫民國年，例如 1985 年 = 民國 74 年</p></section>' +
      '<section class="card"><h2>二、作業經歷</h2>' + job("job1", "1.曾經從事") + job("job2", "2.目前從事") +
      field("是否需輪班", radios("shift", [["no","否"],["yes","是"]])) +
      '<div class="more" data-show="shift=yes">' + radios("shift_type", [["2","兩班制"],["3","三班制"],["4","四班制"],["other","其他"]]) +
      '<div class="more" data-show="shift_type=other">' + txt("shift_other", { ph: "其他班制" }) + "</div></div>" +
      field("3.過去1個月，平均<b>每週</b>工時", txt("hours1", { num: 1, cls: "m" }) + " 小時") +
      field("過去6個月，平均<b>每週</b>工時", txt("hours6", { num: 1, cls: "m" }) + " 小時") + "</section>" +
      '<section class="card"><h2>三、檢查時期（原因）</h2>' + radios("reason", [["new","新進員工（受僱時）"],["regular","定期檢查"]]) + "</section>" +
      '<section class="card"><h2>四、既往病史</h2><p class="hint">您是否曾患有下列慢性疾病：（請勾選）</p>' + checks("hx", HX, HX_TEXT) + "</section>" +
      '<section class="card"><h2>五、生活習慣</h2>' + habit("smoke", "吸", "支", "吸菸") + habit("betel", "嚼", "顆", "嚼") + habit("alc") +
      field("4.工作日期間，<b>平均每天睡眠時間</b>", txt("sleep", { num: 1, dec: 1, cls: "m" }) + " 小時") + "</section>" +
      '<section class="card"><h2>六、自覺症狀</h2><p class="hint">您最近三個月是否常有下列症狀：（請勾選）</p>' + checks("sx", SX, { other: "sx_other" }) +
      (f.note2 ? '<p class="hint">自覺症狀乙項，請依自身實際症狀勾選。</p>' : "") + "</section>";
  }

  var PE_OPTS = '<datalist id="dl-pe"><option value="正常"><option value="異常"><option value="無明顯異常"></datalist>' +
    '<datalist id="dl-neg"><option value="-"><option value="+/-"><option value="+"><option value="++"><option value="+++"></datalist>' +
    '<datalist id="dl-hear"><option value="正常"><option value="異常"></datalist>' +
    '<datalist id="dl-cxr"><option value="正常"><option value="無明顯異常"><option value="異常"></datalist>' +
    '<datalist id="dl-negpos"><option value="(-) 陰性"><option value="(+) 陽性"></datalist>';

  function page2Html(formKey) {
    var f = FORMS[formKey];
    var h = PE_OPTS + '<section class="card"><h2>理學檢查 <button type="button" class="mini" data-act="pe-normal">全部填「正常」</button></h2>';
    f.pe.forEach(function (p) {
      h += '<div class="row2"><span class="lbl">' + p[1] + "</span>" + txt("pe_" + p[0], { list: "dl-pe", cls: "s" }) + txt("pe_" + p[0] + "_n", { ph: "備註", cls: "s" }) + "</div>";
    });
    h += '</section><section class="card"><h2>身體測量</h2>';
    f.vitals.forEach(function (v) {
      if (v === "bp") {
        h += '<div class="row2"><span class="lbl">血 壓</span>' + txt("bp_s", { num: 1, cls: "m" }) + " / " + txt("bp_d", { num: 1, cls: "m" }) + " mmHg</div>";
      } else {
        h += '<div class="row2"><span class="lbl">' + VITALS[v][0] + "</span>" + txt(v, { num: 1, dec: 1, cls: "m" }) + " " + VITALS[v][1] + "</div>";
      }
    });
    h += '<div class="row2"><span class="lbl">視 力 左</span>' + txt("vis_l", { num: 1, dec: 1, cls: "m" }) + radios("vis_l_t", [["n","裸視"],["c","矯正"]], "inline") + "</div>";
    h += '<div class="row2"><span class="lbl">視 力 右</span>' + txt("vis_r", { num: 1, dec: 1, cls: "m" }) + radios("vis_r_t", [["n","裸視"],["c","矯正"]], "inline") + "</div>";
    h += '<div class="row2"><span class="lbl">辨 色 力</span>' + radios("color", [["normal","正常"],["weak","色弱"]], "inline") + "</div>";
    h += '<div class="row2"><span class="lbl">聽 力 左／右</span>' + txt("hear_l", { list: "dl-hear", cls: "s" }) + txt("hear_r", { list: "dl-hear", cls: "s" }) + "</div>";
    h += '<div class="row2"><span class="lbl">胸 部 X 光</span>' + txt("cxr", { list: "dl-cxr", cls: "w" }) + "</div>";
    h += '<div class="row2"><span class="lbl">病 歷 號</span>' + txt("mrn", { num: 1, cls: "s", max: 12 }) + "</div>";
    h += '<div class="row2"><span class="lbl">尿 蛋 白</span>' + txt("u_pro", { list: "dl-neg", cls: "s" }) + '<span class="ref">(-) 陰 性</span></div>';
    h += '<div class="row2"><span class="lbl">尿 潛 血</span>' + txt("u_ob", { list: "dl-neg", cls: "s" }) + '<span class="ref">(-) 陰 性</span></div>';
    h += '</section><section class="card"><h2>血液檢查 <button type="button" class="mini primary" data-act="labs">從 LabWall 帶入</button></h2>' +
      '<input type="hidden" name="lab_src"><div class="labsrc"></div>';
    f.labs.forEach(function (k) {
      var L = LABS[k];
      var neg = !LABS[k].rule && !/S\/CO/.test(L.unit);
      h += '<div class="row2 lab" data-lab="' + k + '"><span class="lbl">' + L.label + "</span>" +
        txt(k, { cls: "s", list: neg ? "dl-negpos" : "" }) + '<span class="unit">' + esc(L.unit) + '</span><span class="flag"></span><span class="ref">' + esc(labRef(formKey, k)) + "</span></div>";
    });
    h += '</section><section class="card"><h2>醫師</h2>' +
      field("應處理及注意事項", '<textarea class="in" name="advice" rows="3"></textarea>') +
      field("檢查醫師姓名及證書字號", txt("doctor", { cls: "w" })) + "</section>";
    return h;
  }

  /* ================================================================ read / write values */
  function setValues(root, data) {
    data = data || {};
    var els = root.querySelectorAll("input[name],textarea[name],select[name]");
    for (var i = 0; i < els.length; i++) {
      var el = els[i], v = data[el.name];
      if (el.type === "checkbox") el.checked = Array.isArray(v) && v.indexOf(el.value) >= 0;
      else if (el.type === "radio") el.checked = v === el.value;
      else el.value = v == null ? "" : v;
    }
    refreshShow(root);
  }
  function getValues(root) {
    var out = {};
    var els = root.querySelectorAll("input[name],textarea[name],select[name]");
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (el.type === "checkbox") {
        if (!out[el.name]) out[el.name] = [];
        if (el.checked) out[el.name].push(el.value);
      } else if (el.type === "radio") {
        if (el.checked) out[el.name] = el.value;
        else if (!(el.name in out)) out[el.name] = "";
      } else out[el.name] = el.name === "id_no" ? el.value.trim().toUpperCase() : el.value.trim();
    }
    return out;
  }
  function refreshShow(root) {
    var vals = getValues(root);
    var mores = root.querySelectorAll("[data-show]");
    for (var i = 0; i < mores.length; i++) {
      var kv = mores[i].getAttribute("data-show").split("=");
      mores[i].style.display = vals[kv[0]] === kv[1] ? "" : "none";
    }
  }
  // "以上皆無" unticks the others and vice versa
  function wireExclusive(root) {
    root.addEventListener("change", function (e) {
      var t = e.target;
      if (t.type === "checkbox" && (t.name === "hx" || t.name === "sx") && t.checked) {
        var box = root.querySelectorAll('input[name="' + t.name + '"]');
        for (var i = 0; i < box.length; i++) {
          if (t.value === "none" ? box[i].value !== "none" : box[i].value === "none") box[i].checked = false;
        }
      }
      refreshShow(root);
    });
  }

  /* ================================================================ print report */
  function ck(on) { return on ? "■" : "□"; }
  function b(v, w) { return '<span class="b" style="min-width:' + (w || 3) + 'em">' + esc(v || "") + "</span>"; }
  function has(arr, k) { return Array.isArray(arr) && arr.indexOf(k) >= 0; }

  function reportHtml(sub) {
    var f = FORMS[sub.form_type], p = sub.page1 || {}, q = sub.page2 || {};
    var sex = p.sex;
    function hxItem(k, label) {
      var t = HX_TEXT[k];
      return "<span>" + ck(has(p.hx, k)) + label + (t ? b(p[t], 3) : "") + "</span>";
    }
    function habitLines(k, l1, l2) {
      var v = p[k], H = HABITS[k];
      var daily = k === "alc"
        ? "平均每<b>週</b>喝" + b(p.alc_n, 2) + "次，最常喝" + b(p.alc_kind, 2) + "酒，每次" + b(p.alc_b, 2) + "瓶"
        : "平均每<b>天</b>" + l1 + b(p[k + "_n"], 2) + (k === "smoke" ? "支，已吸菸" : "顆，已嚼") + b(p[k + "_y"], 2) + "年";
      return '<div class="q">' + H.q + "</div>" +
        '<div class="l">' + ck(v === "never") + '<span class="w9">' + H.opts[0][1] + "</span>" + ck(v === "occ") + H.opts[1][1] + "</div>" +
        '<div class="l">' + ck(v === "daily") + "（幾乎）每天" + (k === "smoke" ? "吸" : k === "betel" ? "嚼" : "喝") + "，" + daily + "</div>" +
        '<div class="l">' + ck(v === "quit") + H.opts[3][1].replace("已經", "已經") + "，戒了" + b(p[k + "_qy"], 2) + "年" + b(p[k + "_qm"], 2) + "個月。</div>";
    }
    function jobLine(n, pre, lab) {
      return '<div class="l ind">' + n + "." + lab + b(p[pre + "_title"], 4) + "，起始日期：" + b(p[pre + "_s_y"], 2) + "年" + b(p[pre + "_s_m"], 2) +
        "月，截止日期：" + b(p[pre + "_e_y"], 2) + "年" + b(p[pre + "_e_m"], 2) + "月，共" + b(p[pre + "_ty"], 2) + "年" + b(p[pre + "_tm"], 2) + "月</div>";
    }
    var st = p.shift_type;
    var hxRows = [["htn","dm","heart","cancer","cataract","stroke","epilepsy"],["asthma","copd","tb","kidney","liver","anemia"],
      ["otitis","hearing","thyroid","ulcer","gerd"],["fracture","surgery","other","none"]];
    var sxRows = [["cough","sputum","dyspnea","chest","palp","dizzy","headache","tinnitus"],["fatigue","nausea","abd","constip","diarrhea","bloody","ubp","lbp"],
      ["numb","joint","dysuria","freq","weak"],["wtloss","other","none"]];
    var HXL = {}, SXL = {};
    HX.forEach(function (x) { HXL[x[0]] = x[1]; });
    SX.forEach(function (x) { SXL[x[0]] = x[1]; });

    var p1 = '<div class="page"><h1>' + esc(f.title) + "</h1>" +
      '<div class="box">' +
      '<div class="sec top">' + (f.photo ? '<div class="photo"></div>' : "") +
      '<div class="l">一、基本資料</div>' +
      '<div class="l ind"><span class="c1">1.姓名：' + b(p.name, 7) + "</span>2.性別：" + ck(sex === "M") + "男　" + ck(sex === "F") + "女</div>" +
      '<div class="l ind"><span class="c1">3.身分證字號(護照號碼)：' + b(String(p.id_no || "").toUpperCase(), 7) + "</span>4.出生日期" + b(p.birth_y, 2) + "年" + b(p.birth_m, 1.5) + "月" + b(p.birth_d, 1.5) + "日</div>" +
      '<div class="l ind"><span class="c1">5.受僱日期' + b(p.hire_y, 2) + "年" + b(p.hire_m, 1.5) + "月" + b(p.hire_d, 1.5) + "日</span>6.檢查日期" + b(p.exam_y, 2) + "年" + b(p.exam_m, 1.5) + "月" + b(p.exam_d, 1.5) + "日</div>" +
      '<div class="l ind">7.事業單位名稱：' + b(p.company, 8) + "</div>" +
      '</div>' +
      '<div class="sec"><div class="l">二、作業經歷</div>' + jobLine(1, "job1", "曾經從事") + jobLine(2, "job2", "目前從事") +
      '<div class="l ind2">是否需輪班' + ck(p.shift === "yes") + "是(" + ck(p.shift === "yes" && st === "2") + "兩班制 " + ck(p.shift === "yes" && st === "3") + "三班制 " +
      ck(p.shift === "yes" && st === "4") + "四班制 " + ck(p.shift === "yes" && st === "other") + "其他:" + b(p.shift === "yes" && st === "other" ? p.shift_other : "", 3) + ")　" + ck(p.shift === "no") + "否</div>" +
      '<div class="l ind">3.過去1個月，平均每週工時為：' + b(p.hours1, 2.5) + "小時(請以檢查日前1個月填寫)；</div>" +
      '<div class="l ind2">過去6個月，平均每週工時為：' + b(p.hours6, 2.5) + "小時(請以檢查日前6個月填寫)</div></div>" +
      '<div class="sec"><div class="l">三、檢查時期（原因）：' + ck(p.reason === "new") + "新進員工（受僱時）　" + ck(p.reason === "regular") + "定期檢查</div></div>" +
      '<div class="sec"><div class="l">四、既往病史</div><div class="l ind">您是否曾患有下列慢性疾病：（請在適當項目前打勾）</div>' +
      hxRows.map(function (r) { return '<div class="l ind grid7">' + r.map(function (k) { return hxItem(k, HXL[k]); }).join("") + "</div>"; }).join("") + "</div>" +
      '<div class="sec"><div class="l">五、生活習慣</div><div class="ind">' + habitLines("smoke", "吸") + habitLines("betel", "嚼") + habitLines("alc") +
      '<div class="q">4.請問您於工作日期間，平均每天睡眠時間為:' + b(p.sleep, 2) + "小時</div></div></div>" +
      '<div class="sec last"><div class="l">六、自覺症狀：您最近三個月是否常有下列症狀：（請在適當項目前打勾）</div>' +
      sxRows.map(function (r) {
        return '<div class="l ind grid8">' + r.map(function (k) {
          return "<span>" + ck(has(p.sx, k)) + SXL[k] + (k === "other" ? b(p.sx_other, 3) : "") + "</span>";
        }).join("") + "</div>";
      }).join("") + "</div></div>" +
      '<div class="foot"><span class="tag">填表說明</span><div>一、請受檢員工於健檢前，填妥基本資料、作業經歷、檢查時期、既往病史、生活習慣及自覺症狀六大項，再交由醫護人員作確認。</div>' +
      (f.note2 ? "<div>二、自覺症狀乙項，請受檢者依自身實際症狀勾選。</div>" : "") + '</div><div class="pno">1</div></div>';

    // ---------------- page 2
    function val(k) { return esc(q[k] || ""); }
    function row(label, mid, right, cls) {
      return '<tr class="' + (cls || "") + '"><th colspan="2">' + label + "</th><td>" + mid + "</td><td>" + right + "</td></tr>";
    }
    var r = "";
    f.pe.forEach(function (pe, i) {
      r += "<tr class=\"pe c\">" +(i === 0 ? '<th class="vert" rowspan="' + f.pe.length + '">各系統或部位理學檢查</th>' : "") +
        '<th class="pel">' + esc(pe[1]) + "</th><td>" + val("pe_" + pe[0]) + "</td><td>" + val("pe_" + pe[0] + "_n") + "</td></tr>";
    });
    function num(k) { return parseFloat(String(q[k] || "").replace(/,/g, "")); }
    function abn(k) {
      if (k === "weight") { var h = num("height") / 100, bmi = num("weight") / (h * h); return bmi >= 24 || bmi < 18.5; }
      if (k === "waist") return num("waist") >= (sex === "F" ? 80 : 90);
      if (k === "bp") return num("bp_s") >= 140 || num("bp_d") >= 90;
      return false;
    }
    function mark(html, on) { return on ? '<span class="ab">' + html + "</span>" : html; }
    f.vitals.forEach(function (v) {
      if (v === "bp") {
        var bp = q.bp_s || q.bp_d ? esc(q.bp_s) + " / " + esc(q.bp_d) : "";
        r += row("血　　壓", mark(bp, abn("bp")), "mmhg", "tall c");
      } else r += row(VITALS[v][0].replace(" ", "　　"), mark(val(v), abn(v)), VITALS[v][1], "tall c");
    });
    function vis(side) {
      var t = q["vis_" + side + "_t"], v = val("vis_" + side);
      return v + (t === "n" ? "(裸視)" : t === "c" ? "(矯正)" : v ? "" : "<small>(裸視、矯正)</small>");
    }
    r += row("視　　力", "左:" + vis("l") + "　　　右:" + vis("r"), "", "tall c");
    r += row("辨 色 力", q.color === "normal" ? "正常" : q.color === "weak" ? mark("色弱", true) : "正常　　　色弱", "", "tall c");
    r += row("聽 力 檢 查", "左:" + val("hear_l") + "　　　右:" + val("hear_r"), "", "tall c");
    r += row("胸 部　X 光", val("cxr"), "病歷號：" + val("mrn"), "tall c");
    function urine(k) { var v = q[k] || "", neg = /^\s*(-|－|neg|negative|陰性?)?\s*$/i.test(v); return mark("(" + (v ? esc(v) : "　") + ")", !neg); }
    r += row("尿 蛋 白", urine("u_pro"), "(-) 陰 性", "tall c");
    r += row("尿 潛 血", urine("u_ob"), "(-) 陰 性", "tall c");
    f.labs.forEach(function (k) {
      var L = LABS[k], fl = labFlag(f.key, k, q[k], sex);
      r += '<tr class="lab"><th colspan="2">' + esc(L.label) + '</th><td class="num"><span class="lv' + (fl ? " ab" : "") + '">' + val(k) +
        '</span><span class="u">' + esc(L.unit) + "</span></td><td>" + esc(labRef(f.key, k)) + "</td></tr>";
    });
    r += '<tr class="big"><th colspan="2" class="sp">應 處 理 及 注 意 事 項</th><td colspan="2" class="pre">' + val("advice") + "</td></tr>";
    r += '<tr class="big"><th colspan="2">檢查醫師姓名(簽章)及證書字號</th><td colspan="2">' + val("doctor") + "</td></tr>";
    r += '<tr class="big"><th colspan="2">檢查醫療機構名稱、電話及地址</th><td colspan="2">醫院名稱：' + HOSPITAL.name + "<br>電話：" + HOSPITAL.tel + "<br>醫院地址：" + HOSPITAL.addr + "</td></tr>";

    var p2 = '<div class="page p2' + (f.key === "food" ? " dense" : "") + (f.key === "cpc" ? " mid" : "") + '"><div class="staffhdr">========【以下由醫護人員填寫】========</div>' +
      '<table class="t2"><colgroup><col class="c0"><col class="c1"><col class="c2"><col class="c3"></colgroup>' + r + "</table>" +
      '<div class="foot2">備註：1.各系統或部位理學檢查，健檢醫師應依各別員工之實際狀況，作詳細檢查。<br>　　　2.先天性辨色力異常者，定期健康檢查時不需檢測。</div><div class="pno">2</div></div>';
    return p1 + p2;
  }

  G.CK = {
    FORMS: FORMS, LABS: LABS, HOSPITAL: HOSPITAL, esc: esc,
    page1Html: page1Html, page2Html: page2Html, setValues: setValues, getValues: getValues,
    refreshShow: refreshShow, wireExclusive: wireExclusive, labFlag: labFlag, labRef: labRef, reportHtml: reportHtml
  };
})(window);
