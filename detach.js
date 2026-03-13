const fs = require('fs');

try {
    let content = fs.readFileSync('index.html', 'utf8');

    // 1. Replace all tilda resources with local paths
    const regex = /https?:\/\/[a-zA-Z0-9.-]*tildacdn\.(com|info|pro)[^\s"'><\)]+/g;
    
    content = content.replace(regex, (url) => {
        if (url.match(/polyfil|fallback|lazyload|zero|events/)) return url;
        
        const urlObj = new URL(url);
        let filename = urlObj.pathname.split('/').pop();
        const ext = filename.split('.').pop().toLowerCase();
        
        let localFolder = "assets";
        if (ext === 'css') localFolder = 'css';
        else if (ext === 'js') localFolder = 'js';
        else if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ico'].includes(ext)) localFolder = 'img';
        else if (['woff', 'woff2', 'ttf', 'eot'].includes(ext)) localFolder = 'fonts';
        
        let replacement = `${localFolder}/${filename}`;
        replacement = replacement.replace("tilda-", "core-");
        return replacement;
    });

    // Replace local core references
    content = content.replace(/css\/tilda-/g, "css/core-");
    content = content.replace(/js\/tilda-/g, "js/core-");
    content = content.replace(/img\/tilda-/g, "img/core-");
    content = content.replace(/fonts\/tilda-/g, "fonts/core-");

    // Replace classes and attributes
    content = content.replace(/js-tilda-rule/g, "js-core-rule");
    content = content.replace(/data-tilda-rule/g, "data-core-rule");
    content = content.replace(/data-tilda-req/g, "data-core-req");
    content = content.replace(/tildaform:/g, "coreform:");

    // Remove tilda analytics
    content = content.replace(/<script[^>]*tilda-stat[^>]*>[\s\S]*?<\/script>/g, '');
    content = content.replace(/<script[^>]*>[\s\S]*?tildastat[\s\S]*?<\/script>/g, '');
    content = content.replace(/<iframe src="https:\/\/stat\.tildacdn\.com\/[^>]*><\/iframe>/g, '');
    content = content.replace(/<noscript><iframe src="https:\/\/stat\.tildacdn\.com[^>]*><\/iframe><\/noscript>/g, '');

    // 2. Inject APIX-DRIVE script
    const webhookUrl = "https://s7.apix-drive.com/web-hooks/33558/gejbseaq";
    const scriptToInject = `
<script>
document.addEventListener("DOMContentLoaded", function() {
    var form = document.getElementById("form1993423633");
    if (form) {
        form.addEventListener("submit", function(e) {
            e.preventDefault(); 
            var formData = new FormData(form);
            var submitBtn = form.querySelector('.t-submit');
            var originalText = "";
            if (submitBtn) {
                var textSpan = submitBtn.querySelector('.t-btnflex__text');
                if (textSpan) {
                    originalText = textSpan.innerText;
                    textSpan.innerText = "Отправка...";
                } else {
                    originalText = submitBtn.value || submitBtn.innerText;
                    submitBtn.value = "Отправка...";
                    submitBtn.innerText = "Отправка...";
                }
                submitBtn.disabled = true;
            }
            fetch("${webhookUrl}", {
                method: "POST",
                body: formData 
            })
            .then(function(response) {
                if (response.ok) {
                    var successUrl = form.getAttribute("data-success-url");
                    if (successUrl) {
                        window.location.href = successUrl;
                    } else {
                        alert("Заявка успешно отправлена!");
                        form.reset();
                    }
                } else {
                    alert("Ошибка отправки заявки (" + response.status + ")");
                }
            })
            .catch(function(error) {
                alert("Ошибка сети при отправке заявки.");
                console.error("Fetch error:", error);
            })
            .finally(function() {
                if (submitBtn) {
                    var textSpan = submitBtn.querySelector('.t-btnflex__text');
                    if (textSpan) {
                        textSpan.innerText = originalText;
                    } else {
                        submitBtn.value = originalText;
                        submitBtn.innerText = originalText;
                    }
                    submitBtn.disabled = false;
                }
            });
        });
    }
});
</script>
`;

    if (!content.includes("gejbseaq")) {
        content = content.replace("</body>", `${scriptToInject}\n</body>`);
    }

    fs.writeFileSync('index.html', content, 'utf8');
    console.log("Success");
} catch(e) {
    console.error(e);
}
