<div align="center">

<img src=".github/media/banner.webp" alt="ニピット・ウォンシリクン — インタラクティブ・ゲーム履歴書" width="100%">

[English](README.md) · **日本語** · [ไทย](README.th.md)

### ▶ [**gatipnw.github.io**](https://gatipnw.github.io/) — ブラウザですぐ遊べます

[![Live](https://img.shields.io/badge/live-gatipnw.github.io-e5484d?style=flat-square)](https://gatipnw.github.io/)
![Vanilla JS](https://img.shields.io/badge/vanilla-JS%20%2B%20Canvas%202D-d9a441?style=flat-square)
![No build step](https://img.shields.io/badge/build%20step-none-101226?style=flat-square)
![i18n](https://img.shields.io/badge/i18n-TH%20%C2%B7%20EN%20%C2%B7%20JA-4a6fa5?style=flat-square)
![Frame budget](https://img.shields.io/badge/render-1.2ms%2Fframe-3f8f5f?style=flat-square)

</div>

---

**ニピット・ウォンシリクン（愛称：ガティップ）**と申します。日本語・英語からタイ語への
ゲームローカライズを専門としています。PDF を送る代わりに、歩き回れる小さなゲームを作りました。
部屋にあるアーケード筐体・本棚・屋台のひとつひとつが、実績のひとつひとつに対応しています。

<div align="center">
  <img src=".github/media/demo.webp" alt="筐体に近づいて実績パネルを開くところ" width="100%">
  <sub>筐体に近づく → ラベルが光る → <kbd>E</kbd> キーで開く。ゾーンは全部で 14 個あります。</sub>
</div>

## 部屋の中にあるもの

| | |
|:--|:--|
| <img src=".github/media/shot-title.webp" alt="タイトル画面"> **タイトル** — スタジオは月の中にあり、イントロでそこまで飛んでいきます | <img src=".github/media/shot-room.webp" alt="スタジオ"> **スタジオ** — 14 個のオブジェクトがそれぞれ実績のゾーンです |
| <img src=".github/media/shot-panel.webp" alt="コンテンツパネル"> **パネル** — 和紙風のカードにスライド・数値・リンクを掲載 | <img src=".github/media/shot-resume.webp" alt="履歴書モード"> **履歴書モード** — 読むだけで済ませたい方向けの通常の HTML ページ |

<div align="center">
  <img src=".github/media/shot-mobile.webp" alt="モバイル表示とフローティングジョイスティック" width="240">
  <br><sub>タッチ端末では指の位置に追従するアナログスティックを表示。横幅 360px から対応しています。</sub>
</div>

## この作りにした理由

**このサイト自体がポートフォリオです。** 「言語的な細部にこだわる」と書くだけの職務経歴書ではなく、
実際に見ていただけるものにしました。

- **3 言語すべてが「本物のロケール」です。** 文字列はすべて
  [`js/data/content.js`](js/data/content.js) と [`js/i18n.js`](js/i18n.js) にまとまっており、
  マークアップへのハードコーディングはありません。HUD から切り替えるとリロードなしで
  開いているパネルまで再描画され、選択は `localStorage` に保存、初回は
  `navigator.language` から推定します。
- **日本語版は「翻訳」ではなく「作り直し」です。** 日本語版は一般的な職務経歴書の構成
  ——職務経歴 → 実績 → 活かせる経験・知識・技術 → 学歴 → コンタクト——に沿っており、
  タイ語版・英語版とは並び順そのものが違います。セクション構成はロケールごとのデータ
  （`resume.groups`）として持たせており、共通テンプレートの流用ではありません。
  日本の採用担当の方に一番見ていただきたいのはこの部分です。
- **遊ばなくても読めます。** 履歴書モードは普通のスクロール HTML で、タイトル画面から直接開け、
  スクリーンリーダーでも読めます。`@media print` も入れてあるので、Ctrl+P でそのまま
  きれいな PDF になります（背景が真っ黒にならないようにしてあります）。
- **演出はオフを前提に設計。** エフェクトは `prefers-reduced-motion` を尊重し、
  静止状態でも見栄えするようにした上で、フルエフェクト用の ✨ ボタンを別途用意しています。

## 技術

HTML + CSS + **バニラ JavaScript（ES モジュール）+ Canvas 2D**。フレームワーク・バンドラー・
ビルド工程はなく、実行時の依存も Google Fonts のみ（フォールバックあり）。
静的ホスティングにフォルダごと置けば動きます。

60fps を予算として管理しており、`renderer.draw` は 1 フレームあたり
**中央値 1.2ms・p95 2.1ms**（CDP 計測、1416×761）です。維持のためのルール:

- 描画ループ内で `ctx.shadowBlur` を使わない（発光はスプライトとして事前生成）
- グラデーションは起動時に一度だけ生成し、毎フレーム作らない
- 毎フレームのオブジェクト／配列生成をしない。`requestAnimationFrame` は 1 本のみ、デルタタイム制御
- タブが非表示になったらループを完全に停止

夜景・室内のライティング・スプライト・実績スライドは、すべて [`tools/`](tools/) 配下の
Python スクリプト（numpy + pillow、シード固定）で生成しています。この README の画像も同様で、
[`tools/gh_media.py`](tools/gh_media.py) が CDP でヘッドレスブラウザを操作し、バナー・
スクリーンショット・上のアニメーションを実際のゲーム画面から取得しています。

## 構成

```
index.html · css/style.css
js/     main.js · i18n.js · audio.js
        engine/  camera · input · collision · particles · renderer
        world/   player · objects · map
        ui/      title（イントロ）· panels · resume
        data/    content.js   ← 3 言語ぶんの文章はすべてここに集約
assets/ 画像・音声・PDF（tools/ で生成）
tools/  Python 生成スクリプト: 背景・スプライト・ロゴ・スライド・README 用メディア
```

## ローカルでの実行

```bash
python tools/serve.py     # → http://localhost:8123
```

## クレジット

- 音楽: **「3:03 PM」しゃろう** — 作者が公開している利用条件に従って使用しています。
- 掲載している企業・団体のロゴは各社の商標です。関わった仕事を示す目的でのみ掲載しています。
- コードは MIT ライセンス。文章・イラスト・個人情報は対象外です（[LICENSE](LICENSE) 参照）。
