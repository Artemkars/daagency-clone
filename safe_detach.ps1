param (
    [string]$FileToProcess = "index.html"
)

$path = (Resolve-Path $FileToProcess).Path
$utf8NoBom = New-Object System.Text.UTF8Encoding $false

# Reading safely as UTF8
$content = [System.IO.File]::ReadAllText($path, $utf8NoBom)

# 1. Replace all tilda resources with local paths
$regex = 'https?://[a-zA-Z0-9.-]*tildacdn\.(com|info|pro)[^"''\s\)\>\]]+'
$matches = [regex]::Matches($content, $regex)

foreach ($match in $matches) {
    if ($match.Value -notmatch "polyfil|fallback|lazyload|zero|events") {
        $url = $match.Value
        $uri = [System.Uri]$url
        $filename = [System.IO.Path]::GetFileName($uri.AbsolutePath)
        
        $ext = [System.IO.Path]::GetExtension($filename).ToLower()
        $localFolder = "assets"
        if ($ext -match "^\.css(\?.*)?$") { $localFolder = "css" }
        elseif ($ext -match "^\.js(\?.*)?$") { $localFolder = "js" }
        elseif ($ext -match "^\.(png|jpg|jpeg|gif|svg|webp|ico)(\?.*)?$") { $localFolder = "img" }
        elseif ($ext -match "^\.(woff|woff2|ttf|eot)(\?.*)?$") { $localFolder = "fonts" }

        # Remove query parameters from filename if any
        $filename = $filename -replace '\?.*$', ''

        $replacement = "$localFolder/$filename"
        $replacement = $replacement -replace "tilda-", "core-"
        
        $content = $content.Replace($url, $replacement)
    }
}

# Also replace raw "js/tilda-..." to "js/core-..." for local references that were already there
$content = $content -replace "css/tilda-", "css/core-"
$content = $content -replace "js/tilda-", "js/core-"
$content = $content -replace "img/tilda-", "img/core-"
$content = $content -replace "fonts/tilda-", "fonts/core-"

# Replace classes and attributes
$content = $content -replace "js-tilda-rule", "js-core-rule"
$content = $content -replace "data-tilda-rule", "data-core-rule"
$content = $content -replace "data-tilda-req", "data-core-req"
$content = $content -replace "tildaform:", "coreform:"

# Remove tilda analytics
$content = $content -replace '<script[^>]*tilda-stat[^>]*>[\s\S]*?</script>', ''
$content = $content -replace '<script[^>]*>[\s\S]*?tildastat[\s\S]*?</script>', ''
$content = $content -replace '<iframe src="https://stat.tildacdn.com/[^>]*></iframe>', ''
$content = $content -replace '<noscript><iframe src="https://stat.tildacdn.com[^>]*></iframe></noscript>', ''


# 2. Inject APIX-DRIVE script
$WebhookUrl = "https://s7.apix-drive.com/web-hooks/33558/gejbseaq"
$scriptToInject = @"
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
            fetch("$WebhookUrl", {
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
"@

if ($content -notmatch "gejbseaq") {
    $content = $content -replace "(</body>)", "$scriptToInject`r`n`$1"
}

[System.IO.File]::WriteAllText($path, $content, $utf8NoBom)
Write-Host "Replaced successfully!"
