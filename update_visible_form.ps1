$html = Get-Content -Path "index.html" -Raw -Encoding UTF8

$formOld = '<div class="da-contact__form" data-da-form> <label class="da-contact__field"> <input class="da-contact__input" type="text" name="name" placeholder="Ваше имя"> </label> <label class="da-contact__field"> <input class="da-contact__input" type="email" name="email" placeholder="Email"> </label> <label class="da-contact__field"> <input class="da-contact__input" type="tel" name="phone" placeholder="Телефон"> </label> <label class="da-contact__field"> <input class="da-contact__input" type="text" name="budget" placeholder="Планируемый бюджет"> </label> <button class="da-contact__button" type="button">Оставить заявку</button> </div>'

# Note: We need to use regex because spacing might be slightly different.
$formRegex = '(?s)<div class="da-contact__form"[^>]*>.*?<button class="da-contact__button"[^>]*>.*?</button>\s*</div>'

$formNewInputs = @"
<div class="da-contact__form" data-da-form> 
<label class="da-contact__field"> <input class="da-contact__input" type="text" name="name" placeholder="Имя" required> </label> 
<label class="da-contact__field"> <input class="da-contact__input phone-mask" type="tel" name="phone" placeholder="Номер телефона (+7...)" required> </label> 
<label class="da-contact__field"> <input class="da-contact__input" type="text" name="niche" placeholder="Ниша" maxlength="100" required> </label> 
<label class="da-contact__field"> <input class="da-contact__input budget-mask" type="text" name="budget" placeholder="Планируемый бюджет (цифры)" required> </label> 
<button class="da-contact__button" type="button">Отправить заявку</button> </div>
"@

$html = $html -replace $formRegex, $formNewInputs

# Update JS validation
$jsOldValidation = '(?s)function validate.*?return true;}'
$jsNewValidation = @"
function validate(customForm) {
    var nameInput=customForm.querySelector('[name="name"]');
    var phoneInput=customForm.querySelector('[name="phone"]');
    var nicheInput=customForm.querySelector('[name="niche"]');
    var budgetInput=customForm.querySelector('[name="budget"]');
    var name=nameInput?nameInput.value.trim():'';
    var phone=phoneInput?phoneInput.value.trim():'';
    var niche=nicheInput?nicheInput.value.trim():'';
    var budget=budgetInput?budgetInput.value.trim():'';
    
    var phoneDigits=phone.replace(/\D/g,'');
    var phoneOk=phoneDigits.length>=10;
    
    markError(nameInput,!name);
    markError(phoneInput,!phone||!phoneOk);
    markError(nicheInput,!niche);
    markError(budgetInput,!budget);
    
    if(!name || !phone || !phoneOk || !niche || !budget) return false;
    return true;
}
"@

$html = $html -replace $jsOldValidation, $jsNewValidation

# Update the submission values logic
$jsOldSubmit = '(?s)var name=\(customForm\.querySelector\(''\\[name="name"\]''\)\|\|\{\}\)\.value\|\|'''';.*?fetch\(''https://s7\.apix-drive\.com/web-hooks/.*?catch\(_\)\{\}'
$jsNewSubmit = @"
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
    fetch('https://script.google.com/macros/s/AKfycbzMcAxJy5LPXQwpFRvSbBs_o95AGjG13MIJsffq8Fsh4qpWw-cXnFJGSpItlBtFKdPX/exec',{method:'POST',body:params,mode:'no-cors'}).then(function(){window.location.href='thankyou.html';}).catch(function(){});
}catch(_){}
"@

$html = $html -replace $jsOldSubmit, $jsNewSubmit

Set-Content -Path "index.html" -Value $html -Encoding UTF8

Write-Host "Success: Updated visible form fields and validation script in index.html"

