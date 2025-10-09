#!/usr/bin/env python3
# tuoitre_scraper.py
# -*- coding: utf-8 -*-
"""
Simple scraper for tuoitre.vn:
- Start from a start URL (default: homepage)
- Collect links that belong to tuoitre.vn
- Visit each link and try to extract: title, published time, author, content
- Save all articles into a single TXT file (UTF-8), each article separated by a line
Usage:
    python tuoitre_scraper.py --start-url https://tuoitre.vn/ --max 50 --output articles.txt --delay 1.0
Dependencies:
    pip install requests beautifulsoup4 lxml tqdm
"""

import argparse
import time
import re
from urllib.parse import urljoin, urlparse
import requests
from bs4 import BeautifulSoup
from collections import deque
from tqdm import tqdm

HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; TUOITRE-Scraper/1.0; +https://example.com/bot)"
}

def fetch(url, session, timeout=15, max_retries=3):
    for attempt in range(max_retries):
        try:
            resp = session.get(url, headers=HEADERS, timeout=timeout)
            resp.raise_for_status()
            resp.encoding = resp.apparent_encoding or 'utf-8'
            return resp.text
        except requests.RequestException as e:
            wait = 1 + attempt * 2
            print(f"[WARN] fetch failed ({e}) — retry in {wait}s ({attempt+1}/{max_retries})")
            time.sleep(wait)
    print(f"[ERROR] Failed to fetch {url} after {max_retries} attempts.")
    return None

def collect_links(html, base_url):
    """Collect absolute links pointing to same domain as base_url."""
    soup = BeautifulSoup(html, "lxml")
    base_domain = urlparse(base_url).netloc
    links = set()
    for a in soup.find_all("a", href=True):
        href = a["href"].strip()
        if href.startswith("javascript:") or href.startswith("#"):
            continue
        abs_url = urljoin(base_url, href)
        parsed = urlparse(abs_url)
        if parsed.netloc and parsed.netloc.endswith(base_domain):
            # filter out some obvious non-article paths (optional)
            links.add(abs_url.split("#")[0].split("?")[0])
    return links

def extract_article(html, url):
    soup = BeautifulSoup(html, "lxml")

    # Title: try common selectors
    title = None
    title_selectors = [
        ("meta", {"property": "og:title"}),
        ("meta", {"name": "twitter:title"}),
        ("h1", {}),
        ("title", {})
    ]
    for sel in title_selectors:
        tag = soup.find(*sel) if isinstance(sel, tuple) else None
        if sel[0] == "meta":
            m = soup.find("meta", attrs=sel[1])
            if m and m.get("content"):
                title = m.get("content").strip()
                break
        else:
            t = soup.find(sel[0], sel[1])
            if t and t.get_text(strip=True):
                title = t.get_text(strip=True)
                break

    # Published time: meta og:pubdate / article:published_time / time tag
    pub_time = None
    for meta_name in ("article:published_time", "og:article:published_time", "og:pubdate"):
        m = soup.find("meta", attrs={"property": meta_name}) or soup.find("meta", attrs={"name": meta_name})
        if m and m.get("content"):
            pub_time = m.get("content").strip()
            break
    if not pub_time:
        ttag = soup.find("time")
        if ttag and (ttag.get("datetime") or ttag.get_text(strip=True)):
            pub_time = ttag.get("datetime") or ttag.get_text(strip=True)

    # Author: try common selectors
    author = None
    author_selectors = [
        ("meta", {"name": "author"}),
        ("meta", {"property": "article:author"}),
        ("span", {"class": re.compile(r"author|tacgia|name", re.I)}),
        ("p", {"class": re.compile(r"author|tacgia", re.I)}),
        ("div", {"class": re.compile(r"author|tacgia", re.I)})
    ]
    for sel in author_selectors:
        if sel[0] == "meta":
            m = soup.find("meta", attrs=sel[1])
            if m and m.get("content"):
                author = m.get("content").strip()
                break
        else:
            found = soup.find(sel[0], sel[1])
            if found and found.get_text(strip=True):
                author = found.get_text(strip=True)
                break

    # Content: try some known containers historically used by many VN news sites
    content = ""
    content_selectors = [
        {"name": "div", "attrs": {"class": re.compile(r"fck_detail|content|detail|article-body|main-article", re.I)}},
        {"name": "article", "attrs": {}},
        {"name": "div", "attrs": {"itemprop": "articleBody"}},
        {"name": "div", "attrs": {"id": re.compile(r"main-content|content", re.I)}}
    ]
    for sel in content_selectors:
        try:
            node = soup.find(sel["name"], sel["attrs"])
        except Exception:
            node = None
        if node:
            # remove scripts, ads, captions, figure tags
            for bad in node.find_all(["script", "style", "aside", "figure", "figcaption", "iframe", "noscript"]):
                bad.decompose()
            paragraphs = [p.get_text(" ", strip=True) for p in node.find_all(["p", "h2", "h3", "li"]) if p.get_text(strip=True)]
            if paragraphs:
                content = "\n\n".join(paragraphs)
                break

    # fallback: gather visible <p> in whole page (last resort)
    if not content:
        paragraphs = [p.get_text(" ", strip=True) for p in soup.find_all("p") if p.get_text(strip=True)]
        if paragraphs:
            content = "\n\n".join(paragraphs[:50])  # limit to avoid extremely long noise

    # Clean whitespace
    title = title or ""
    pub_time = pub_time or ""
    author = author or ""
    content = content or ""

    return {
        "url": url,
        "title": title.strip(),
        "published": pub_time.strip(),
        "author": author.strip(),
        "content": content.strip()
    }

