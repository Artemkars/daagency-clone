

  // Анимация счетчиков в полосе статистики — запускается сразу при загрузке страницы

  (function(){

    var counters = document.querySelectorAll('.counter');

    if(!counters.length) return;

    counters.forEach(function(el){

      var targetRaw = el.getAttribute('data-target') || '0';

      var target = parseFloat(targetRaw) || 0;

      var isDecimal = targetRaw.indexOf('.') !== -1;

      var prefix = el.getAttribute('data-prefix') || '';

      var suffix = el.getAttribute('data-suffix') || '';

      var duration = 1400;

      var start = null;

      function step(ts){

        if(!start) start = ts;

        var progress = Math.min((ts - start) / duration, 1);

        var value = progress * target;

        if(isDecimal) {

          el.textContent = prefix + value.toFixed(1) + suffix;

        } else {

          el.textContent = prefix + Math.floor(value) + suffix;

        }

        if(progress < 1) requestAnimationFrame(step);

        else el.textContent = prefix + targetRaw + suffix;

      }

      requestAnimationFrame(step);

    });

  })();



  
  // Анимация при прокрутке (reveal on scroll)
  (function(){
    var items = document.querySelectorAll('.reveal-on-scroll');
    if(!items.length) return;
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if(entry.isIntersecting) {
          entry.target.classList.add('active');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    items.forEach(function(item) {
      observer.observe(item);
    });
  })();

  // Единый перехватчик форм для корректной отправки в WhatsApp

  document.querySelectorAll('form').forEach(function(form) {

    form.addEventListener('submit', function(e) {

      e.preventDefault();

      

      var name = form.querySelector('[name="text_name"]') ? form.querySelector('[name="text_name"]').value : '';

      var phone = form.querySelector('[name="text_phone"]') ? form.querySelector('[name="text_phone"]').value : '';

      var message = form.querySelector('[name="text_message"]') ? form.querySelector('[name="text_message"]').value : '';

      var packageChoice = form.querySelector('[name="text_package"]') ? form.querySelector('[name="text_package"]').value : '';

      var site = form.querySelector('[name="text_site"]') ? form.querySelector('[name="text_site"]').value : '';

      var niche = form.querySelector('[name="text_niche"]') ? form.querySelector('[name="text_niche"]').value : '';

      var service = form.querySelector('[name="text_service"]') ? form.querySelector('[name="text_service"]').value : '';

      var employees = form.querySelector('[name="text_employees"]') ? form.querySelector('[name="text_employees"]').value : '';

      var messenger = form.querySelector('[name="text_messenger"]') ? form.querySelector('[name="text_messenger"]').value : '';

      

      var text = "Новая заявка с сайта DA Agency:\n";

      if (name) text += "Имя: " + name + "\n";

      if (phone) text += "Телефон: " + phone + "\n";

      if (service) text += "Услуга: " + service + "\n";

      if (packageChoice) text += "Пакет: " + packageChoice + "\n";

      if (site) text += "Сайт/Инстаграм: " + site + "\n";

      if (niche) text += "Ниша: " + niche + "\n";

      if (employees) text += "Сотрудников: " + employees + "\n";

      if (messenger) text += "Мессенджер: " + messenger + "\n";

      if (message) text += "Описание: " + message + "\n";

      

            var webhookUrl = "https://script.google.com/macros/s/AKfycbxp18amN9Fjx-83OH-lGUbtWdzjyhJNTk1xVcJtpBaKlHMnkhs_wlTMdzVIDPADQc1R/exec";
      var payload = {
          name: name,
          phone: phone,
          service: service,
          packageChoice: packageChoice,
          site: site,
          niche: niche,
          message: message,
          raw_text: text
      };
      
      var submitBtn = form.querySelector('[type="submit"]') || form.querySelector('button');
      var originalText = submitBtn ? submitBtn.textContent : 'Отправить';
      if (submitBtn) { submitBtn.textContent = "Отправка..."; submitBtn.disabled = true; }
      
      fetch(webhookUrl, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(payload)
      }).then(function(res) {
          if (submitBtn) { submitBtn.textContent = originalText; submitBtn.disabled = false; }
          form.reset();
          var modal = document.getElementById('lead-success-modal');
          if (modal) { modal.classList.add('active'); } else { alert("Заявка успешно отправлена!"); }
      }).catch(function(err) {
          console.error(err);
          if (submitBtn) { submitBtn.textContent = originalText; submitBtn.disabled = false; }
          var whatsappUrl = "https://wa.me/77067062157?text=" + encodeURIComponent(text);
          window.open(whatsappUrl, '_blank');
      });

    });

  });



