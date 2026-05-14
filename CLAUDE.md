# こんだて帖 — Claude への作業指示

## 設計書・レビューの厳守ルール（最優先）

**いかなる変更も、以下の順序を必ず守ること:**

```
1. basic-design.md を先に更新する
2. レビュー部にレビューを依頼し review-log/ に記録する
3. 承認後に実装する
4. 実装完了後、変更内容を git commit する
```

- 「小さい変更だから」「バグ修正だから」という例外はない
- コードを先に直して後で設計書を合わせることは禁止
- レビュー記録ファイル: `.company/projects/kondate-planning-system/review/review-log/YYYY-MM-DD-{部署}-{対象}.md`
- 設計書: `.company/projects/kondate-planning-system/engineering/basic-design.md`

## プロジェクト概要

AIが1週間分の献立を提案するWebアプリ。

- **フロント**: Next.js (Vercel) — `frontend/`
- **バックエンド**: FastAPI (Render) — `backend/`
- **AI**: Google Gemini API (`gemini-2.5-flash`、Thinking OFF)
- **ローカル**: `docker compose up -d`

## よく使うコマンド

```bash
# 起動
docker compose up -d

# バックエンドのみ再ビルド
docker compose up -d --build backend

# ログ確認
docker compose logs -f backend
```
