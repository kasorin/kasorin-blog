---
title: Helltakerのソルバーを作る
published: 2021-06-07
---
# What?

HelltakerはŁukasz Piskorz氏（[Twitter:@vanripperart](https://twitter.com/vanripperart)）によって2020年に[itch.io](https://vanripper.itch.io/helltaker)および[Steam](https://store.steampowered.com/app/1289310/Helltaker/?l=japanese)から無料でリリースされた倉庫番ライクなパズルゲームです。「主人公はある朝目覚めると悪魔っ娘（こ）のハーレムを作ることを決意し、地獄へと向かう」という極めて明快なストーリー、日本のアニメテイストも漂う悪魔っ娘（こ）の優れたデザイン、シンプルながら難易度の高いゲーム性、最悪でもパズルをスキップしてストーリーを読むことのできる救済措置などなどの高いクオリティで日本人に結構ウケました。

そして去る5月12日に1周年記念のアップデート「Examtaker」がリリースされました（[ファミ通.comの記事](https://www.famitsu.com/news/202105/12220324.html)）。1年ぶりに挑んだ僕もかなり苦戦しましたが、なんとかクリアしました。とあるキャラクターの大きな変化とちょっとばかり切ないエンディングに泣きそうでした。

しかしながら、パズルは激ムズすぎて正～～～～直二度と解きたくないので、Helltakerのパズルを自動で解くプログラム、いわゆるソルバーを作ることにしました。 本記事はHelltakerのソルバーを作ってみた！という記録です。（なお現在未完成）

# とりあえず作ってみた編

特に締切があるわけでもないので、最初は何も調べずに自分の最近使っている技術（TypeScriptとNode.js）で作れないかどうか考えてみます。

![Alt text](/img/solve_helltaker/20210515195358_1.jpg)

これはHelltakerの画面です。白いスーツのサングラス男がプレイヤーキャラクターです。左上の数字は歩数制限で、23手以内に右下の悪魔娘にたどり着けばゴールです。

このゲームのある時点での状態を以下のようなオブジェクトにしてみます。

~~~typescript
const stage = {
  stepCount: 23,
  fields: [
    ['N','N','N','N','E','Y','N'],
    ['N','E','E','M','E','E','N'],
    ['N','E','M','E','M','N','N'],
    ['E','E','N','N','N','N','N'],
    ['N','R','E','E','R','E','N'],
    ['N','R','E','R','E','E','D']
  ]
}
~~~

stepCountは残りの歩数制限、fieldsはstring型の配列をネストしてフィールドの状態を示しています。
フィールドの状態を示す文字列のパターンは以下のとおりです。

- Y = YOU プレイヤーキャラクター
- D = DEMON 悪魔娘。制限歩数以内に悪魔娘の隣接マスにたどり着くとステージクリア
- R = ROCK 蹴って動かせる岩。蹴ると歩数を1つ消費する
- M = MOB ザコ悪魔。蹴って動かせるし、蹴って何かに当たると破壊できる。蹴ると歩数を1つ消費する。
- E = EMPTY なにもないマス。自分も岩も入ることができる。
- N = NONE 自分も岩も侵入できないマス。

###### （この時点で設計が怪しいですが、そのまま進めます）

上のような状態から、例えばゲーム上で左を一度入力するとゲームの状態は以下のようになります。

~~~typescript
{
  stepCount: 22,
  fields: [
    ['N','N','N','N','Y','E','N'],
    ['N','E','E','M','E','E','N'],
    ['N','E','M','E','M','N','N'],
    ['E','E','N','N','N','N','N'],
    ['N','R','E','E','R','E','N'],
    ['N','R','E','R','E','E','D']
  ]
}
~~~

ちょっと分かりづらいですが、一度歩いたのでstepCountが1減り、fields[0,5]のYと[0,4]のEが入れ替わっていますね。この時点ではまだ歩数制限も残っていますし、クリア条件も満たしていないのでゲームは続きます。いろいろと操作していくと最後はstepCountが0になり、その時点でクリア条件を満たしていない場合はゲームオーバーです。

このようなゲームの状態を次々に遷移させ、正解の入力を見つけるのが今回の目的です。今回は典型的な再帰関数で解けそうですね。イメージとしてはこうです。

~~~typescript
const solve = (
  stage: {
    stepCount: number,
    fields: string[][]
  }): boolean => {
    // 入力されたゲーム状態はクリアしている？ → trueを返す
    // 入力されたゲーム状態はゲームオーバーである？ → falseを返す

    // 入力されたゲーム状態に上方向への入力を行った際のゲーム状態を計算し、
    // それを自身solve()を呼び出して渡し、trueが返ってきたらtrueを返す

    // falseなら下方向への入力を同様に試し、また自身solve()に渡す

    // 以下同様に右左を試す

    // すべてダメならfalseを返す
  }
~~~

このような関数であれば、いずれ正解にたどり着くはずです。というわけで早速必要そうな以下の関数を実装していきます。

- ゲーム状態を入力すると、クリアしたかどうかを返す
- ゲーム状態と上下左右のうちひとつの操作方向を入力すると、入力後のゲーム状態を返す

~~~typescript
// クリア条件を満たすか判定する関数
const isSuccess = (fields: string[][]): boolean => {
  // YOUを探す
  const yourPosition = searchPosition(fields, 'Y');

  // YOUの上下左右に悪魔娘がいたらクリア条件を満たしているのでtrueを返す
  // 上
  if (
    (yourPosition.row !== 0)
    && (fields[yourPosition.row - 1][yourPosition.column] === 'D')) {
      return true;
  }
  // 下
  if (
    (yourPosition.row !== (fields.length - 1) )
    && (fields[yourPosition.row + 1][yourPosition.column] === 'D')) {
      return true;
    }
  // 左
  if (
    (yourPosition.column !== 0)
    && (fields[yourPosition.row][yourPosition.column - 1] === 'D')) {
      return true;
  }
  // 右
  if (
    (yourPosition.column !== (fields[0].length - 1))
    && (fields[yourPosition.row][yourPosition.column + 1] === 'D')) {
      return true;
  }
  // 上下左右に悪魔娘がいなければクリア条件を満たしていないのでfalseを返す
  return false;
}
~~~

isSuccess()は単純にYの上下左右のどれかにDが存在すればtrueを返します。Yが上下左右の端にいる場合は配列インデックスの範囲外にアクセスしないように条件を書いています。

~~~typescript
// 入力前のステージ状態と入力方向を渡すと入力後のステージ状態を返す関数
const input = (inputArrow: 'Up' | 'Down' | 'Right' | 'Left', stage: stage): stage => {
  const fields = deepCopy(stage.fields);
  const yourPosition = searchPosition(stage.fields, 'Y');
  
  const stepCountAfterInput = stage.stepCount - 1;

  // 上入力時
  if (inputArrow === 'Up') {
    const near = findByPosition(yourPosition.row - 1, yourPosition.column, fields);
    const beyond = findByPosition(yourPosition.row - 2, yourPosition.column, fields);

    if (near === 'E') {
      // 入力先が空の場合は自分が移動する
      fields[yourPosition.row][yourPosition.column] = 'E';
      fields[yourPosition.row - 1][yourPosition.column] = 'Y';
    } else {
      // 入力先に岩がありその先が空なら岩を移動する
      if (near === 'R' && beyond === 'E') {
          fields[yourPosition.row - 1][yourPosition.column] = 'E';
          fields[yourPosition.row - 2][yourPosition.column] = 'R';
      }
      // 入力先にザコ悪魔がありその先が空ならザコ悪魔を移動する
      if (near === 'M' && beyond === 'E') {
          fields[yourPosition.row - 1][yourPosition.column] = 'E';
          fields[yourPosition.row - 2][yourPosition.column] = 'M';
      }
      // 入力先にザコ悪魔がありその先にぶつかる物があるならザコ悪魔を破壊する
      if (near === 'M' && (beyond === 'R' || 'N' || 'M')) {
        fields[yourPosition.row - 1][yourPosition.column] = 'E';
      }
    }

  }
  // 下入力時
  if (inputArrow === 'Down') {
    const near = findByPosition(yourPosition.row + 1, yourPosition.column, fields);
    const beyond = findByPosition(yourPosition.row + 2, yourPosition.column, fields);

    if (near === 'E') {
      fields[yourPosition.row][yourPosition.column] = 'E';
      fields[yourPosition.row + 1][yourPosition.column] = 'Y';
    } else {
      // 下に岩、その先が空
      if (near === 'R' && beyond === 'E') {
          fields[yourPosition.row + 1][yourPosition.column] = 'E';
          fields[yourPosition.row + 2][yourPosition.column] = 'R';
      }
      // 下にザコ、その先が空
      if (near === 'M' && beyond === 'E') {
        fields[yourPosition.row + 1][yourPosition.column] = 'E';
        fields[yourPosition.row + 2][yourPosition.column] = 'M';
      }
      // 下にザコ、その先が岩か壁かザコ
      if (near === 'M' && (beyond === 'R' || 'N' || 'M')) {
        fields[yourPosition.row + 1][yourPosition.column] = 'E';
      }
    }
  }
  // 左入力時
  if (inputArrow === 'Left') {
    const near = findByPosition(yourPosition.row, yourPosition.column - 1, fields);
    const beyond = findByPosition(yourPosition.row, yourPosition.column - 2, fields);

    if (near === 'E') {
      fields[yourPosition.row][yourPosition.column] = 'E';
      fields[yourPosition.row][yourPosition.column - 1] = 'Y';
    } else {
      if (near === 'R' && beyond === 'E') {
          fields[yourPosition.row][yourPosition.column - 1] = 'E';
          fields[yourPosition.row][yourPosition.column - 2] = 'R';
      }
      // 左にザコ、その先が空
      if (near === 'M' && beyond === 'E') {
        fields[yourPosition.row][yourPosition.column - 1] = 'E';
        fields[yourPosition.row][yourPosition.column - 2] = 'M';
      }
      // 左にザコ、その先が岩か壁かザコ
      if (near === 'M' && (beyond === 'R' || 'N' || 'M')) {
        fields[yourPosition.row][yourPosition.column - 1] = 'E';
      }
    }
  }
  // 右入力時
  if (inputArrow === 'Right') {
    const near = findByPosition(yourPosition.row, yourPosition.column + 1, fields);
    const beyond = findByPosition(yourPosition.row, yourPosition.column + 2, fields);

    if (near === 'E') {
      fields[yourPosition.row][yourPosition.column] = 'E';
      fields[yourPosition.row][yourPosition.column + 1] = 'Y';
    } else {
      if (near === 'R' && beyond === 'E') {
          fields[yourPosition.row][yourPosition.column + 1] = 'E';
          fields[yourPosition.row][yourPosition.column + 2] = 'R';
      }
      // 左にザコ、その先が空
      if (near === 'M' && beyond === 'E') {
        fields[yourPosition.row][yourPosition.column + 1] = 'E';
        fields[yourPosition.row][yourPosition.column + 2] = 'M';
      }
      // 左にザコ、その先が岩か壁かザコ
      if (near === 'M' && (beyond === 'R' || 'N' || 'M')) {
        fields[yourPosition.row][yourPosition.column + 1] = 'E';
      }
    }
  }

  return {
    stepCount: stepCountAfterInput,
    fields: fields
  }
}
~~~

ちょっと長いですが、やってることは以下の通りです。

- 入力方向に何もなければプレイヤーキャラクターがそこに移動する
- 入力方向に岩かザコ悪魔がおり、その先に何もなければ岩かザコ悪魔が移動する
- 入力方向にザコ悪魔がおり、その先に何かがあればザコ悪魔を破壊する

キー入力に伴うキャラの移動や物の破壊などが終わったら、その後のステージ状態を返します。

これでだいたいのところは出来上がったので、solve()に組み込んで動かしてみましょう。テストのために簡単な問題を用意します。

~~~typescript
{
  stepCount: 7,
  fields: [
    ['Y','R','E'],
    ['E','R','D'],
    ['E','R','E']
  ]
}
~~~

セイッ！

~~~
$ node index.js
SUCCESS.
CORRECT MOVE: [Right,Down,Down,Right,Right,Up,Up]
END.
~~~

できた！いや～感動ですね。では早速実際の1ステージ目、本記事の一番最初の画像の23手の問題を解いてみます。

~~~
$ node index.js

~~~

……………………………

反応がありません。ちょこちょこログを出して調べたところ、どうやら23手の問題を解くには実行速度が遅すぎて実用に耐えないということがわかりました。

# 速くしてみよう編

はい、というわけで解けるはずなんだけど解けてるかどうか確かめられないぐらい遅い代物ができました。すばらしい成果ですね。

もちろんこれで終わりにはできません。というのも、今回の最終的な目標およびそこに至るステップは以下のように設定しています。

- とりあえず動くものを作る
- まともな速度で動くものに改良する
- ライブラリとしてNPMで公開する
- それを使って簡単なWebアプリとして公開する

今のところ一番目の「とりあえず動くものを作る」は達成できました。やったね。では粛々と二番目の「まともな速度で動くものに改良する」に取り掛かりましょう。

### （2021/06/09追記）

とりあえず気になっていたところである、ゲームの状態を表すオブジェクトをコピーする関数deepCopy()から改修します。

そもそもそもそもオブジェクトをコピーするだけの関数ってなんのこっちゃですが、JavaScriptではネイティブ型（String, Numberなど）とオブジェクトや配列等の型で挙動に違いがあるせいで実装時にやや苦労しました。

具体的には呼び出し先の再帰関数の中で操作したゲーム状態オブジェクトへの変更が、呼び出し元で持っているゲーム状態にも反映されてしまい、呼び出し元に戻ってもゲーム状態が元に戻らないという……（文章だとわかりづらいですね）

~~~typescript
const deepCopy = (obj) => {
  const returnArray = JSON.parse(JSON.stringify(obj));
  return returnArray;
}
~~~

というわけで渡されたオブジェクトを元のオブジェクトへの参照ではなく全く別のオブジェクトとしてコピーする（ディープコピー）ためにこういうことをします。JavaScript組み込みの関数を使う場合はこれが一番短く書けます。今回のようなNumberとString[][]の単純なオブジェクトであれば問題なくコピーできますが、Date型など一部のプロパティはこの方法ではコピーできません。

「とりあえず動く」版はこのdeepCopy()で問題なく動きましたが、たぶんこれが相当遅いので（勘です）、よさそうな代替手法（[Qiita](https://qiita.com/suin/items/80e687dd1789b9d9d2fd)）を試してみます。

~~~typescript
const jsonCopy = (arg) => JSON.parse(JSON.stringify(arg));
const rfdcCopy = (arg) => clone(arg);

const testTimes = 1000000

// jsonCopy
const jsonCopyStartedTime = performance.now();
for (let i=0;i<testTimes; i++){
  const copied = jsonCopy(value);
}
const jsonCopyFinishedTime = performance.now();

// rfdcCopy
const rfdcCopyStartedTime = performance.now();
for (let i=0;i<testTimes; i++){
  const copied = rfdcCopy(value);
}
const rfdcCopyFinishedTime = performance.now();

console.log(`json: ${jsonCopyFinishedTime - jsonCopyStartedTime}`);
console.log(`rfdc: ${rfdcCopyFinishedTime - rfdcCopyStartedTime}`);
~~~

簡単に計測コードを書きました。これでオブジェクトのディープコピーを100万回行った時間をミリ秒で比較できます。さっそく実行です。

~~~
json: 9885.751799999736
rfdc: 14.5304000005126
~~~

思ったよりすごい差になりましたね。上の記事内にある他の方法も試しましたが、rfdcが最速でした。これでdeepCopy()を修正します。

~~~typescript
const deepCopy = (obj) => {
  const returnArray = clone(obj);
  return returnArray;
}
~~~

修正後に7手のテストデータで解けることを確認した後に23手のデータを解いてみましたが、相変わらず23手のほうは5分ほど待っても完了しません。deepCopy()の修正だけではまだまだ実用には遠いようです。引き続き改修を続けることにします。

（2021/06/09追記ここまで）

### （調査済・記事更新予定）仕方ないので倉庫番のソルバーを調べてみた編

### （調査済・記事更新予定）そもそも去年の時点でHelltakerのソルバーを既に書いた人がいた編

### （予定）ともかくPythonとNode.jsでSATソルバーを作ってみよう編（数独ソルバー）

### （予定）HelltakerのPython製ソルバーをNode.jsで書き直してみよう編

### （予定）Node.jsで書いたHelltaker製ソルバーをESモジュールとしてNPMで公開してみよう編

### （予定）自分で公開したモジュールを使って簡単なWebサイトを作ってみよう編