"use strict";

// dist:publish sonrası çalışır: GitHub'da draft kalmış en yeni release'i
// published durumuna çevirir. Böylece electron-builder her seferinde taslak
// (draft) açtığında bile arkadaşların uygulaması güncellemeyi görebilir.

const https = require("https");

const OWNER = "OmerTTech";
const REPO = "All1page";
const TOKEN = process.env.GH_TOKEN;

if (!TOKEN) {
  console.error("HATA: GH_TOKEN bulunamadı. setx GH_TOKEN 'ghp_...' ile tanımlayın.");
  process.exit(1);
}

function request(method, urlPath, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        method,
        host: "api.github.com",
        path: urlPath,
        headers: {
          Authorization: "token " + TOKEN,
          "User-Agent": OWNER + "-publish",
          Accept: "application/vnd.github+json",
          ...(body ? { "Content-Type": "application/json" } : {}),
        },
      },
      (res) => {
        let data = "";
        res.on("data", (c) => (data += c));
        res.on("end", () => {
          let json = null;
          try {
            json = JSON.parse(data);
          } catch {
            /* boş yanıt */
          }
          resolve({ status: res.statusCode, json });
        });
      }
    );
    req.on("error", reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

(async () => {
  // 1) Release'leri listele
  const list = await request(
    "GET",
    `/repos/${OWNER}/${REPO}/releases?per_page=30`
  );
  if (!Array.isArray(list.json)) {
    console.error("Release listesi çekilemedi:", list.status);
    process.exit(1);
  }

  const drafts = list.json.filter((r) => r.draft === true);
  if (drafts.length === 0) {
    console.log("Draft release yok — her şey yayımlanmış.");
    process.exit(0);
  }

  // 2) En yeni taslağı yayımla
  const latestDraft = drafts[0];
  const res = await request(
    "PATCH",
    `/repos/${OWNER}/${REPO}/releases/${latestDraft.id}`,
    { draft: false }
  );

  if (res.status !== 200) {
    console.error("Yayımla başarısız:", res.status, JSON.stringify(res.json));
    process.exit(1);
  }

  console.log(
    `✅ Taslak yayımlandı: ${latestDraft.tag_name} → ${res.json.html_url}`
  );
})();