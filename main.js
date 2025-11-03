let CUSTOMER_NAME = null;
const SHEET_WEBAPP_URL = window.DC_CONFIG.SHEET_WEBAPP_URL;
const PAYMENT_URL = window.DC_CONFIG.PAYMENT_URL;
const WHATSAPP_NUMBER = window.DC_CONFIG.WHATSAPP_NUMBER;

const form = document.getElementById('bookingForm');
const saveBtn = document.getElementById('saveBtn');
const successBox = document.getElementById('successBox');
const errorBox = document.getElementById('errorBox');
const payBtn = document.getElementById('payBtn');
const waBtn = document.getElementById('waBtn');

function getFormData(){
  return {
    name: document.getElementById('name').value.trim(),
    phone: document.getElementById('phone').value.trim(),
    email: document.getElementById('email').value.trim(),
    area: document.getElementById('area').value.trim(),
    service: document.getElementById('service').value,
    when: document.getElementById('when').value
  };
}

async function saveBooking(){
  successBox.classList.add('hidden');
  errorBox.classList.add('hidden');
  const data = getFormData();
  if(!data.name || !data.phone || !data.email || !data.area || !data.service || !data.when){
    errorBox.textContent = "Please fill in all required fields.";
    errorBox.classList.remove('hidden');
    return;
  }
  try{
    saveBtn.disabled = true;
    const res = await fetch(SHEET_WEBAPP_URL, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ booking: data, source: 'DhofarCareStatic' })
    });
    if(res.ok){
      successBox.classList.remove('hidden');
      updateWhatsAppHref();
    }else{
      const txt = await res.text();
      throw new Error(txt || 'Failed to save');
    }
  }catch(err){
    errorBox.textContent = "Error: " + err.message;
    errorBox.classList.remove('hidden');
  }finally{
    saveBtn.disabled = false;
  }
}

function updateWhatsAppHref(){
  const b = getFormData();
  const msg = `Booking Request:%0AName: ${b.name}%0APhone: ${b.phone}%0AEmail: ${b.email}%0AArea: ${b.area}%0AService: ${b.service}%0AWhen: ${b.when}`;
  waBtn.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`;
}

saveBtn.addEventListener('click', saveBooking);
payBtn.href = PAYMENT_URL;
form.addEventListener('input', updateWhatsAppHref);
updateWhatsAppHref();

function toggleChat(){
  const c = document.getElementById('chat');
  c.style.display = (c.style.display === 'flex') ? 'none' : 'flex';
}
window.toggleChat = toggleChat;

function appendMsg(text, who='bot'){
  const body = document.getElementById('chatBody');
  const div = document.createElement('div');
  div.className = `msg ${who}`;
  div.innerHTML = text;
  body.appendChild(div);
  body.scrollTop = body.scrollHeight;
}

function sendMsg(){
  const input = document.getElementById('chatInput');
  const text = input.value.trim();
  if(!text) return;
  appendMsg(text, 'user');
  input.value = '';
  handleAI(text);
}
window.sendMsg = sendMsg;

function handleAI(text){
  const t = text.toLowerCase();
  if(!CUSTOMER_NAME){
    CUSTOMER_NAME = text.replace(/[^a-zA-Z\s]/g,'').trim();
    appendMsg(`Nice to meet you, <b>${CUSTOMER_NAME}</b>! Ask about services, price, Dhofar areas, 24/7, or how to book.`);
    return;
  }
  if(t.includes('service')){
    appendMsg('We provide: cleaning, AC repair, plumbing, electrical, painting & décor, CCTV/smart home, car wash, gardening.');
  }else if(t.includes('price') || t.includes('how much')){
    appendMsg('Prices: small jobs 5–10 OMR; AC/electrical/plumbing 15–25 OMR. Final price depends on area & technician.');
  }else if(t.includes('area') || t.includes('where')){
    appendMsg('We serve: Salalah, Taqah, Mirbat, Thumrait, Rakhyut, Dhalkut.');
  }else if(t.includes('24') || t.includes('time') || t.includes('available')){
    appendMsg('We accept requests 24/7 ✅. Technician visit depends on availability and your selected time.');
  }else if(t.includes('book') || t.includes('register')){
    appendMsg('Go to Book section, fill the form, click "Submit Booking", then click "Pay Now".');
  }else{
    appendMsg(`Thanks ${CUSTOMER_NAME}. I can help with services, prices, areas, 24/7 or booking.`);
  }
}
