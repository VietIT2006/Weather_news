import json
import re

input_file = r"D:/weather_forecast/test/getData/getNews/tuoitre_articles.txt"

output_file = "D:/weather_forecast/test/getData/getNews/tuoitre_articles.json"


articles = []
with open(input_file, "r", encoding="utf-8") as f:
    text = f.read()

# tách các bài bằng dấu "ARTICLE #"
parts = re.split(r"ARTICLE #\d+", text)
for part in parts:
    part = part.strip()
    if not part:
        continue
    url = re.search(r"URL:\s*(.+)", part)
    title = re.search(r"Title:\s*(.+)", part)
    published = re.search(r"Published:\s*(.+)", part)
    author = re.search(r"Author:\s*(.+)", part)
    content_split = part.split("Author:", 1)
    if len(content_split) > 1:
        content = content_split[1].split("=" * 100)[0].strip()
    else:
        content = part.strip()

    articles.append({
        "url": url.group(1).strip() if url else "",
        "title": title.group(1).strip() if title else "",
        "published": published.group(1).strip() if published else "",
        "author": author.group(1).strip() if author else "",
        "content": content
    })

with open(output_file, "w", encoding="utf-8") as f:
    json.dump(articles, f, ensure_ascii=False, indent=2)

print(f"[OK] Đã chuyển {len(articles)} bài từ TXT sang JSON → {output_file}")
