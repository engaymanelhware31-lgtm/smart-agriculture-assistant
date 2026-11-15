const DATA_URL = "data/crops.json";
const LOCAL_KEY = "saa_local_crops_v1";
let categories = [];
let crops = [];
let activeCategory = "all";
let selectedCrop = null;
let selectedTab = "varieties";

const $ = (id) => document.getElementById(id);
const categoryName = (id) => categories.find(c => c.id === id)?.name || "تصنيف آخر";

async function init(){
  try{
    const response = await fetch(DATA_URL);
    if(!response.ok) throw new Error("تعذر تحميل ملف المحاصيل");
    const data = await response.json();
    categories = data.categories || [];
    crops = data.crops || [];
    const local = JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");
    crops = [...crops, ...local.filter(item => !crops.some(c => c.id === item.id))];
    renderCategories();
    renderAdminCategories();
    renderCrops();
    $("cropCount").textContent = crops.length;
    bindEvents();
  }catch(error){
    $("cropGrid").innerHTML = `<div class="empty">تعذر تحميل بيانات المحاصيل. تأكد من رفع مجلد data مع ملفات المشروع.</div>`;
    console.error(error);
  }
}
function renderCategories(){
  $("categoryStrip").innerHTML = categories.map(cat =>
    `<button class="category-btn ${cat.id===activeCategory?"active":""}" data-id="${escapeHTML(cat.id)}">${cat.icon} ${escapeHTML(cat.name)}</button>`
  ).join("");
  $("categoryStrip").querySelectorAll("button").forEach(btn => btn.addEventListener("click",()=>{
    activeCategory=btn.dataset.id; renderCategories(); renderCrops();
  }));
}
function renderAdminCategories(){
  $("adminCategory").innerHTML = categories.filter(c=>c.id!=="all").map(c=>`<option value="${escapeHTML(c.id)}">${escapeHTML(c.name)}</option>`).join("");
}
function renderCrops(){
  const query = $("searchInput").value.trim().toLocaleLowerCase("ar");
  const sort = $("sortSelect").value;
  let list = crops.filter(c => (activeCategory==="all" || c.category===activeCategory) &&
    (`${c.name} ${c.scientificName||""} ${categoryName(c.category)}`).toLocaleLowerCase("ar").includes(query));
  list.sort((a,b)=> sort==="category" ? categoryName(a.category).localeCompare(categoryName(b.category),"ar") || a.name.localeCompare(b.name,"ar") : a.name.localeCompare(b.name,"ar"));
  $("resultCount").textContent = `${list.length} محصول`;
  $("cropGrid").innerHTML = list.map(c=>`
    <article class="crop-card">
      <div class="crop-art" aria-hidden="true">${escapeHTML(c.emoji||"🌱")}</div>
      <h3>${escapeHTML(c.name)}</h3>
      <div class="crop-meta">${escapeHTML(categoryName(c.category))} · ${escapeHTML(c.type||"محصول زراعي")}</div>
      <div class="card-bottom"><button class="details-btn" data-id="${escapeHTML(c.id)}">الملف الزراعي</button><span class="scientific">${escapeHTML(c.scientificName||"")}</span></div>
    </article>`).join("");
  $("emptyState").classList.toggle("hidden",list.length!==0);
  $("cropGrid").querySelectorAll(".details-btn").forEach(btn=>btn.addEventListener("click",()=>openCrop(btn.dataset.id)));
}
const tabs = [
  ["varieties","الأصناف والتقاوي"],["planting","مواعيد الزراعة"],["spacing","المسافات والزراعة"],
  ["irrigation","الري"],["fertilization","التسميد"],["protection","الأمراض والمكافحة"],
  ["harvest","الحصاد"],["yield","الإنتاجية"]
];
function openCrop(id){
  selectedCrop = crops.find(c=>c.id===id);
  if(!selectedCrop) return;
  selectedTab="varieties";
  $("cropDetail").innerHTML=`
    <div class="detail-top"><div class="detail-emoji">${escapeHTML(selectedCrop.emoji||"🌱")}</div><div><span class="eyebrow">${escapeHTML(categoryName(selectedCrop.category))}</span><h2>${escapeHTML(selectedCrop.name)}</h2><p>${escapeHTML(selectedCrop.scientificName||"")} · ${escapeHTML(selectedCrop.type||"")}</p></div></div>
    <p class="muted">${escapeHTML(selectedCrop.summary||"ملف المحصول")}</p>
    <div class="detail-tabs">${tabs.map(([key,label])=>`<button class="detail-tab ${key===selectedTab?"active":""}" data-tab="${key}">${label}</button>`).join("")}</div>
    <div class="detail-content" id="detailContent"></div>
    <p class="source-note">لا تعتمد أي جرعات أو مواعيد قبل إضافة مرجع زراعي موثق والتحقق من ملاءمته للموقع والموسم.</p>`;
  renderDetailTab();
  $("cropDetail").querySelectorAll(".detail-tab").forEach(btn=>btn.addEventListener("click",()=>{
    selectedTab=btn.dataset.tab;
    $("cropDetail").querySelectorAll(".detail-tab").forEach(b=>b.classList.toggle("active",b===btn));
    renderDetailTab();
  }));
  $("cropDialog").showModal();
}
function renderDetailTab(){
  const text = selectedCrop.sections?.[selectedTab] || "لم تتم إضافة بيانات موثقة لهذا القسم بعد.";
  $("detailContent").textContent = text;
}
function bindEvents(){
  $("searchInput").addEventListener("input",renderCrops);
  $("sortSelect").addEventListener("change",renderCrops);
  $("dialogClose").addEventListener("click",()=>$("cropDialog").close());
  $("adminClose").addEventListener("click",()=>$("adminDialog").close());
  $("adminOpen").addEventListener("click",()=>$("adminDialog").showModal());
  $("cropDialog").addEventListener("click",e=>{if(e.target===$("cropDialog")) $("cropDialog").close();});
  $("adminDialog").addEventListener("click",e=>{if(e.target===$("adminDialog")) $("adminDialog").close();});
  $("addCropForm").addEventListener("submit",addLocalCrop);
  $("exportData").addEventListener("click",exportCrops);
}
function addLocalCrop(event){
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const name = String(form.get("name")||"").trim();
  if(!name) return;
  const crop = {
    id:"local_"+Date.now(), name, scientificName:String(form.get("scientificName")||"").trim(),
    category:String(form.get("category")), emoji:String(form.get("emoji")||"🌱"),
    type:"محصول مضاف محلياً", summary:"تمت إضافة هذا المحصول محلياً من لوحة إدارة المحتوى.",
    sections:Object.fromEntries(tabs.map(([key])=>[key,"لم تتم إضافة بيانات موثقة لهذا القسم بعد."])), sources:[]
  };
  const local = JSON.parse(localStorage.getItem(LOCAL_KEY)||"[]");
  local.push(crop); localStorage.setItem(LOCAL_KEY,JSON.stringify(local));
  crops.push(crop); $("cropCount").textContent=crops.length;
  activeCategory="all"; renderCategories(); renderCrops();
  event.currentTarget.reset(); $("adminDialog").close();
  alert("تم حفظ المحصول في هذا المتصفح فقط. لتعميمه على الموقع، حدّث ملف data/crops.json وارفعه إلى GitHub.");
}
function exportCrops(){
  const data = JSON.stringify({categories,crops},null,2);
  const blob = new Blob([data],{type:"application/json;charset=utf-8"});
  const url=URL.createObjectURL(blob); const a=document.createElement("a");
  a.href=url; a.download="crops-export.json"; a.click(); URL.revokeObjectURL(url);
}
function escapeHTML(value){
  return String(value??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
}
init();
