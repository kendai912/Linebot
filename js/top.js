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
// イベント(firebase関連)
//----------------------------------------------------
//読み込み時の一覧表示
let userId = $("#userId").data("val");
// console.log(userId);

database.ref(userId).on("value", function(data) {
  try {
    $.each(data.val(), function(index, value) {
      console.log(value);
      // console.log(index);
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
      console.log(sceneTagsArray);

      let movieSecHTML = '<div class="movieSec" id="movieSec_' + index + '">';
      movieSecHTML += " <div class=movieSecTopBox>";
      movieSecHTML +=
        '   <div class="topIframeBox"><iframe class="topIframe" src="https://www.youtube.com/embed/' +
        value.youtubeId +
        '"></iframe></div>';
      movieSecHTML +=
        '<div class="titleTagBox">' +
        value.title +
        "<br>" +
        value.titleTag +
        "</div>";
      movieSecHTML += " </div>";
      movieSecHTML += ' <div class="movieSecBottomBox">';
      $.each(sceneTagsArray, function(stIndex, stValue) {
        movieSecHTML +=
          '   <div id="' +
          stValue.sceneTagKey +
          '">' +
          stValue.startTime +
          "〜" +
          stValue.endTime +
          ": " +
          stValue.sceneTags +
          "</div>";
      });
      movieSecHTML += " </div>";
      movieSecHTML += "</div>";

      $("#searchResults").append(movieSecHTML);
    });
  } catch (e) {
    console.log("firebase is not set");
  }
});
