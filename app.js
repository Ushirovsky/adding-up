'use strict';

// Node.jsに用意されたモジュールを呼び出し
// ファイルを扱うためのモジュール
const fs = require('fs');
// ファイルを1行ずつ読みこむためのモジュール
const readline = require('readline');

// popu-pref.csvファイルからファイル読み込みを行うStreamを生成
const rs = fs.ReadStream('./popu-pref.csv');
// rsをreadlineオブジェクトのinputとして設定し、rlオブジェクトを作成
const rl = readline.createInterface({ 'input': rs, 'output': {} });
// 連想配列を生成, key: 都道府県, value: 集計データのオブジェクト
const map = new Map();

// 第一引数：line（このイベントのとき）
// 第二引数：無名関数（この関数を実行して）
// Streamを1行分読み込むごとに以下が実行される
rl.on('line', (lineString) => {
    // lineStringをカンマで分割して配列として格納
    const columns = lineString.split(',');
    // parseIntは文字列を整数値に変換する関数
    const year = parseInt(columns[0]);
    const prefecture = columns[2];
    const popu = parseInt(columns[7]);
    
    if (year === 2010 || year === 2015){
        let value = map.get(prefecture);
        if (!value) {
            value = {
                popu10: 0,
                popu15: 0,
                change: null
            };
        }
        if (year === 2010) {
            value.popu10 += popu;
        }
        if (year === 2015) {
            value.popu15 += popu;
        }
        map.set(prefecture, value);
    }
})

// ストリームに情報を流し始める
rl.resume();

// streamが終了したときに実行される
rl.on('close', () => {
    // for-of構文
    for (let pair of map) {
        const value = pair[1];
        value.change = value.popu15 / value.popu10;
    }
 
    // 変化率の大きい順にソートする
    // Array.from()は連想配列を普通の(ペア配列の)配列に変換する
    // .sort関数を読んで、無名関数を渡している
    // この無名関数は並び替えのルールを決める
    const rankingArray = Array.from(map).sort((pair1, pair2) => {
        return pair2[1].change - pair1[1].change;
    });

    // データを整形する
    // map関数: Arrayの要素それぞれを、与えられた関数を適用した内容に変換する
    const rankingStrings = rankingArray.map((pair) => {
        return pair[0] + ': ' + pair[1].popu10 + '=>' + pair[1].popu15 + ' 変化率: ' + pair[1].change;
    });

    console.log(rankingStrings);
});
