# YmczMaps

「山と高原地図」風の配色でレンダリングする、PC ブラウザ向けフルスクリーン地図ビューア。
タイルは [国土地理院ベクトルタイル提供実験](https://github.com/gsi-cyberjapan/vector-tile-experiment)
（`experimental_bvmap`）を使用しています。

## ローカルで開く

ビルドは不要です。任意の静的サーバで配信してください。

```sh
# Python が入っていればこれだけで OK
python3 -m http.server 8000
# その後 http://localhost:8000/ を開く
```

`file://` で開くと ES Modules / CORS の都合で動かないため、必ず HTTP で配信してください。

## デプロイ

`main` ブランチへ push すると、GitHub Actions（`.github/workflows/deploy.yml`）が
GitHub Pages へ自動デプロイします。リポジトリ設定の **Settings → Pages → Build and deployment** で
**Source** を **GitHub Actions** に切り替えてください。

## 構成

- `index.html` — エントリポイント
- `assets/app.css` — UI スタイル
- `assets/app.js` — MapLibre 初期化とイベント
- `assets/style.js` — 山と高原地図風の MapLibre スタイル定義

## クレジット

- 地理院地図Vector（国土地理院ベクトルタイル提供実験）
- 地図描画: [MapLibre GL JS](https://maplibre.org/)
- 日本語グリフ: [glyphs.geolonia.com](https://github.com/geolonia/font-glyphs)

「山と高原地図」は昭文社の登録商標です。本プロジェクトは色合いを参考にしたものであり、
昭文社とは無関係です。
