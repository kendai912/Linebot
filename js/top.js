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

//----------------------------------------------------
// イベント
//----------------------------------------------------
//読み込み時の一覧表示(firebase接続)
let userId = $("#userId").data("val");

database.ref(userId).on("value", function(data) {
  try {
    $.each(data.val(), function(index, value) {
      let sceneTagsArray = [];
      $.each(value.sceneTags, function(sceneTagIndex, sceneTagValue) {
        sceneTagValue["sceneTagKey"] = sceneTagIndex;
        sceneTagsArray.push(sceneTagValue);
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

      let movieSecHTML = "";
      movieSecHTML += '<div class="movieSec">';
      movieSecHTML +=
        ' <div class="movieSecTopBox" id="movieSecTopBox_' + index + '">';
      movieSecHTML +=
        '   <div class="topIframeBox"><iframe class="topIframe" src="https://www.youtube.com/embed/' +
        value.youtubeId +
        '"></iframe></div>';
      movieSecHTML +=
        '   <div class="titleTagBox">' +
        value.title +
        "   <br>" +
        value.titleTag +
        "   </div>";
      movieSecHTML += " </div>";
      movieSecHTML += ' <div class="movieSecBottomBox">';
      $.each(sceneTagsArray, function(stIndex, stValue) {
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
      });
      movieSecHTML += " </div>";
      movieSecHTML += "</div>";

      $("#searchResults").append(movieSecHTML);

      // 動画へのリンクイベント(全体再生)
      $("#movieSecTopBox_" + index).on("click", function() {
        window.location.href =
          "tagScene.php?movieId=" +
          index +
          "&youtubeId=" +
          value.youtubeId +
          "&startTime=&endTime=";
      });

      // 動画へのリンクイベント(シーン再生)
      $.each(sceneTagsArray, function(stIndex, stValue) {
        $("#sceneTagBox_" + stValue.sceneTagKey).on("click", function() {
          window.location.href =
            "tagScene.php?movieId=" +
            index +
            "&youtubeId=" +
            value.youtubeId +
            "&startTime=" +
            stValue.startTime +
            "&endTime=" +
            stValue.endTime;
        });
      });
    });
  } catch (e) {
    console.log("firebase is not set");
  }
});
