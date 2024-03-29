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
// ファンクション(youtube関連)
//----------------------------------------------------
let player;

function onYouTubeIframeAPIReady() {
  player = new YT.Player("iframeBox", {
    // videoId: movieId,
    videoId: "M7lc1UVf-VE",
    // videoId: "IT9LQ0I9Zig",
    playerVars: {
      color: "white",
      start: 10,
      end: 30
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
  console.log(event);
  if (event.data == 0) {
    player.loadVideoById({
      videoId: "bHQqvYy5KYo",
      startSeconds: 5,
      endSeconds: 10,
      suggestedQuality: "large"
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

function convertToSec(timeMinSec) {
  return (
    parseInt(timeMinSec.split(":")[0], 10) * 60 +
    parseInt(timeMinSec.split(":")[1], 10)
  );
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
let mvId = "IT9LQ0I9Zig";
setTimeout(function() {
  console.log("try")
  onYouTubeIframeAPIReady(mvId);
}, 8000);

$(function() {
  //テスト用にコメントアウト
  //phpファイルからのuserId, movieIdの引継ぎ
  // let userId = $("#userId").data("val");
  // let movieId = $("#movieId").data("val");
  let userId = "U5675b178054001cb3f7f6f00920faa92";
  let movieId = "-LvA74dS-q1iEKRAl3mO";

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

        let originalSrc = $("#originalSrc").data("val");
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
