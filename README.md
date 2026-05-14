# こんだて帖 🍱

AIが1週間分の献立を自動で提案してくれるWebアプリです。
作りたい食事を選ぶだけで、買い物リストまで自動生成します。

![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)

**🌐 公開URL: https://kondate-planning-system.vercel.app/**

---

## 主な機能

- **献立自動生成** — 曜日×食事タイプ（朝・昼・夜）を選んでAIに任せる
- **人数設定** — 1〜6人分の食材量で生成
- **禁止食材** — 苦手な食材を指定して除外
- **好み設定** — 「和食中心」「魚多め」などの要望を反映
- **再生成** — 気に入らない料理だけ1コマ単位でやり直し
- **買い物リスト** — 献立からカテゴリ別に食材を自動集計
- **履歴管理** — 過去の献立を保存・復元・削除
- **レシピリンク** — クックパッド / クラシルへの検索リンク
- **画像表示** — Unsplash API連携（オプション）

---

## サーバー構成

```
ユーザー
  ↓
Vercel（フロントエンド）
  https://kondate-planning-system.vercel.app/
  ↓ API通信
Render（バックエンド）
  https://kondate-planning-system.onrender.com/
  ↓ AI生成
Google Gemini API（gemini-2.5-flash）
```

| レイヤー | サービス | 費用 |
|--------|---------|------|
| フロントエンド | [Vercel](https://vercel.com) Hobby プラン | 無料 |
| バックエンド | [Render](https://render.com) Free プラン | 無料 |
| AI | Google Gemini API 無料枠 | 無料 |

> **注意**: Render の無料プランはアクセスがない状態が15分続くとスリープします。
> 次のアクセス時に起動まで約30秒かかる場合があります。

---

## 技術スタック

| レイヤー | 技術 |
|--------|------|
| フロントエンド | Next.js 16 / TypeScript / Tailwind CSS |
| バックエンド | FastAPI / Python 3.12 |
| AI | Google Gemini API（gemini-2.5-flash） |
| ローカル開発 | Docker Compose |

---

## ローカルでのセットアップ

### 必要なもの

- Docker Desktop
- Google Gemini API キー（無料）→ https://aistudio.google.com/apikey

### 手順

```bash
# 1. リポジトリをクローン
git clone https://github.com/kabamodoki/kondate-planning-system.git
cd kondate-planning-system

# 2. 環境変数を設定
cp .env.example .env
# .env を開いて GEMINI_API_KEY に取得したキーを入力

# 3. 起動
docker compose up -d

# 4. ブラウザでアクセス
# http://localhost:3000
```

### Unsplash画像（オプション）

料理カードに写真を表示したい場合：

1. https://unsplash.com/developers でアプリを登録（無料）
2. Access Key を `.env` の `NEXT_PUBLIC_UNSPLASH_ACCESS_KEY=` に設定
3. `docker compose restart frontend`

設定しない場合は料理ジャンルに応じた絵文字が表示されます。

---

## 環境変数一覧

| 変数名 | 必須 | 説明 |
|--------|------|------|
| `GEMINI_API_KEY` | ✅ | Google Gemini API キー |
| `NEXT_PUBLIC_API_URL` | ✅ | バックエンドURL（ローカル: `http://localhost:8000`） |
| `NEXT_PUBLIC_UNSPLASH_ACCESS_KEY` | ー | Unsplash API キー（画像表示用・任意） |

---

## ライセンス

[MIT](./LICENSE) — 商用利用・改変・再配布すべて自由です。
ただし本ソフトウェアの使用によって生じたいかなる損害についても、作者は責任を負いません。
