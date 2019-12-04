<?php
include("funcs.php");

//sessionによるバリデーション
chk_ssid();

//POSTデータ取得
if (!isset($_POST['userName']) || !isset($_POST['password'])) {
    redirect("login.php", "?param=invalidToken");
} else {
    $userName = $_POST['userName'];
    $password = $_POST['password'];
}

//DB接続
$pdo = db_conn();

//id取得
$sqlSelect = "SELECT id from futsal_movies_users WHERE lname = :lname AND lpw = :lpw";
//(サーバーにあげるときコメントアウトとる)
// $sqlSelect = "SELECT id, lpw from futsal_movies_users WHERE lname = :lname";
$stmt = $pdo->prepare($sqlSelect);
$stmt->bindValue(':lname', $userName, PDO::PARAM_STR);
//(コメントアウトする＠サーバーにあげるとき)
$stmt->bindValue(':lpw', $password, PDO::PARAM_STR);
$status = $stmt->execute();

if ($status == false) {
    redirect("login.php", "?param=unmatch");
} else {
    //idからテーブル名を指定しデータ取得
    $result = $stmt->fetch();
    $userId = $result['id'];

    //hash化したパスワードによる認証(サーバーにあげるときコメントアウトとる)
    // if (!password_verify($password, $result['lpw'])) {
    //     redirect("login.php", "?param=unmatch");
    // }

    //sessionに保存(ログインチェックに使用)
    $_SESSION['userName'] = $userName;
    $_SESSION['password'] = $password;
    $_SESSION['userId'] = $userId;
}

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
    <link rel="stylesheet" href="style.css" />
    <link
      rel="stylesheet"
      href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css"
      integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh"
      crossorigin="anonymous"
    />
  </head>

  <body>
    <?php include('header.php'); ?>
    <div class="input-group md-form form-sm form-2 pl-0">
      <input
        id="searchWordTitleBox"
        class="form-control my-0 py-1 red-border"
        type="text"
        placeholder="タイトル・タグ"
        aria-label="titleSearch"
        />
        <input
        id="searchWordTagBox"
        class="form-control my-0 py-1 red-border"
        type="text"
        placeholder="シーン・タグ"
        aria-label="sceneSearch"
      />
      <div id="searchBtn" class="input-group-append">
        <span class="input-group-text red lighten-3" id="basic-text1"
          ><i class="fas fa-search text-grey" aria-hidden="true">検索</i
        ></span>
      </div>
    </div>
    <div id="searchResults"></div>

    <!-- JSに渡す変数用DOM -->
    <div type="hidden"
     id="userId"
     style="display:none;"
     data-val="<?= h($_SESSION['userId']) ?>"></div>

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
    <script src="js/top.js"></script>
  </body>
</html>