// --- Scroll to Top ---
(function(){
  const btn = document.getElementById('scroll-to-top');
  if(!btn) return;
  window.addEventListener('scroll', function(){
    if(window.scrollY > 500) {
      btn.classList.add('show');
    } else {
      btn.classList.remove('show');
    }
  });
  btn.addEventListener('click', function(){
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();


document.querySelectorAll('form').forEach(function(form) {
    if (form.getAttribute('action') && form.getAttribute('action').includes('wa.me')) {
        form.removeAttribute('action');
    }
    // Only attach if not already attached (avoid duplicates)
    if (form.dataset.telegramBound) return;
    form.dataset.telegramBound = 'true';

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        var name = form.querySelector('[name="text_name"]') ? form.querySelector('[name="text_name"]').value : '';
        var phone = form.querySelector('[name="text_phone"]') ? form.querySelector('[name="text_phone"]').value : '';
        var message = form.querySelector('[name="text_message"]') ? form.querySelector('[name="text_message"]').value : '';
        var packageChoice = form.querySelector('[name="text_package"]') ? form.querySelector('[name="text_package"]').value : '';
        var site = form.querySelector('[name="text_site"]') ? form.querySelector('[name="text_site"]').value : '';
        var niche = form.querySelector('[name="text_niche"]') ? form.querySelector('[name="text_niche"]').value : '';
        var service = form.querySelector('[name="text_service"]') ? form.querySelector('[name="text_service"]').value : '';
        
        var text = "Новая заявка с сайта DA Agency:\n";
        if (name) text += "Имя: " + name + "\n";
        if (phone) text += "Телефон: " + phone + "\n";
        if (service) text += "Услуга: " + service + "\n";
        if (packageChoice) text += "Пакет: " + packageChoice + "\n";
        if (site) text += "Сайт/Инстаграм: " + site + "\n";
        if (niche) text += "Ниша: " + niche + "\n";
        if (message) text += "Описание: " + message + "\n";

        var webhookUrl = "https://script.google.com/macros/s/AKfycbxp18amN9Fjx-83OH-lGUbtWdzjyhJNTk1xVcJtpBaKlHMnkhs_wlTMdzVIDPADQc1R/exec";
        var payload = { name: name, phone: phone, service: service, packageChoice: packageChoice, site: site, niche: niche, message: message, raw_text: text };
        
        var submitBtn = form.querySelector('[type="submit"]') || form.querySelector('button');
        var originalText = submitBtn ? submitBtn.textContent : 'Отправить';
        if (submitBtn) { submitBtn.textContent = "Отправка..."; submitBtn.disabled = true; }
        
        fetch(webhookUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: {'Content-Type': 'text/plain;charset=utf-8'},
            body: JSON.stringify(payload)
        }).then(function(res) {
            if (submitBtn) { submitBtn.textContent = originalText; submitBtn.disabled = false; }
            form.reset();
            var modal = document.getElementById('lead-success-modal');
            if (modal) { modal.classList.add('active'); } else { alert("Заявка успешно отправлена!"); }
        }).catch(function(err) {
            console.error(err);
            if (submitBtn) { submitBtn.textContent = originalText; submitBtn.disabled = false; }
            var whatsappUrl = "https://wa.me/77067062157?text=" + encodeURIComponent(text);
            window.open(whatsappUrl, '_blank');
        });
    });
});

document.getElementById('hamburger')?.addEventListener('click', function(){ this.classList.toggle('open'); document.querySelector('.navlinks').classList.toggle('open'); });

// --- Benefits accordion ---
(function(){
  const tabs = document.querySelectorAll('.benefit-tab');
  const panels = document.querySelectorAll('.benefit-panel');
  tabs.forEach(function(tab){
    ['mouseenter', 'click'].forEach(e => tab.addEventListener(e, function(ev){ 
      const idx = tab.dataset.tab;
      tabs.forEach(function(t){ t.classList.remove('active'); });
      panels.forEach(function(p){ p.classList.remove('active'); });
      tab.classList.add('active');
      document.getElementById('bp-' + idx).classList.add('active');
    }));
  });
})();

// --- Audit popup ---
(function(){
  const popup = document.getElementById('audit-popup');
  const closeBtn = document.getElementById('audit-popup-close');
  if(!popup) return;
  function showPopup(){
    if(localStorage.getItem('auditPopupShown')) return;
    localStorage.setItem('auditPopupShown', 'true');
    popup.classList.add('visible');
  }
  closeBtn.addEventListener('click', function(){ popup.classList.remove('visible'); });
  popup.addEventListener('click', function(e){ if(e.target === popup) popup.classList.remove('visible'); });
  // Show exactly once after 2 minutes
  setTimeout(showPopup, 120000);
})();

// --- FAQ accordion ---
(function(){
  document.querySelectorAll('.faq-q').forEach(function(btn){
    btn.addEventListener('click', function(){
      const item = btn.closest('.faq-item');
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(function(el){ el.classList.remove('open'); });
      if(!isOpen) item.classList.add('open');
    });
  });
})();


// --- Scroll to Top ---
(function(){
  const btn = document.getElementById('scroll-to-top');
  if(!btn) return;
  window.addEventListener('scroll', function(){
    if(window.scrollY > 500) {
      btn.classList.add('show');
    } else {
      btn.classList.remove('show');
    }
  });
  btn.addEventListener('click', function(){
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();


document.querySelectorAll('form').forEach(function(form) {
    if (form.getAttribute('action') && form.getAttribute('action').includes('wa.me')) {
        form.removeAttribute('action');
    }
    // Only attach if not already attached (avoid duplicates)
    if (form.dataset.telegramBound) return;
    form.dataset.telegramBound = 'true';

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        var name = form.querySelector('[name="text_name"]') ? form.querySelector('[name="text_name"]').value : '';
        var phone = form.querySelector('[name="text_phone"]') ? form.querySelector('[name="text_phone"]').value : '';
        var message = form.querySelector('[name="text_message"]') ? form.querySelector('[name="text_message"]').value : '';
        var packageChoice = form.querySelector('[name="text_package"]') ? form.querySelector('[name="text_package"]').value : '';
        var site = form.querySelector('[name="text_site"]') ? form.querySelector('[name="text_site"]').value : '';
        var niche = form.querySelector('[name="text_niche"]') ? form.querySelector('[name="text_niche"]').value : '';
        var service = form.querySelector('[name="text_service"]') ? form.querySelector('[name="text_service"]').value : '';
        
        var text = "Новая заявка с сайта DA Agency:\n";
        if (name) text += "Имя: " + name + "\n";
        if (phone) text += "Телефон: " + phone + "\n";
        if (service) text += "Услуга: " + service + "\n";
        if (packageChoice) text += "Пакет: " + packageChoice + "\n";
        if (site) text += "Сайт/Инстаграм: " + site + "\n";
        if (niche) text += "Ниша: " + niche + "\n";
        if (message) text += "Описание: " + message + "\n";

        var webhookUrl = "https://script.google.com/macros/s/AKfycbxp18amN9Fjx-83OH-lGUbtWdzjyhJNTk1xVcJtpBaKlHMnkhs_wlTMdzVIDPADQc1R/exec";
        var payload = { name: name, phone: phone, service: service, packageChoice: packageChoice, site: site, niche: niche, message: message, raw_text: text };
        
        var submitBtn = form.querySelector('[type="submit"]') || form.querySelector('button');
        var originalText = submitBtn ? submitBtn.textContent : 'Отправить';
        if (submitBtn) { submitBtn.textContent = "Отправка..."; submitBtn.disabled = true; }
        
        fetch(webhookUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: {'Content-Type': 'text/plain;charset=utf-8'},
            body: JSON.stringify(payload)
        }).then(function(res) {
            if (submitBtn) { submitBtn.textContent = originalText; submitBtn.disabled = false; }
            form.reset();
            var modal = document.getElementById('lead-success-modal');
            if (modal) { modal.classList.add('active'); } else { alert("Заявка успешно отправлена!"); }
        }).catch(function(err) {
            console.error(err);
            if (submitBtn) { submitBtn.textContent = originalText; submitBtn.disabled = false; }
            var whatsappUrl = "https://wa.me/77067062157?text=" + encodeURIComponent(text);
            window.open(whatsappUrl, '_blank');
        });
    });
});

document.getElementById('hamburger')?.addEventListener('click', function(){ this.classList.toggle('open'); document.querySelector('.navlinks').classList.toggle('open'); });

