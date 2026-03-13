import re
import os
import urllib.parse

def process_html(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Replace all tilda resources with local paths
    regex = r'https?://[a-zA-Z0-9.-]*tildacdn\.(com|info|pro)[^\s"' + "'" + r'\>\)]+'
    
    def replacer(match):
        url = match.group(0)
        if any(x in url for x in ['polyfil', 'fallback', 'lazyload', 'zero', 'events']):
            return url
            
        parsed = urllib.parse.urlparse(url)
        filename = os.path.basename(parsed.path)
        
        ext = os.path.splitext(filename)[1].lower()
        local_folder = "assets"
        if ext in ['.css']:
            local_folder = "css"
        elif ext in ['.js']:
            local_folder = "js"
        elif ext in ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.ico']:
            local_folder = "img"
        elif ext in ['.woff', '.woff2', '.ttf', '.eot']:
            local_folder = "fonts"
            
        replacement = f"{local_folder}/{filename}"
        replacement = replacement.replace("tilda-", "core-")
        return replacement

    content = re.sub(regex, replacer, content)

    # Replace local core references
    content = content.replace("css/tilda-", "css/core-")
    content = content.replace("js/tilda-", "js/core-")
    content = content.replace("img/tilda-", "img/core-")
    content = content.replace("fonts/tilda-", "fonts/core-")

    # Replace classes and attributes
    content = content.replace("js-tilda-rule", "js-core-rule")
    content = content.replace("data-tilda-rule", "data-core-rule")
    content = content.replace("data-tilda-req", "data-core-req")
    content = content.replace("tildaform:", "coreform:")

    # Remove tilda analytics
    content = re.sub(r'<script[^>]*tilda-stat[^>]*>.*?</script>', '', content, flags=re.DOTALL)
    content = re.sub(r'<script[^>]*>[\s\S]*?tildastat[\s\S]*?</script>', '', content, flags=re.DOTALL)
    content = re.sub(r'<iframe src="https://stat.tildacdn.com/[^>]*></iframe>', '', content)
    content = re.sub(r'<noscript><iframe src="https://stat.tildacdn.com[^>]*></iframe></noscript>', '', content)

    # 2. Inject APIX-DRIVE script
    webhook_url = "https://s7.apix-drive.com/web-hooks/33558/gejbseaq"
    script_to_inject = f"""
<script>
document.addEventListener("DOMContentLoaded", function() {{
    var form = document.getElementById("form1993423633");
    if (form) {{
        form.addEventListener("submit", function(e) {{
            e.preventDefault(); 
            var formData = new FormData(form);
            var submitBtn = form.querySelector('.t-submit');
            var originalText = "";
            if (submitBtn) {{
                var textSpan = submitBtn.querySelector('.t-btnflex__text');
                if (textSpan) {{
                    originalText = textSpan.innerText;
                    textSpan.innerText = "Отправка...";
                }} else {{
                    originalText = submitBtn.value || submitBtn.innerText;
                    submitBtn.value = "Отправка...";
                    submitBtn.innerText = "Отправка...";
                }}
                submitBtn.disabled = true;
            }}
            fetch("{webhook_url}", {{
                method: "POST",
                body: formData 
            }})
            .then(function(response) {{
                if (response.ok) {{
                    var successUrl = form.getAttribute("data-success-url");
                    if (successUrl) {{
                        window.location.href = successUrl;
                    }} else {{
                        alert("Заявка успешно отправлена!");
                        form.reset();
                    }}
                }} else {{
                    alert("Ошибка отправки заявки (" + response.status + ")");
                }}
            }})
            .catch(function(error) {{
                alert("Ошибка сети при отправке заявки.");
                console.error("Fetch error:", error);
            }})
            .finally(function() {{
                if (submitBtn) {{
                    var textSpan = submitBtn.querySelector('.t-btnflex__text');
                    if (textSpan) {{
                        textSpan.innerText = originalText;
                    }} else {{
                        submitBtn.value = originalText;
                        submitBtn.innerText = originalText;
                    }}
                    submitBtn.disabled = false;
                }}
            }});
        }});
    }}
}});
</script>
"""

    if "gejbseaq" not in content:
        content = content.replace("</body>", f"{script_to_inject}\n</body>")

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
        print("Success")

if __name__ == "__main__":
    process_html("index.html")
