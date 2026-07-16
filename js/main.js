// Конфигурация API для отправки заявок в чат (Telegram / CRM)
// Укажите URL вашего вебхука. Если оставить пустым, сайт автоматически перенаправит в WhatsApp.
const FORM_ENDPOINT = "https://script.google.com/macros/s/AKfycbxp18amN9Fjx-83OH-lGUbtWdzjyhJNTk1xVcJtpBaKlHMnkhs_wlTMdzVIDPADQc1R/exec"; 

// Резервный номер телефона для WhatsApp отправки
const WHATSAPP_FALLBACK_NUMBER = "77067062157";

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
  }, { threshold: 0.01 });
  items.forEach(function(item) {
    observer.observe(item);
  });
})();

// Анимация счетчиков (Counter animation)
(function(){
  var counters = document.querySelectorAll('.counter');
  if(!counters.length) return;
  
  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if(entry.isIntersecting) {
        animateCounters();
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.01 });
  
  var statsStrip = document.querySelector('.stats-strip');
  if(statsStrip) {
    observer.observe(statsStrip);
  } else {
    counters.forEach(function(c) { observer.observe(c); });
  }
  
  function animateCounters() {
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
    
    // Дополнительная анимация увеличения клиентов до 26+ при скролле
    var incremented = false;
    function triggerIncrement26() {
      if (incremented) return;
      incremented = true;
      setTimeout(function() {
        var el = document.getElementById('clients-counter');
        if (el) {
          var start = 25;
          var target = 26;
          var duration = 800;
          var startTime = null;
          function tick(ts) {
            if (!startTime) startTime = ts;
            var progress = Math.min((ts - startTime) / duration, 1);
            var currentVal = Math.floor(start + progress * (target - start));
            el.textContent = currentVal + "+";
            if (progress < 1) requestAnimationFrame(tick);
          }
          requestAnimationFrame(tick);
        }
      }, 1500); // 1.5s delay after stats animate in
    }

    window.addEventListener('scroll', function() {
      if (!incremented && statsStrip) {
        var rect = statsStrip.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          triggerIncrement26();
        }
      }
    });
  }
})();

// Единый перехватчик форм для безопасной отправки в Telegram/WhatsApp
document.querySelectorAll('form').forEach(function(form) {
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Защита от спама (Honey-pot)
    var honey = form.querySelector('[name="honeypot"]') ? form.querySelector('[name="honeypot"]').value : '';
    if (honey) {
      console.warn("Spam submission blocked.");
      return;
    }
    
    var name = form.querySelector('[name="text_name"]') ? form.querySelector('[name="text_name"]').value : '';
    var phone = form.querySelector('[name="text_phone"]') ? form.querySelector('[name="text_phone"]').value : '';
    var message = form.querySelector('[name="text_message"]') ? form.querySelector('[name="text_message"]').value : '';
    var packageChoice = form.querySelector('[name="text_package"]') ? form.querySelector('[name="text_package"]').value : '';
    var site = form.querySelector('[name="text_site"]') ? form.querySelector('[name="text_site"]').value : '';
    var niche = form.querySelector('[name="text_niche"]') ? form.querySelector('[name="text_niche"]').value : '';
    var service = form.querySelector('[name="text_service"]') ? form.querySelector('[name="text_service"]').value : '';
    
    // Формируем текст сообщения
    var text = "Новая заявка с сайта DA Agency:\n";
    if (name) text += "Имя: " + name + "\n";
    if (phone) text += "Телефон: " + phone + "\n";
    if (service) text += "Услуга: " + service + "\n";
    if (packageChoice) text += "Пакет: " + packageChoice + "\n";
    if (site) text += "Сайт/Инстаграм: " + site + "\n";
    if (niche) text += "Ниша: " + niche + "\n";
    if (message) text += "Описание: " + message + "\n";
    
    var submitBtn = form.querySelector('[type="submit"]') || form.querySelector('button');
    var originalText = submitBtn ? submitBtn.textContent : 'Отправить';
    
    if (FORM_ENDPOINT) {
      if (submitBtn) {
        submitBtn.textContent = "Отправка...";
        submitBtn.disabled = true;
      }
      
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
      
      fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })
      .then(function(res) {
        if (submitBtn) {
          submitBtn.textContent = originalText;
          submitBtn.disabled = false;
        }
        form.reset();
        
        // Показываем красивое модальное окно об успешной отправке
        var modal = document.getElementById('lead-success-modal');
        if (modal) {
          modal.classList.add('active');
        } else {
          alert("Спасибо! Ваша заявка успешно отправлена.");
        }
      })
      .catch(function(err) {
        console.error("API error, falling back to WhatsApp:", err);
        if (submitBtn) {
          submitBtn.textContent = originalText;
          submitBtn.disabled = false;
        }
        // В случае падения API отправляем в WhatsApp
        var whatsappUrl = "https://wa.me/" + WHATSAPP_FALLBACK_NUMBER + "?text=" + encodeURIComponent(text);
        window.open(whatsappUrl, '_blank');
      });
    } else {
      // Откат по умолчанию на WhatsApp
      var whatsappUrl = "https://wa.me/" + WHATSAPP_FALLBACK_NUMBER + "?text=" + encodeURIComponent(text);
      window.open(whatsappUrl, '_blank');
    }
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

