/* ===================== الحقائق ===================== */
const FACTS = [
  { key:'age',    code:'ح١', q:'هل عمرك ٢١ سنة أو أكثر؟',                        note:'الحد الأدنى للأهلية النظامية.',        short:'العمر ٢١ فأكثر' },
  { key:'income', code:'ح٢', q:'هل لديك دخل شهري ثابت يمكن إثباته؟',              note:'راتب أو دخل نشاط تجاري موثق.',        short:'دخل ثابت مثبت' },
  { key:'level',  code:'ح٣', q:'هل يزيد دخلك الشهري على ٥٬٠٠٠ درهم؟',            note:'الحد الذي يرتفع عنده سقف التمويل.',   short:'الدخل فوق ٥٬٠٠٠' },
  { key:'tenure', code:'ح٤', q:'هل مضى على عملك الحالي ستة أشهر أو أكثر؟',        note:'مؤشر على استقرار الدخل.',            short:'ستة أشهر في العمل' },
  { key:'clean',  code:'ح٥', q:'هل سجلك الائتماني خالٍ من التعثر خلال سنتين؟',    note:'أي تأخر في السداد سجلته جهة تمويل.',  short:'سجل ائتماني نظيف' },
  { key:'burden', code:'ح٦', q:'هل تقل أقساطك الشهرية عن ٤٠٪ من دخلك؟',          note:'نسبة الالتزامات إلى الدخل.',         short:'الالتزامات دون ٤٠٪' }
];

const RULES = [
  {
    code:'ق١',
    uses:['age','income'],
    test:f => !f.age || !f.income,
    d:{ badge:'غير مقبول', klass:'reject', title:'الطلب غير مقبول.',
        lede:'شرطا الأهلية الأساسيان غير متحققين، فلا ينتقل النظام إلى بقية المعايير.',
        amount:'لا يوجد',
        why:'العمر والدخل الثابت شرطان لا يعوض عنهما أي معيار آخر، ولذلك يُحسم الطلب قبل النظر في السجل الائتماني أو نسبة الالتزامات.',
        next:'أعد التقديم عند بلوغ السن النظامية، أو بعد إثبات دخل شهري ثابت لمدة ثلاثة أشهر.' }
  },
  {
    code:'ق٢',
    uses:['clean','burden'],
    test:f => !f.clean && !f.burden,
    d:{ badge:'غير مقبول', klass:'reject', title:'درجة المخاطرة مرتفعة.',
        lede:'التعثر السابق مع ارتفاع الالتزامات الحالية يرفعان احتمال التعثر من جديد.',
        amount:'لا يوجد',
        why:'كل عامل منهما وحده قابل للمعالجة، أما اجتماعهما فيعني أن الدخل المتبقي بعد الأقساط لا يكفي لتحمل التزام جديد.',
        next:'اخفض أقساطك الحالية إلى أقل من ٤٠٪ من الدخل، ليعود الطلب إلى الدراسة وفق القاعدة الخامسة.' }
  },
  {
    code:'ق٣',
    uses:['age','income','level','tenure','clean','burden'],
    test:f => f.age && f.income && f.level && f.tenure && f.clean && f.burden,
    d:{ badge:'مقبول', klass:'approve', title:'الطلب مقبول بالكامل.',
        lede:'معايير الدخل والاستقرار والسجل الائتماني ونسبة الالتزامات كلها ضمن الحدود المطلوبة.',
        amount:'٥٠٬٠٠٠ درهم',
        why:'لم يختل أي معيار، فلا حاجة إلى ضمان إضافي ولا إلى خفض السقف. وهذه هي الحالة الوحيدة التي يمنح فيها النظام الحد الأعلى.',
        next:'جهّز إثبات الدخل وشهادة مدة العمل، ويصدر العرض النهائي خلال يومَي عمل.' }
  },
  {
    code:'ق٤',
    uses:['clean','level','tenure','burden'],
    test:f => f.clean && (!f.level || !f.tenure || !f.burden),
    d:{ badge:'مقبول بشرط', klass:'conditional', title:'مقبول بمبلغ أقل.',
        lede:'السجل الائتماني نظيف، غير أن أحد معايير القدرة على السداد لم يبلغ الحد المطلوب.',
        amount:'١٥٬٠٠٠ درهم',
        why:'نظافة السجل تكفي للقبول من حيث المبدأ، لكن المعيار الناقص يقلل هامش الأمان، فيُخفض السقف بدلًا من رفض الطلب.',
        next:'يُعاد النظر في السقف بعد ستة أشهر من الالتزام بالسداد، أو عند تحسن المعيار الناقص.' }
  },
  {
    code:'ق٥',
    uses:['clean','burden','level'],
    test:f => !f.clean && f.burden && f.level,
    d:{ badge:'مقبول بشرط', klass:'conditional', title:'مقبول بشرط تقديم ضمان.',
        lede:'الدخل الحالي وانخفاض الالتزامات يعوضان جزئيًا عن التعثر السابق.',
        amount:'١٠٬٠٠٠ درهم',
        why:'يظل التعثر السابق مؤشر مخاطرة، غير أن الوضع المالي الحالي تحسن بما يكفي لقبول الطلب مقابل ضمان يقابل هذه المخاطرة.',
        next:'قدّم كفيلًا ذا دخل ثابت، أو ضمانًا نقديًا بنسبة ٢٠٪ من قيمة التمويل.' }
  }
];

