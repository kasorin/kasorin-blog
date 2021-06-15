---
title: Slay the Spireのラン情報共有Webアプリを作る（プロトタイプ編）
published: false
---
# What?

[Slay the Spire](https://store.steampowered.com/app/646570/Slay_the_Spire/?l=japanese)というゲームがあります。このゲーム自体の紹介については[「ぶっ壊れてるのにバランスが取れてる！ なんで？ 『Slay the Spire』の神調整が生む快楽に今すぐ溺れてほしい」](https://news.denfaminicogamer.jp/kikakuthetower/210329a)を紹介するにとどめます。

このゲームはプレイするたびに毎回異なるマップを相手にすることになり、広く適用できるおおまかな攻略の方針はあるものの、基本的には個別の状況での最適な選択は容易に導き出せるものではなく、安定した勝利は膨大な数の周回プレイの果てに得られるものとなっています。

そういったゲーム性から、自分だけでなく他のプレイヤーのプレイ記録を参照したいというのは自然な発想です。その需要を満たしていたのが[Spirelogs.com](https://spirelogs.com/)です。このサイトはユーザーによるプレイ記録の投稿・検索・統計情報の閲覧機能を備えた優れたサイトでしたが、2020年7月からアップデートがなく、また私がSlay the Spire攻略に必要だと考えるいくつかの機能もなく、さらに開発へのコミットは受け付けていないという状態でした。

というわけでザ・車輪の再発明だという自覚はありますが、私が求めるSlay the Spire攻略サイトを作りたいと思います。まずプロトタイプ版として、最低限のプレイ記録の投稿・閲覧ができるミニマルなものを作っていきましょう。

# 構成

- TypeScript
- React
- Next.js
- Firestore
- Vercel

# 選定理由

## TypeScript/React/Next.js/Vercel

今の所持ち合わせているフロントエンドのスキルはTypeScript/Next.jsなので自動的に決定です。一応他の選択肢としてVueとNuxt.jsやAngularがありますが、今回はすでにある程度知識のあるものを使います。

また、Next.jsを採用したのでホスティングも相性のいいVercelにします。有名クラウドサービスもNext.jsのSSR/SSGモードでのホスティングに対応していますが、Next.js側のバージョンアップ追随・使用料金・今後のスケール予定などを含めてVercelで問題ないと考えました。

## Firestore

データベースですが、プロトタイプ版はユーザー認証機能は実装しないため、永続化したいデータはユーザーが投稿したプレイ記録データのみです。内容はJSON形式で1つのデータ量は10KB程度です。ある程度条件をつけた検索機能を実装する必要があり、検索条件はプロトタイプ版から正式版にアップデートしていく中でより細かく設定できるようにしたいところです。予算についてはプロトタイプ版ではできれば無料枠内でまかないたいところです。

RDBMSは今回のプロダクトには過剰だと考え、今回はFirebase Cloud Firestoreを採用しました。（[参考：Cloud FirestoreとRealtime Databaseの比較記事](https://airhole.ymegane.org/firestore-vs-rtdb/)）

# 構成図

~~~mermaid
graph LR
  Vercel-->|データリクエスト|Firestore[(Firestore)]
  Firestore-->|データレスポンス|Vercel
  ブラウザ-->|初回アクセス|Vercel
  Vercel-->|"SSRによる初回ロード（HTMLとJS）"|ブラウザ
~~~

（以下実装と並行して作成中）