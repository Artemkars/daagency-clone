param (
    [string]$InputFile = "index.html",
    [string]$OutputFile = "index_new.html"
)

# 1. Create Directories if they don't exist
$dirs = @("css", "js", "img", "fonts", "assets")
foreach ($dir in $dirs) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir | Out-Null
    }
}

# 2. Rename existing local "tilda-" files to "core-"
$tildaFiles = Get-ChildItem -Path @("css", "js", "img", "fonts") -Filter "*tilda-*" -Recurse -File -ErrorAction SilentlyContinue
foreach ($file in $tildaFiles) {
    $newName = $file.Name -replace "tilda-", "core-"
    Rename-Item -Path $file.FullName -NewName $newName -ErrorAction SilentlyContinue
}

# 3. Process index.html line by line
$utf8NoBom = New-Object System.Text.UTF8Encoding $false
$reader = [System.IO.StreamReader]::new((Resolve-Path $InputFile).Path, $utf8NoBom)
$writer = [System.IO.StreamWriter]::new("$PWD\$OutputFile", $false, $utf8NoBom)

$WebhookUrl = "https://s7.apix-drive.com/web-hooks/33558/gejbseaq"
$scriptToInject = @"
<script>
document.addEventListener("DOMContentLoaded", function() {
    var form = document.querySelector("#form1993423633");
    if (!form) { 
        form = document.querySelector("form"); 
    }
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
$regexTildaUrl = 'https?://[a-zA-Z0-9.-]*?tildacdn\.(com|info|pro)[^"''\s\)\>\]]*'

while (($line = $reader.ReadLine()) -ne $null) {
    # Skip stat blocks
    if ($line -match '<script[^>]*tilda-stat') { $skipScripts = $true }
    if ($line -match '<script[^>]*>.*tildastat') { $skipScripts = $true }

    if ($skipScripts -and $line -match '</script>') {
        $skipScripts = $false
        continue
    }
    if ($skipScripts) { continue }

    if ($line -match '<script[^>]*tilda-stat[^>]*>.*</script>') { continue }
    if ($line -match '<script[^>]*>.*tildastat.*</script>') { continue }
    if ($line -match '<iframe src="https://stat.tildacdn.com[^>]*></iframe>') { continue }
    if ($line -match '<noscript><iframe src="https://stat.tildacdn.com[^>]*></iframe></noscript>') { continue }

    # Find and download assets
    if ($line -match $regexTildaUrl) {
        $matches = [regex]::Matches($line, $regexTildaUrl)
        foreach ($m in $matches) {
            $url = $m.Value
            $uri = [System.Uri]$url
            $filename = [System.IO.Path]::GetFileName($uri.AbsolutePath)
            $filename = [System.Web.HttpUtility]::UrlDecode($filename)
            $ext = [System.IO.Path]::GetExtension($filename).ToLower()
            
            $localFolder = "assets"
            if ($ext -match "^\.css(\?.*)?$") { $localFolder = "css" }
            elseif ($ext -match "^\.js(\?.*)?$") { $localFolder = "js" }
            elseif ($ext -match "^\.(png|jpg|jpeg|gif|svg|webp|ico)(\?.*)?$") { $localFolder = "img" }
            elseif ($ext -match "^\.(woff|woff2|ttf|eot)(\?.*)?$") { $localFolder = "fonts" }
            
            $filenameWithoutQuery = $filename -replace '\?.*$', ''
            $filenameWithoutQuery = $filenameWithoutQuery -replace "tilda-", "core-"
            
            $localPath = "$PWD\$localFolder\$filenameWithoutQuery"
            $replacement = "$localFolder/$filenameWithoutQuery"
            
            # Download if it doesn't exist
            if (-not (Test-Path $localPath)) {
                try {
                    Write-Host "Downloading: $url"
                    Invoke-WebRequest -Uri $url -OutFile $localPath -ErrorAction SilentlyContinue
                } catch {
                    Write-Host "Failed to download $url"
                }
            }
            
            $line = $line.Replace($url, $replacement)
        }
    }

    # Replace classes/attributes and local paths
    $line = $line -replace "css/tilda-", "css/core-"
    $line = $line -replace "js/tilda-", "js/core-"
    $line = $line -replace "img/tilda-", "img/core-"
    $line = $line -replace "fonts/tilda-", "fonts/core-"
    
    $line = $line -replace "js-tilda-rule", "js-core-rule"
    $line = $line -replace "data-tilda-rule", "data-core-rule"
    $line = $line -replace "data-tilda-req", "data-core-req"
    $line = $line -replace "tildaform:", "coreform:"
    
    # Inject APIX Drive at the end of body
    if ($line -match "</body>") {
        $line = $line.Replace("</body>", "$scriptToInject`r`n</body>")
    }

    $writer.WriteLine($line)
}

$reader.Close()
$writer.Close()

Move-Item -Path $OutputFile -Destination $InputFile -Force
Write-Host "Detachment Complete!"