const FALLBACK = {
  badge:'قيد المراجعة', klass:'review', title:'الطلب يحتاج إلى مراجعة يدوية.',
  amount:'يُحدد لاحقًا',
  lede:'لم تنطبق أي قاعدة على هذه الحالة، وهي حالة حدية بين القبول والرفض.',
  why:'يوجد تعثر سابق مع التزامات منخفضة، لكن الدخل دون الحد المطلوب، فلا القاعدة الثانية ترفض ولا الخامسة تقبل. وتُترك مثل هذه الحالات لتقدير موظف الائتمان.',
  next:'أرفق كشف حساب آخر ستة أشهر لتسريع المراجعة.'
};

const answers = {};
const AR = n => String(n).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);
const $ = id => document.getElementById(id);

FACTS.forEach(f => {
  const row = document.createElement('div');
  row.className = 'fact';
  row.innerHTML =
    '<div class="fact-q">' + f.q + '<span class="fact-note">' + f.note + '</span></div>' +
    '<div class="seg" role="radiogroup" aria-label="' + f.q + '">' +
      '<button type="button" role="radio" aria-checked="false" data-key="' + f.key + '" data-val="yes">نعم</button>' +
      '<button type="button" role="radio" aria-checked="false" data-key="' + f.key + '" data-val="no">لا</button>' +
    '</div>';
  $('facts').appendChild(row);
});

$('facts').addEventListener('click', e => {
  const btn = e.target.closest('button[data-key]');
  if (!btn) return;
  answers[btn.dataset.key] = btn.dataset.val === 'yes';
  btn.parentElement.querySelectorAll('button').forEach(b =>
    b.setAttribute('aria-checked', String(b === btn)));
  update();
});

function update(){
  const n = Object.keys(answers).length;
  $('bar').style.width = (n / FACTS.length * 100) + '%';
  $('counter').textContent = AR(n) + ' من ' + AR(FACTS.length) + ' أسئلة';
  $('run').disabled = n < FACTS.length;
}

function infer(f){
  for (const r of RULES) if (r.test(f)) return { rule:r, d:r.d };
  return { rule:null, d:FALLBACK };
}

$('run').addEventListener('click', () => {
  const { rule, d } = infer(answers);
  const used = rule ? rule.uses : FACTS.map(f => f.key);
  $('badge').textContent = d.badge;
  $('badge').className = 'badge ' + d.klass;
  $('verdict-title').textContent = d.title;
  $('verdict-lede').textContent = d.lede;
  $('fig-amount').textContent = d.amount;
  $('why-text').textContent = d.why;
  $('next-text').textContent = d.next;
  $('basis').innerHTML = used.map(k => {
    const f = FACTS.find(x => x.key === k), v = answers[k];
    return '<span class="pill ' + (v ? 'y' : 'n') + '">' + f.short + ': <b>' + (v ? 'نعم' : 'لا') + '</b></span>';
  }).join('');
  const box = $('decision');
  box.className = 'on status-' + d.klass;
  box.scrollIntoView({ behavior:'smooth', block:'start' });
});

function resetForm(scroll){
  Object.keys(answers).forEach(k => delete answers[k]);
  document.querySelectorAll('.seg button').forEach(b => b.setAttribute('aria-checked','false'));
  $('decision').className = '';
  update();
  if (scroll) $('questions').scrollIntoView({ behavior:'smooth', block:'start' });
}

$('reset').addEventListener('click', () => resetForm(true));
$('edit-answers').addEventListener('click', () => {
  $('questions').scrollIntoView({ behavior:'smooth', block:'start' });
});

const io = new IntersectionObserver(entries => {
  entries.forEach(en => { if (en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); } });
}, { threshold:.15 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));
update();
