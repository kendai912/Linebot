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

function appendResult(movieId, sceneTagArray) {
  //空の場合は何もしない
  if (movieId == "") {
    return;
  }

  //firebaseからデータ取得
  database.ref(userId + "/" + movieId).on("value", function(data) {
    try {
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

      $("#searchResults").append(movieSecHTML);

      // 動画へのリンクイベント(全体再生)
      $("#movieSecTopBox_" + movieId).on("click", function() {
        window.location.href =
          "tagScene.php?movieId=" +
          movieId +
          "&youtubeId=" +
          data.val().youtubeId +
          "&startTime=&endTime=";
      });

      // 動画へのリンクイベント(シーン再生)
      $.each(sortedSceneTagArray, function(stIndex, stValue) {
        $("#sceneTagBox_" + stValue.sceneTagKey).on("click", function() {
          window.location.href =
            "tagScene.php?movieId=" +
            movieId +
            "&youtubeId=" +
            data.val().youtubeId +
            "&startTime=" +
            stValue.startTime +
            "&endTime=" +
            stValue.endTime;
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

//読み込み時の一覧表示(firebase接続)
database.ref(userId).on("value", function(data) {
  try {
    $("#searchResults").html("");
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

//検索ボタンイベント
$("#searchBtn").on("click", function() {
  let searchWordTitle = ".*";
  let searchWordTag = ".*";
  $("#searchResults").html("");

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

  database.ref(userId).on("value", function(data) {
    try {
      $.each(data.val(), function(mvIndex, mvValue) {
        let resultObjArray = new Object();
        resultObjArray.movieId = "";
        resultObjArray.sceneTagArray = [];
        if (
          mvValue.title.match(regExpTitle) ||
          mvValue.titleTag.match(regExpTitle)
        ) {
          $.each(mvValue.sceneTags, function(tgIndex, tgValue) {
            if (tgValue.sceneTags.match(regExpTag)) {
              resultObjArray.movieId = mvIndex;
              resultObjArray.sceneTagArray.push(tgIndex);
            }
          });
        }
        appendResult(resultObjArray.movieId, resultObjArray.sceneTagArray);
      });
    } catch (e) {
      console.log("firebase is not set");
    }
  });
});
