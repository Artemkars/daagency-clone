const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf-8');

const formRegex = /<div class="da-contact__form"[^>]*>.*?<button class="da-contact__button"[^>]*>.*?<\/button>\s*<\/div>/s;

const formNewInputs = `
<div class="da-contact__form" data-da-form> 
<label class="da-contact__field"> <input class="da-contact__input" type="text" name="name" placeholder="Имя" required> </label> 
<label class="da-contact__field"> <input class="da-contact__input phone-mask" type="tel" name="phone" placeholder="Номер телефона (+7...)" required> </label> 
<label class="da-contact__field"> <input class="da-contact__input" type="text" name="niche" placeholder="Ниша" maxlength="100" required> </label> 
<label class="da-contact__field"> <input class="da-contact__input budget-mask" type="text" name="budget" placeholder="Планируемый бюджет (только цифры)" required> </label> 
<button class="da-contact__button" type="button">Отправить заявку</button> </div>
`;

html = html.replace(formRegex, () => formNewInputs);

const jsOldValidation = /function validate\(customForm\) \{.*?return true;\}/s;
const jsNewValidation = `
function validate(customForm) {
    var nameInput=customForm.querySelector('[name="name"]');
    var phoneInput=customForm.querySelector('[name="phone"]');
    var nicheInput=customForm.querySelector('[name="niche"]');
    var budgetInput=customForm.querySelector('[name="budget"]');
    var name=nameInput?nameInput.value.trim():'';
    var phone=phoneInput?phoneInput.value.trim():'';
    var niche=nicheInput?nicheInput.value.trim():'';
    var budget=budgetInput?budgetInput.value.trim():'';
    
    var phoneDigits=phone.replace(/\\D/g,'');
    var phoneOk=phoneDigits.length>=10;
    
    markError(nameInput,!name);
    markError(phoneInput,!phone||!phoneOk);
    markError(nicheInput,!niche);
    markError(budgetInput,!budget);
    
    if(!name || !phone || !phoneOk || !niche || !budget) return false;
    return true;
}`;

html = html.replace(jsOldValidation, () => jsNewValidation);

const jsOldSubmit = /var name=\(customForm\.querySelector\('\[name="name"\]'\)\|\|\{\}\)\.value\|\|'';.*?fetch\('https:\/\/s7\.apix-drive\.com\/web-hooks\/[^\']*',\{method:'POST',body:params,mode:'no-cors'\}\)\.catch\(function\(\)\{\}\);\}catch\(_\)\{\}/s;

const jsNewSubmit = `
var name=(customForm.querySelector('[name="name"]')||{}).value||'';
var phone=(customForm.querySelector('[name="phone"]')||{}).value||'';
var niche=(customForm.querySelector('[name="niche"]')||{}).value||'';
var budget=(customForm.querySelector('[name="budget"]')||{}).value||'';
setBtn('Отправляем...',true);
try{
    var params=new URLSearchParams();
    params.append('name',name.trim());
    params.append('phone',phone.trim());
    params.append('niche',niche.trim());
    params.append('budget',budget.trim());
    params.append('source',window.location.href);
    params.append('timestamp',new Date().toISOString());
    fetch('https://s7.apix-drive.com/web-hooks/33595/irzdht65',{method:'POST',body:params,mode:'no-cors'}).then(function(){window.location.href='thankyou.html';}).catch(function(){});
}catch(_){}
`;

html = html.replace(jsOldSubmit, () => jsNewSubmit);

fs.writeFileSync('index.html', html, 'utf-8');
console.log("Successfully updated visible form fields and validation.");
