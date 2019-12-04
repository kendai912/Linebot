"use strict";

//tagScene.phpからのパラメーター引継ぎ
let userId = $("#userId").data("val");
let movieId = $("#movieId").data("val");
let youtubeId = $("#youtubeId").data("val");
let sceneTagKey = $("#sceneTagKey").data("val");
let startTime = $("#startTime").data("val");
let endTime = $("#endTime").data("val");
let playListIds = $("#playListIds").data("val");
let originalSrc = $("#originalSrc").data("val");

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
// ファンクション(youtube関連)
//----------------------------------------------------
let player;

function onYouTubeIframeAPIReady() {
  player = new YT.Player("iframeBox", {
    playerVars: {
      color: "white"
    },
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange
    }
  });
}

function formatTime(time) {
  time = Math.round(time);

  var minutes = Math.floor(time / 60),
    seconds = time - minutes * 60;

  seconds = seconds < 10 ? "0" + seconds : seconds;

  return minutes + ":" + seconds;
}

function onPlayerReady(event) {
  event.target.mute();
  event.target.playVideo();
}

function onPlayerStateChange(event) {
  if (event.data == 0) {
    let movieIdNext;
    let youtubeIdNext;
    let sceneTagKeyNext;
    let startTimeNext;
    let endTimeNext;
    //自分自身の位置を判定
    $.each(playListIds, function(index, value) {
      //全体再生モードかシーン再生モードか判定
      if (value.playMode == "whole") {
        //全体再生モードの場合はmovieIdのみを比較
        if (value.movieId == movieId) {
          //次のmovieIdをセット
          movieIdNext = playListIds[index + 1].movieId;
          //firebaseからyoutubeIdを取得
          database.ref(userId + "/" + movieId).on("value", function(data) {
            try {
              youtubeIdNext = data.val().youtubeId;
            } catch (e) {
              console.log("firebase is not set");
            }
          });
        }

        sceneTagKeyNext = "";
        startTimeNext = "";
        endTimeNext = "";
      } else if (value.playMode == "scene") {
        //シーンモードの場合はmovieIdとsceneTagKeyを比較
        if (value.movieId == movieId) {
          $.each(value.sceneTagArray, function(scTagIndex, scTagValue) {
            if (scTagValue == sceneTagKey) {
              if (scTagIndex != value.sceneTagArray.length - 1) {
                //sceneTagKeyが最後でなければ、movieIdはそのままでsceneTagKeyだけ次をセット
                sceneTagKeyNext = value.sceneTagArray[scTagIndex + 1];
              } else {
                //sceneTagKeyが最後であれば、次のmovieIdとsceneTagKeyの0番目をセット
                //もしmovieIdも最後の場合は、最初に戻す
                if (index == playListIds.length - 1) {
                  movieIdNext = playListIds[0].movieId;
                  sceneTagKeyNext = playListIds[0].sceneTagArray[0];
                } else {
                  movieIdNext = playListIds[index + 1].movieId;
                  sceneTagKeyNext = playListIds[index + 1].sceneTagArray[0];
                }
              }
            }
          });

          database.ref(userId + "/" + movieIdNext).on("value", function(data) {
            try {
              //firebaseからyoutubeIdを取得
              youtubeIdNext = data.val().youtubeId;

              //firebaseからstartTime, endTimeを取得
              startTimeNext = data.val().sceneTags[sceneTagKeyNext].startTime;
              endTimeNext = data.val().sceneTags[sceneTagKeyNext].endTime;

              //プレイリストの次の動画・シーンをパラメーターにセットして送信
              window.location.href =
                "tagScene.php?movieId=" +
                movieIdNext +
                "&youtubeId=" +
                youtubeIdNext +
                "&sceneTagKey=" +
                sceneTagKeyNext +
                "&startTime=" +
                startTimeNext +
                "&endTime=" +
                endTimeNext +
                "&playListIds=" +
                JSON.stringify(playListIds);
            } catch (e) {
              console.log("firebase is not set");
            }
          });
        }
      }
    });
  }
}

//----------------------------------------------------
// ファンクション(バリデーション関連)
//----------------------------------------------------
function tagTimeValidate() {
  //空白チェック
  if ($("#startTime").val() == "" || $("#startTime").val() == "") {
    return false;
  }

  //時刻型かチェック
  if (
    !$("#startTime")
      .val()
      .match(/^\d{1,2}\:\d{1,2}$/) ||
    !$("#endTime")
      .val()
      .match(/^\d{1,2}\:\d{1,2}$/)
  ) {
    return false;
  }

  //再生時間内かチェック
  let duration = formatTime(player.getDuration());
  let durationSec = convertToSec(duration);
  let startSec = convertToSec($("#startTime").val());
  let endSec = convertToSec($("#endTime").val());

  if (
    startSec < 0 ||
    endSec < 0 ||
    startSec > durationSec ||
    endSec > durationSec
  ) {
    return false;
  }
  //開始より終了のが後かチェック
  if (startSec > endSec) {
    return false;
  }

  return true;
}

