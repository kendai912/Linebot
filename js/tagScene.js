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
    videoId: "H0knBbQsrUE",
    playerVars: {
      color: "white"
    }
    // events: {
    //   onReady: initialize
    // }
  });
}

function formatTime(time) {
  time = Math.round(time);

  var minutes = Math.floor(time / 60),
    seconds = time - minutes * 60;

  seconds = seconds < 10 ? "0" + seconds : seconds;

  return minutes + ":" + seconds;
}

// function initialize() {
// Update the controls on load
// updateTimerDisplay();
// updateProgressBar();

// Clear any old interval.
// let time_update_interval;
// clearInterval(time_update_interval);

// Start interval to update elapsed time display and
// the elapsed part of the progress bar every second.
// time_update_interval = setInterval(function() {
//   updateTimerDisplay();
//   updateProgressBar();
// }, 1000);
// }

// // This function is called by initialize()
// function updateTimerDisplay() {
//   // Update current time text display.
//   $("#current-time").text(formatTime(player.getCurrentTime()));
//   $("#duration").text(formatTime(player.getDuration()));
// }

// $("#progress-bar").on("mouseup touchend", function(e) {
//   // Calculate the new time for the video.
//   // new time in seconds = total duration in seconds * ( value of range input / 100 )
//   var newTime = player.getDuration() * (e.target.value / 100);

//   // Skip video to new time.
//   player.seekTo(newTime);
// });

// function updateProgressBar() {
//   // Update the value of our progress bar accordingly.
//   $("#progress-bar").val(
//     (player.getCurrentTime() / player.getDuration()) * 100
//   );
// }

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
  let durationSec =
    parseInt(duration.split(":")[0], 10) * 60 +
    parseInt(duration.split(":")[1], 10);
  let startSec =
    parseInt(
      $("#startTime")
        .val()
        .split(":")[0],
      10
    ) *
      60 +
    parseInt(
      $("#startTime")
        .val()
        .split(":")[1],
      10
    );
  let endSec =
    parseInt(
      $("#endTime")
        .val()
        .split(":")[0],
      10
    ) *
      60 +
    parseInt(
      $("#endTime")
        .val()
        .split(":")[1],
      10
    );

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

$(function() {
  let userId = "U5675b178054001cb3f7f6f00920faa92"; // SESSION使うよう後で修正
  let movieId = "-Lv2qggG0ixXQLX3zrfz"; // SESSION使うよう後で修正

  //----------------------------------------------------
  // イベント(Youtube関連)
  //----------------------------------------------------
  $("#startBtn").on("click", function() {
    $("#startTime").val(formatTime(player.getCurrentTime()));
    $(this).hide();
    $("#endBtn").show();
  });

  $("#endBtn").on("click", function() {
    $("#endTime").val(formatTime(player.getCurrentTime()));
    $(this).hide();
    $("#startBtn").show();
  });

  //----------------------------------------------------
  // イベント(firebase関連)
  //----------------------------------------------------
  $("#saveBtn").on("click", function() {
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
});
