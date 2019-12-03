<?php
include("funcs.php");

//sessionによるバリデーション
chk_ssid();

//ログインチェック
chk_login();

function convertToSec($timeMinSec)
{
    $timeArray = explode(":", $timeMinSec);
    return (int)$timeArray[0] * 60 + (int)$timeArray[1];
}

$src = "https://www.youtube.com/embed/" . h($_GET['youtubeId']) . "?enablejsapi=1&start=" .  convertToSec(h($_GET['startTime'])) . "&end=" . convertToSec(h($_GET['endTime']));
$originalSrc = "https://www.youtube.com/embed/" . h($_GET['youtubeId']) . "?enablejsapi=1";

?>

<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0, minimum-scale=1.0"
    />
    <title>フットサル動画ストック</title>
    <!-- <link rel="stylesheet" href="style.css" /> -->
    <link
      rel="stylesheet"
      href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css"
      integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh"
      crossorigin="anonymous"
    />
  </head>
  <body>
    <?php include('header.php'); ?>
    <div class="embed-responsive embed-responsive-16by9">
      <iframe
        id="iframeBox"
        class="embed-responsive-item"
        src="<?= $src ?>"
        allowfullscreen
      ></iframe>
    </div>
    <div class="outline"></div>
    <nav class="navbar navbar-light bg-light">
      <span class="navbar-brand mb-0 h1">シーンにタグ付け</span>
    </nav>
    <p>１．タグ付けするシーンを指定</p>
    <div class="btnBox">
      <button id="startBtn" type="button" class="btn btn-primary">
        タグ開始
      </button>
      <button
        id="endBtn"
        type="button"
        class="btn btn-primary"
        style="display: none;"
      >
        タグ終了
      </button>
    </div>
    <input type="text" class="form-control" id="startTime"
    placeholder="00:00""/> <input type="text" class="form-control" id="endTime"
    placeholder="00:00""/>
    <p>２．タグ名を入力</p>
    <input
      type="text"
      class="form-control mb-2 mr-sm-2"
      id="sceneTags"
      placeholder="#タグ名1  #タグ名2"
    />
    <button id="saveBtn" type="button" class="btn btn-primary">
      保存
    </button>
    <div id="saveDoneBox" style="display: none;"></div>
    <div id="sceneTagsBox"></div>
    <!-- JSに渡す変数用DOM -->
    <div type="hidden"
     id="userId"
     style="display:none;"
     data-val="<?= h($_SESSION['userId']) ?>"></div>
    <div type="hidden"
     id="movieId"
     style="display:none;"
     data-val="<?= h($_GET['movieId']) ?>"></div>
    <div type="hidden"
     id="originalSrc"
     style="display:none;"
     data-val="<?= $originalSrc ?>"></div>

    <script src="https://code.jquery.com/jquery-3.2.1.min.js"></script>
    <script src="https://www.gstatic.com/firebasejs/7.2.1/firebase.js"></script>
    <script
      src="https://cdn.jsdelivr.net/npm/popper.js@1.16.0/dist/umd/popper.min.js"
      integrity="sha384-Q6E9RHvbIyZFJoft+2mJbHaEWldlvI9IOYy5n3zV9zzTtmI3UksdQRVvoxMfooAo"
      crossorigin="anonymous"
    ></script>
    <script
      src="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/js/bootstrap.min.js"
      integrity="sha384-wfSDF2E50Y2D1uUdj0O3uMBJnjuUD4Ih7YwaYd1iqfktj0Uod8GCExl3Og8ifwB6"
      crossorigin="anonymous"
    ></script>
    <script src="https://www.youtube.com/iframe_api"></script>
    <script src="js/tagScene.js"></script>
  </body>
</html>