def save_articles_txt(articles, output_path):
    sep = "\n" + "="*100 + "\n\n"
    with open(output_path, "w", encoding="utf-8") as f:
        for i, art in enumerate(articles, 1):
            f.write(f"ARTICLE #{i}\n")
            f.write(f"URL: {art.get('url','')}\n")
            f.write(f"Title: {art.get('title','')}\n")
            f.write(f"Published: {art.get('published','')}\n")
            f.write(f"Author: {art.get('author','')}\n\n")
            f.write(art.get("content","") + "\n")
            f.write(sep)
    print(f"[INFO] Saved {len(articles)} articles to {output_path}")

def main():
    parser = argparse.ArgumentParser(description="Simple tuoitre.vn scraper -> TXT")
    parser.add_argument("--start-url", default="https://tuoitre.vn/", help="Start URL (homepage or section).")
    parser.add_argument("--max", type=int, default=100, help="Max number of articles to fetch.")
    parser.add_argument("--output", default="tuoitre_articles.txt", help="Output txt file path.")
    parser.add_argument("--delay", type=float, default=1.0, help="Delay between requests in seconds.")
    args = parser.parse_args()

    session = requests.Session()
    visited = set()
    to_visit = deque()
    start_html = fetch(args.start_url, session)
    if not start_html:
        print("[ERROR] Could not fetch start URL. Exiting.")
        return
    # initial queue: links found on start page
    start_links = collect_links(start_html, args.start_url)
    for link in start_links:
        to_visit.append(link)

    articles = []
    pbar = tqdm(total=args.max, desc="Articles", unit="art")

    while to_visit and len(articles) < args.max:
        url = to_visit.popleft()
        if url in visited:
            continue
        # simple filter: only process plausible article URLs (heuristic)
        if url.endswith((".jpg", ".png", ".gif", ".css", ".js")):
            visited.add(url)
            continue
        visited.add(url)
        html = fetch(url, session)
        if not html:
            continue

        # Try to detect whether this is an article page: presence of <h1> or meta article tag
        soup = BeautifulSoup(html, "lxml")
        is_article = bool(soup.find("h1") or soup.find("meta", attrs={"property": "article:published_time"}) or soup.find("div", class_=re.compile(r"fck_detail|article-body|detail", re.I)))
        if not is_article:
            # collect more links from this page to expand crawling
            more = collect_links(html, args.start_url)
            for m in more:
                if m not in visited and m not in to_visit:
                    to_visit.append(m)
            continue

        article = extract_article(html, url)
        # crude check: must have title and some content
        if article["title"] and len(article["content"]) > 50:
            articles.append(article)
            pbar.update(1)
        else:
            # maybe not a full article; try to expand links found here
            more = collect_links(html, args.start_url)
            for m in more:
                if m not in visited and m not in to_visit:
                    to_visit.append(m)

        time.sleep(args.delay)

    pbar.close()
    save_articles_txt(articles, args.output)
    print("[DONE]")

if __name__ == "__main__":
    main()