function tagNameValidate() {
  if (
    !$("#sceneTags")
      .val()
      .match(
        /^[＃|#|♯][ｦ-ﾟー゛゜々ヾヽぁ-ヶ一-龠ａ-ｚＡ-Ｚ０-９a-zA-Z0-9_]*[ｦ-ﾟー゛゜々ヾヽぁ-ヶ一-龠ａ-ｚＡ-Ｚ０-９a-zA-Z]+[ｦ-ﾟー゛゜々ヾヽぁ-ヶ一-龠ａ-ｚＡ-Ｚ０-９a-zA-Z0-9_]*(?:[\s| |　]+[＃|#|♯][ｦ-ﾟー゛゜々ヾヽぁ-ヶ一-龠ａ-ｚＡ-Ｚ０-９a-zA-Z0-9_]+)*[\s| |　]*$/u
      )
  ) {
    return false;
  }

  return true;
}

function convertToSec(timeMinSec) {
  return (
    parseInt(timeMinSec.split(":")[0], 10) * 60 +
    parseInt(timeMinSec.split(":")[1], 10)
  );
}

$(function() {
  //----------------------------------------------------
  // イベント(Youtube関連)
  //----------------------------------------------------
  //開始ボタン
  $("#startBtn").on("click", function(e) {
    e.preventDefault();
    player.playVideo();
    $("#startTime").val(formatTime(player.getCurrentTime()));
    $(this).hide();
    $("#endBtn").show();
  });

  //終了ボタン
  $("#endBtn").on("click", function(e) {
    e.preventDefault();
    $("#endTime").val(formatTime(player.getCurrentTime()));
    $(this).hide();
    $("#startBtn").show();
    player.pauseVideo();
  });

  //保存ボタン
  $("#saveBtn").on("click", function(e) {
    e.preventDefault();
    //保存時のバリデーション
    if (tagTimeValidate()) {
      if (tagNameValidate()) {
        database.ref(userId + "/" + movieId + "/sceneTags").push({
          startTime: $("#startTime").val(),
          endTime: $("#endTime").val(),
          sceneTags: $("#sceneTags").val()
        });

        $("#saveDoneBox")
          .text(
            $("#startTime").val() +
              "〜" +
              $("#endTime").val() +
              ": 「" +
              $("#sceneTags").val() +
              "」を保存しました"
          )
          .fadeIn(2000)
          .fadeOut(2000);
        $("#startTime").val("");
        $("#endTime").val("");
        $("#sceneTags").val("");
      } else {
        $("#saveDoneBox")
          .text("タグの入力が正しくありません")
          .fadeIn(2000)
          .fadeOut(2000);
      }
    } else {
      $("#saveDoneBox")
        .text("時間の入力が正しくありません")
        .fadeIn(2000)
        .fadeOut(2000);
    }
  });

  //----------------------------------------------------
  // イベント(firebase関連)
  //----------------------------------------------------
  //読み込み時のタイトル・タグ・登録日時表示
  database.ref(userId + "/" + movieId).on("value", function(data) {
    try {
      let outlineHTML = "<p>" + data.val().title + "<br>";
      outlineHTML += data.val().titleTag + "<br>";
      outlineHTML += data.val().indate + "</p>";
      $(".outline").html(outlineHTML);
    } catch (e) {
      console.log("firebase is not set");
    }
  });

  //シーンタグ一覧の表示
  database
    .ref(userId + "/" + movieId + "/sceneTags/")
    .on("value", function(data) {
      try {
        let sceneTagsArray = [];
        $.each(data.val(), function(index, value) {
          value["sceneTagKey"] = index;
          sceneTagsArray.push(value);
        });

        sceneTagsArray.sort(function(a, b) {
          if (convertToSec(a.startTime) < convertToSec(b.startTime)) {
            return -1;
          }
          if (convertToSec(a.startTime) > convertToSec(b.startTime)) {
            return 1;
          }
          return 0;
        });

        // let originalSrc = $("#originalSrc").data("val");
        $("#sceneTagsBox").html(
          '<div id="playAll">全体を再生</div><div id="playScene">シーンを再生</div>'
        );
        //全体再生イベント
        $("#playAll").on("click", function() {
          $("#iframeBox").attr("src", originalSrc);
        });

        $.each(sceneTagsArray, function(index, value) {
          $("#sceneTagsBox").append(
            '<div id="' +
              value.sceneTagKey +
              '">' +
              value.startTime +
              "〜" +
              value.endTime +
              ": " +
              value.sceneTags +
              "</div>"
          );
          //シーン再生イベント
          $("#" + value.sceneTagKey).on("click", function() {
            $("#iframeBox").attr(
              "src",
              originalSrc +
                "&start=" +
                convertToSec(value.startTime) +
                "&end=" +
                convertToSec(value.endTime)
            );
          });
        });
      } catch (e) {
        console.log("firebase is not set");
      }
    });
});
