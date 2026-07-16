param (
    [string]$InputFile = "index.html",
    [string]$OutputFile = "index_new.html"
)

$utf8NoBom = New-Object System.Text.UTF8Encoding $false
$reader = [System.IO.StreamReader]::new((Resolve-Path $InputFile).Path, $utf8NoBom)
$writer = [System.IO.StreamWriter]::new("$PWD\$OutputFile", $false, $utf8NoBom)

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

$skipScripts = $false
$skipStat = $false

while (($line = $reader.ReadLine()) -ne $null) {
    # Check if we are inside a tildastat script or iframe block to skip
    if ($line -match '<script[^>]*tilda-stat') { $skipScripts = $true }
    if ($line -match '<script[^>]*>.*tildastat') { $skipScripts = $true }

    if ($skipScripts -and $line -match '</script>') {
        $skipScripts = $false
        continue
    }
    if ($skipScripts) { continue }

    # Same for single-line tildastat scripts
    if ($line -match '<script[^>]*tilda-stat[^>]*>.*</script>') { continue }
    if ($line -match '<script[^>]*>.*tildastat.*</script>') { continue }
    if ($line -match '<iframe src="https://stat.tildacdn.com[^>]*></iframe>') { continue }
    if ($line -match '<noscript><iframe src="https://stat.tildacdn.com[^>]*></iframe></noscript>') { continue }

    # Replacements on the line
    if ($line -match 'https?://[a-zA-Z0-9.-]*tildacdn\.(com|info|pro)[^"''\s\)\>\]]+') {
        $matches = [regex]::Matches($line, 'https?://[a-zA-Z0-9.-]*tildacdn\.(com|info|pro)[^"''\s\)\>\]]+')
        foreach ($m in $matches) {
            $url = $m.Value
            if ($url -notmatch "polyfil|fallback|lazyload|zero|events") {
                $uri = [System.Uri]$url
                $filename = [System.IO.Path]::GetFileName($uri.AbsolutePath)
                $ext = [System.IO.Path]::GetExtension($filename).ToLower()
                
                $localFolder = "assets"
                if ($ext -match "^\.css(\?.*)?$") { $localFolder = "css" }
                elseif ($ext -match "^\.js(\?.*)?$") { $localFolder = "js" }
                elseif ($ext -match "^\.(png|jpg|jpeg|gif|svg|webp|ico)(\?.*)?$") { $localFolder = "img" }
                elseif ($ext -match "^\.(woff|woff2|ttf|eot)(\?.*)?$") { $localFolder = "fonts" }
                
                $filename = $filename -replace '\?.*$', ''
                $replacement = "$localFolder/$filename"
                $replacement = $replacement -replace "tilda-", "core-"
                
                $line = $line.Replace($url, $replacement)
            }
        }
    }

    $line = $line -replace "css/tilda-", "css/core-"
    $line = $line -replace "js/tilda-", "js/core-"
    $line = $line -replace "img/tilda-", "img/core-"
    $line = $line -replace "fonts/tilda-", "fonts/core-"
    
    $line = $line -replace "js-tilda-rule", "js-core-rule"
    $line = $line -replace "data-tilda-rule", "data-core-rule"
    $line = $line -replace "data-tilda-req", "data-core-req"
    $line = $line -replace "tildaform:", "coreform:"

    if ($line -match "</body>") {
        $line = $line.Replace("</body>", "$scriptToInject`r`n</body>")
    }

    $writer.WriteLine($line)
}

$reader.Close()
$writer.Close()

Move-Item -Path $OutputFile -Destination $InputFile -Force
Write-Host "Success Line-By-Line"
