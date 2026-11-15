// بيانات تجريبية للواجهة فقط. ستُنقل لاحقاً إلى قاعدة بيانات موثوقة.
const categories = ["الكل","الخضروات","الفاكهة","المحاصيل الحقلية","النباتات الطبية والعطرية","المحاصيل الزيتية"];
const crops = [
  {id:1,name:"الطماطم",category:"الخضروات",emoji:"🍅",description:"محصول خضري ثمري",info:["اختيار الصنف يعتمد على المنطقة وموعد الزراعة وطريقة الإنتاج.","تختلف مواعيد الزراعة والري والتسميد حسب المحافظة والتربة.","يجب الرجوع إلى التوصيات المحلية المعتمدة قبل تحديد الجرعات."]},
  {id:2,name:"البطاطس",category:"الخضروات",emoji:"🥔",description:"محصول درني",info:["تُختار التقاوي المعتمدة والخالية من الأمراض.","تختلف مواعيد الزراعة حسب العروة والمنطقة.","تُحدد احتياجات الري والتسميد وفق تحليل التربة ومراحل النمو."]},
  {id:3,name:"الخيار",category:"الخضروات",emoji:"🥒",description:"محصول خضري ثمري",info:["توجد أصناف للزراعة المكشوفة وأخرى للصوب.","تُراعى درجات الحرارة وطريقة التربية عند اختيار الصنف.","تُضبط برامج الري والتسميد وفق مرحلة النمو."]},
  {id:4,name:"الفلفل",category:"الخضروات",emoji:"🫑",description:"محصول خضري ثمري",info:["تتوفر أصناف وألوان متعددة.","يُراعى اختيار الصنف المناسب للمنطقة ونظام الزراعة.","تُراقب الآفات والأمراض بصفة دورية."]},
  {id:5,name:"المانجو",category:"الفاكهة",emoji:"🥭",description:"محصول فاكهة بستاني",info:["اختيار الصنف يرتبط بالمناخ وملاءمة المنطقة.","تختلف الخدمة والتقليم والتسميد حسب عمر الأشجار.","يُحدد موعد الجمع وفق نضج الثمار والصنف."]},
  {id:6,name:"العنب",category:"الفاكهة",emoji:"🍇",description:"محصول فاكهة متساقط الأوراق",info:["تُختار الأصناف وفق الغرض التسويقي والبيئة.","تختلف مسافات الزراعة حسب الصنف ونظام التربية.","تُدار عمليات التقليم والري والتسميد حسب مرحلة النمو."]},
  {id:7,name:"القمح",category:"المحاصيل الحقلية",emoji:"🌾",description:"محصول حبوب شتوي",info:["يُستخدم تقاوي معتمدة وملائمة للمنطقة.","تُحدد كمية التقاوي وموعد الزراعة وفق التوصيات الرسمية للمحافظة.","يراعى انتظام الري والتسميد ومتابعة الحشائش."]},
  {id:8,name:"الذرة الشامية",category:"المحاصيل الحقلية",emoji:"🌽",description:"محصول حبوب صيفي",info:["يُختار الهجين حسب المنطقة والغرض من الإنتاج.","تُراعى المسافات والكثافة النباتية الموصى بها للهجين.","تُتابع احتياجات المياه خلال مراحل النمو الحساسة."]},
  {id:9,name:"النعناع",category:"النباتات الطبية والعطرية",emoji:"🌿",description:"نبات عطري",info:["تُختار مادة الإكثار السليمة والصنف المناسب.","تختلف مواعيد الحش حسب المنطقة والغرض من الإنتاج.","تُراعى جودة مياه الري والصرف."]},
  {id:10,name:"عباد الشمس",category:"المحاصيل الزيتية",emoji:"🌻",description:"محصول زيتي",info:["يُختار الصنف أو الهجين حسب المنطقة وموعد الزراعة.","تُحدد الكثافة وفق توصية الصنف وطبيعة الأرض.","تُراعى احتياجات المياه خلال التزهير وامتلاء البذور."]}
];
let activeCategory = "الكل";
const grid = document.getElementById("cropGrid");
const filters = document.getElementById("categoryFilters");
const search = document.getElementById("cropSearch");
const dialog = document.getElementById("cropDialog");

function renderFilters(){
  filters.innerHTML = categories.map(c => `<button class="filter-btn ${c===activeCategory?"active":""}" data-category="${c}">${c}</button>`).join("");
  filters.querySelectorAll("button").forEach(btn => btn.addEventListener("click",()=>{
    activeCategory=btn.dataset.category; renderFilters(); renderCrops();
  }));
}
function renderCrops(){
  const term=search.value.trim().toLowerCase();
  const shown=crops.filter(c=>(activeCategory==="الكل"||c.category===activeCategory) && c.name.toLowerCase().includes(term));
  grid.innerHTML=shown.length?shown.map(c=>`
    <article class="crop-card">
      <div class="crop-emoji" aria-hidden="true">${c.emoji}</div>
      <h3>${c.name}</h3><p>${c.category} · ${c.description}</p>
      <button class="details-btn" data-id="${c.id}">عرض ملف المحصول</button>
    </article>`).join(""):`<p>لا توجد نتائج مطابقة. جرّب كلمة بحث أخرى.</p>`;
  grid.querySelectorAll(".details-btn").forEach(btn=>btn.addEventListener("click",()=>showCrop(Number(btn.dataset.id))));
}
function showCrop(id){
  const crop=crops.find(c=>c.id===id); if(!crop)return;
  document.getElementById("cropDetails").innerHTML=`
    <div class="crop-emoji">${crop.emoji}</div><span class="eyebrow">${crop.category}</span>
    <h2>${crop.name}</h2><p>${crop.description}</p><h3>معلومات أساسية</h3>
    <ul class="detail-list">${crop.info.map(x=>`<li>${x}</li>`).join("")}</ul>
    <p class="note">هذه معلومات تمهيدية وليست برنامجاً زراعياً معتمداً. ستُضاف البيانات التفصيلية بمراجع موثوقة لكل منطقة.</p>`;
  dialog.showModal();
}
document.getElementById("closeDialog").addEventListener("click",()=>dialog.close());
dialog.addEventListener("click",e=>{if(e.target===dialog)dialog.close()});
search.addEventListener("input",renderCrops);
renderFilters(); renderCrops();
