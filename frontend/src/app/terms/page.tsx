export default function TermsPage() {
  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-extrabold text-warm-900 mb-2">利用規約</h1>
      <p className="text-xs text-warm-400 mb-8">最終更新: 2026年5月16日</p>

      <div className="space-y-6 text-sm text-warm-700 leading-relaxed">
        <section>
          <h2 className="font-bold text-warm-900 mb-2">1. 免責事項</h2>
          <p>
            本サービスは現状有姿で提供されます。サービスの利用によって生じたいかなる損害（献立の内容、アレルギー、体調不良等を含む）についても、運営者は一切の責任を負いません。AIが提案する献立はあくまで参考情報としてご利用ください。
          </p>
        </section>

        <section>
          <h2 className="font-bold text-warm-900 mb-2">2. サービスの可用性</h2>
          <p>
            本サービスは無料のクラウドインフラおよびAI APIの無料枠を利用して運営しています。そのため、以下の状況が発生する場合があります。
          </p>
          <ul className="mt-2 space-y-1 list-disc list-inside text-warm-600">
            <li>本サービスには1日あたりの生成枠が設けられており、枠が上限に達した場合は翌日までご利用いただけなくなることがあります</li>
            <li>同一ネットワーク（IPアドレス）からの献立生成は1時間あたり3回、個別更新は1日あたり5回まで利用できます</li>
            <li>サーバーがスリープ状態のとき、初回応答に時間がかかることがあります</li>
            <li>メンテナンスや障害によりサービスが利用できない場合があります</li>
          </ul>
          <p className="mt-2">これらによるサービスの中断・停止について、運営者は責任を負いません。</p>
        </section>

        <section>
          <h2 className="font-bold text-warm-900 mb-2">3. 利用上のお願い</h2>
          <p>
            本サービスは無料枠で運営しているため、過度な連続リクエストや自動化ツールによる大量アクセスはご遠慮ください。他のユーザーが快適に利用できるよう、節度ある使い方をお願いします。
          </p>
        </section>

        <section>
          <h2 className="font-bold text-warm-900 mb-2">4. 利用の自由</h2>
          <p>
            本サービスはどなたでも無料でご利用いただけます。個人利用・商用利用を問いません。ソースコードは MIT ライセンスのもと
            <a
              href="https://github.com/kabamodoki/kondate-planning-system"
              target="_blank"
              rel="noopener noreferrer"
              className="text-terra underline mx-1"
            >
              GitHub
            </a>
            で公開しています。
          </p>
        </section>

        <section>
          <h2 className="font-bold text-warm-900 mb-2">5. 広告・アフィリエイトについて</h2>
          <p>
            本サービスは、Amazonアソシエイト・プログラムおよびその他のアフィリエイトプログラムに参加しています。
            本サービス内に表示されるリンクの一部はアフィリエイトリンクであり、リンク経由でご購入いただいた場合に運営者が報酬を受け取ることがあります。
            お客様の購入価格には影響しません。「PR」「Amazon PR」と表記されているリンクがアフィリエイトリンクです。
          </p>
        </section>

        <section>
          <h2 className="font-bold text-warm-900 mb-2">6. AIサービスの利用について</h2>
          <p>
            本サービスは献立の生成に Google の Gemini API を使用しています。献立生成時に入力された情報（人数・禁止食材・好み・予算）は Google のサーバーに送信され、AI による処理が行われます。
            送信されるデータに個人情報は含まれず、生成結果の取得のみを目的とします。
            Google の AI サービスの利用規約・プライバシーポリシーについては
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-terra underline mx-1"
            >
              Google プライバシーポリシー
            </a>
            をご確認ください。
          </p>
        </section>

        <section>
          <h2 className="font-bold text-warm-900 mb-2">7. 規約の変更</h2>
          <p>
            本規約は予告なく変更する場合があります。変更後も本サービスを利用した場合、変更後の規約に同意したものとみなします。
          </p>
        </section>
      </div>
    </div>
  );
}
