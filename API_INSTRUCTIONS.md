# Инструкция по настройке и безопасности формы отправки заявок (DA Agency)

Для обеспечения безопасности и предотвращения уязвимостей (таких как кража токенов ботов спамерами) в custom HTML-коде **нельзя напрямую указывать токен Telegram-бота**. Любой посетитель сайта сможет открыть исходный код страницы в браузере, скопировать токен и получить контроль над вашим ботом.

Поэтому мы реализовали **безопасный гибридный подход**:
1. На сайте все формы отправляют заявку методом `fetch` (асинхронно) на центральный защищенный адрес (`FORM_ENDPOINT`).
2. Если `FORM_ENDPOINT` пустой, сайт автоматически перенаправляет в WhatsApp (как было раньше) в качестве надежного резервного канала.
3. Добавлено скрытое поле-ловушка (`honeypot`) для автоматической блокировки спам-ботов.

Ниже описаны два надежных и бесплатных способа связать формы нового сайта с вашим Telegram-чатом.

---

## Вариант 1: Использование Google Apps Script (Рекомендуемый и 100% бесплатный)

Google Таблицы и скрипты служат отличным, надежным и безопасным шлюзом (прокси-сервером), который скрывает токен бота.

### Шаг 1: Создайте Google-скрипт
1. Перейдите в [Google Диск](https://drive.google.com/) и создайте пустую **Google Таблицу**.
2. В верхнем меню выберите **Расширения** -> **Apps Script** (Extensions -> Apps Script).
3. Удалите весь шаблонный код и вставьте следующий скрипт:

```javascript
// Вставьте сюда ваши реальные данные Telegram
var TELEGRAM_BOT_TOKEN = "ВАШ_ТОКЕН_БОТА";
var TELEGRAM_CHAT_ID = "ВАШ_CHAT_ID";

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    
    // Формируем красивое сообщение для Telegram
    var text = "🔥 *Новая заявка с сайта DA Agency*\\n\\n" +
               "👤 *Имя:* " + (data.name || "Не указано") + "\\n" +
               "📞 *Телефон:* " + (data.phone || "Не указано") + "\\n" +
               "💼 *Услуга:* " + (data.service || "Не указана") + "\\n" +
               "📦 *Пакет:* " + (data.packageChoice || "Не выбран") + "\\n" +
               "🌐 *Сайт/Инстаграм:* " + (data.site || "Не указан") + "\\n" +
               "📈 *Ниша:* " + (data.niche || "Не указана") + "\\n" +
               "💬 *Описание:* " + (data.message || "Нет");
               
    // Отправляем запрос к Telegram API
    var url = "https://api.telegram.org/bot" + TELEGRAM_BOT_TOKEN + "/sendMessage";
    var payload = {
      "chat_id": TELEGRAM_CHAT_ID,
      "text": text,
      "parse_mode": "Markdown"
    };
    
    var options = {
      "method": "post",
      "contentType": "application/json",
      "payload": JSON.stringify(payload)
    };
    
    UrlFetchApp.fetch(url, options);
    
    // Записываем лид в таблицу (для дублирования и надежности)
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    sheet.appendRow([
      new Date(),
      data.name,
      data.phone,
      data.service,
      data.packageChoice,
      data.site,
      data.niche,
      data.message
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({"status": "success"}))
                         .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({"status": "error", "message": error.toString()}))
                         .setMimeType(ContentService.MimeType.JSON);
  }
}
```

### Шаг 2: Опубликуйте скрипт как Веб-приложение
1. Нажмите кнопку **Начать развертывание** (Deploy) -> **Новое развертывание** (New deployment) в правом верхнем углу.
2. Нажмите на значок шестеренки и выберите **Веб-приложение** (Web app).
3. Настройте параметры:
   * **Описание:** `DA Agency Leads Webhook`
   * **Запуск от имени:** *Вы* (Ваш аккаунт Google)
   * **У кого есть доступ:** *Все* (Anyone) — это важно, чтобы ваш сайт мог отправлять данные.
4. Нажмите **Развернуть** (Deploy) и подтвердите разрешения для доступа к Google Таблицам и внешним запросам.
5. Скопируйте полученный **URL веб-приложения** (например, `https://script.google.com/macros/s/.../exec`).

### Шаг 3: Пропишите URL в JS-код сайта
1. Откройте файл `js/main.js` на сайте.
2. В самой первой строке найдите константу:
   ```javascript
   const FORM_ENDPOINT = "";
   ```
3. Замените её на полученный URL:
   ```javascript
   const FORM_ENDPOINT = "https://script.google.com/macros/s/.../exec";
   ```
4. Сохраните файл. Все заявки со всех страниц теперь будут беззвучно записываться в Google Таблицу и моментально прилетать вам в Telegram-чат с красивым форматированием! При этом пользователи увидят современное анимированное всплывающее окно успеха.

---

## Вариант 2: Использование внешних сервисов (FormSubmit.co / Formspree)
Если вы не хотите создавать Google Script, вы можете использовать бесплатный сервис FormSubmit:
1. Замените `FORM_ENDPOINT` в `js/main.js` на:
   `const FORM_ENDPOINT = "https://formsubmit.co/ajax/ВАША_ПОЧТА@gmail.com";`
2. При первой отправке на почту придет письмо с подтверждением активации.
3. После подтверждения все заявки будут прилетать на вашу почту, а оттуда их можно автоматически перенаправлять в Telegram/WhatsApp с помощью почтовых ботов.
