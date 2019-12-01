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

$(function() {
  let userId = "U5675b178054001cb3f7f6f00920faa92"; // SESSION使うよう後で修正
  let movieId = "-Lv2qggG0ixXQLX3zrfz"; // SESSION使うよう後で修正

  //----------------------------------------------------
  // イベント(youtube関連)
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
  });
});
