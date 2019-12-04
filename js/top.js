"use strict";

//----------------------------------------------------
// Initialize Firebase
//----------------------------------------------------
var firebaseConfig = {
  apiKey: "AIzaSyBCjM0FmO6imwvzB_1h8MvBDDw-aFvA36M",
  authDomain: "futsalmoviestock.firebaseapp.com",
  databaseURL: "https://futsalmoviestock.firebaseio.com",
  projectId: "futsalmoviestock",
  storageBucket: "futsalmoviestock.appspot.com",
  messagingSenderId: "355583775547",
  appId: "1:355583775547:web:2e3cda9c5302435fa41d1e",
  measurementId: "G-FKJ7VNCWNW"
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();

//----------------------------------------------------
// ファンクション
//----------------------------------------------------
function convertToSec(timeMinSec) {
  return (
    parseInt(timeMinSec.split(":")[0], 10) * 60 +
    parseInt(timeMinSec.split(":")[1], 10)
  );
}

function getPlayListIds(searchWordTitle, searchWordTag, playMode) {
  //タイトル検索用の正規表現
  if (searchWordTitle == "") {
    searchWordTitle = ".*";
  }
  let searchWordTitleArray = searchWordTitle.split(/[\s*|　]/);
  let regExpTitle = "^";
  $.each(searchWordTitleArray, function(index, value) {
    if (value != "") {
      regExpTitle += "(?=.*" + value + ")";
    }
  });
  regExpTitle += ".*$";
  regExpTitle = new RegExp(regExpTitle, "g");

  //シーン検索用の正規表現
  if (searchWordTag == "") {
    searchWordTag = ".*";
  }
  let searchWordTagArray = searchWordTag.split(/[\s*|　]/);
  let regExpTag = "^";
  $.each(searchWordTagArray, function(index, value) {
    if (value != "") {
      regExpTag += "(?=.*" + value + ")";
    }
  });
  regExpTag += ".*$";
  regExpTag = new RegExp(regExpTag, "g");

  //firebaseの全動画にアクセス
  let resultObjArray = [];
  database.ref(userId).on("value", function(data) {
    try {
      $.each(data.val(), function(mvIndex, mvValue) {
        let movieObj = new Object();
        movieObj.movieId = "";
        movieObj.sceneTagArray = [];

        if (playMode == "whole") {
          movieObj.playMode = "whole";
        } else if (playMode == "scene") {
          movieObj.playMode = "scene";
        }

        //タイトル一致判定(タイトルorタイトルタグ)
        if (
          mvValue.title.match(regExpTitle) ||
          mvValue.titleTag.match(regExpTitle)
        ) {
          $.each(mvValue.sceneTags, function(tgIndex, tgValue) {
            //シーン一致判定
            if (tgValue.sceneTags.match(regExpTag)) {
              //一致したものをオブジェクトに格納
              movieObj.movieId = mvIndex;
              movieObj.sceneTagArray.push(tgIndex);
            }
          });
          if (movieObj.movieId != "") {
            resultObjArray.push(movieObj);
          }
        }
      });
    } catch (e) {
      console.log("firebase is not set");
      return null;
    }
  });
  return resultObjArray;
}

function appendToSeaResult(movieId, sceneTagArray, playListIds) {
  //空の場合は何もしない
  if (movieId == "") {
    return;
  }

  //firebaseからデータ取得
  database.ref(userId + "/" + movieId).on("value", function(data) {
    try {
      //append用のHTML作成
      let movieSecHTML = "";
      movieSecHTML += '<div class="movieSec">';
      movieSecHTML +=
        ' <div class="movieSecTopBox" id="movieSecTopBox_' + movieId + '">';
      movieSecHTML +=
        '   <div class="topIframeBox"><iframe class="topIframe" src="https://www.youtube.com/embed/' +
        data.val().youtubeId +
        '"></iframe></div>';
      movieSecHTML +=
        '   <div class="titleTagBox">' +
        data.val().title +
        "   <br>" +
        data.val().titleTag +
        "   </div>";
      movieSecHTML += " </div>";
      movieSecHTML += ' <div class="movieSecBottomBox">';

      //firebaseのシーンタグをsortedSceneTagArrayに移行
      let sortedSceneTagArray = [];
      $.each(data.val().sceneTags, function(sceneTagIndex, sceneTagValue) {
        sceneTagValue["sceneTagKey"] = sceneTagIndex;
        sortedSceneTagArray.push(sceneTagValue);
      });

      //開始時間順に並び替え
      sortedSceneTagArray.sort(function(a, b) {
        if (convertToSec(a.startTime) < convertToSec(b.startTime)) {
          return -1;
        }
        if (convertToSec(a.startTime) > convertToSec(b.startTime)) {
          return 1;
        }
        return 0;
      });

      //第二引数のsceneTagArrayに一致するものだけ追記
      $.each(sortedSceneTagArray, function(stIndex, stValue) {
        if ($.inArray(stValue.sceneTagKey, sceneTagArray) >= 0) {
          movieSecHTML +=
            '   <div id="sceneTagBox_' +
            stValue.sceneTagKey +
            '">' +
            stValue.startTime +
            "〜" +
            stValue.endTime +
            ": " +
            stValue.sceneTags +
            "   </div>";
        }
      });
      movieSecHTML += " </div>";
      movieSecHTML += "</div>";

      //HTMLへappend実行
      $("#searchResults").append(movieSecHTML);

      // 動画へのリンクイベント(サムネイル＆タイトル部分)
      if (playListIds[0].playMode == "whole") {
        //playModeがwholeの場合は、シーン関連パラメータはなし
        $("#movieSecTopBox_" + movieId).on("click", function() {
          window.location.href =
            "tagScene.php?movieId=" +
            movieId +
            "&youtubeId=" +
            data.val().youtubeId +
            "&sceneTagKey=" +
            "&startTime=&endTime=" +
            "&playListIds=" +
            JSON.stringify(playListIds);
        });
      } else if (playListIds[0].playMode == "scene") {
        //playModeがsceneの場合は、シーン関連パラメータに一番始めのシーンをセット
        $("#movieSecTopBox_" + movieId).on("click", function() {
          window.location.href =
            "tagScene.php?movieId=" +
            movieId +
            "&youtubeId=" +
            data.val().youtubeId +
            "&sceneTagKey=" +
            sceneTagArray[0] +
            "&startTime=" +
            data.val().sceneTags[sceneTagArray[0]].startTime +
            "&endTime=" +
            data.val().sceneTags[sceneTagArray[0]].endTime +
            "&playListIds=" +
            JSON.stringify(playListIds);
        });
      }

      // 動画へのリンクイベント(シーンタグ部分)
      $.each(sortedSceneTagArray, function(stIndex, stValue) {
        $("#sceneTagBox_" + stValue.sceneTagKey).on("click", function() {
          window.location.href =
            "tagScene.php?movieId=" +
            movieId +
            "&youtubeId=" +
            data.val().youtubeId +
            "&sceneTagKey=" +
            stValue.sceneTagKey +
            "&startTime=" +
            stValue.startTime +
            "&endTime=" +
            stValue.endTime +
            "&playListIds=" +
            JSON.stringify(playListIds);
        });
      });
    } catch (e) {
      console.log("firebase is not set");
    }
  });
}

//----------------------------------------------------
// イベント
//----------------------------------------------------
let userId = $("#userId").data("val");

//連続再生のためのPlayListIDsオブジェクトを取得
let playListIds = getPlayListIds("", "", "whole");

//読み込み時の一覧表示(firebase接続)
database.ref(userId).on("value", function(data) {
  try {
    //画面クリア
    $("#searchResults").html("");
    $.each(data.val(), function(index, value) {
      //動画毎にsceneTagのIndexだけ抜き出して配列として追加
      let sceneTagArray = [];
      $.each(value.sceneTags, function(stgIndex, stgValue) {
        sceneTagArray.push(stgIndex);
      });

      //HTMLにappend
      appendToSeaResult(index, sceneTagArray, playListIds);
    });
  } catch (e) {
    console.log("firebase is not set");
  }
});

//検索ボタンイベント
$("#searchBtn").on("click", function() {
  //画面クリア
  $("#searchResults").html("");
  let searchWordTitle = ".*";
  let searchWordTag = ".*";

  //タイトル検索用の正規表現
  if ($("#searchWordTitleBox").val() != null) {
    searchWordTitle = $("#searchWordTitleBox").val();
  }
  let searchWordTitleArray = searchWordTitle.split(/[\s*|　]/);
  let regExpTitle = "^";
  $.each(searchWordTitleArray, function(index, value) {
    if (value != "") {
      regExpTitle += "(?=.*" + value + ")";
    }
  });
  regExpTitle += ".*$";
  regExpTitle = new RegExp(regExpTitle, "g");

  //シーン検索用の正規表現
  if ($("#searchWordTagBox").val() != null) {
    searchWordTag = $("#searchWordTagBox").val();
  }
  let searchWordTagArray = searchWordTag.split(/[\s*|　]/);
  let regExpTag = "^";
  $.each(searchWordTagArray, function(index, value) {
    if (value != "") {
      regExpTag += "(?=.*" + value + ")";
    }
  });
  regExpTag += ".*$";
  regExpTag = new RegExp(regExpTag, "g");

  let playMode;
  if ($("#searchWordTagBox").val() == "") {
    playMode = "whole";
  } else {
    playMode = "scene";
  }

  //連続再生のためのPlayListIDsオブジェクトを取得
  let playListIds = getPlayListIds(searchWordTitle, searchWordTag, playMode);

  database.ref(userId).on("value", function(data) {
    try {
      $.each(data.val(), function(mvIndex, mvValue) {
        let resultObjArray = new Object();
        resultObjArray.movieId = "";
        resultObjArray.sceneTagArray = [];
        //タイトル一致判定
        if (
          mvValue.title.match(regExpTitle) ||
          mvValue.titleTag.match(regExpTitle)
        ) {
          $.each(mvValue.sceneTags, function(tgIndex, tgValue) {
            //シーン一致判定
            if (tgValue.sceneTags.match(regExpTag)) {
              //一致したものをオブジェクトに格納
              resultObjArray.movieId = mvIndex;
              resultObjArray.sceneTagArray.push(tgIndex);
            }
          });
        }
        //動画毎に検索にヒットしたオブジェクトをHTMLにappend
        appendToSeaResult(
          resultObjArray.movieId,
          resultObjArray.sceneTagArray,
          playListIds
        );
      });
    } catch (e) {
      console.log("firebase is not set");
    }
  });
});
