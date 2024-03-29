<?php
include("funcs.php");

//sessionを格納
$_SESSION['chk_ssid'] = session_id();

//バリデーション
if ($_GET['param'] == "unmatch") {
    $error_message = "ユーザー名・パスワードが正しくありません";
}
if ($_GET['param'] == "invalidToken") {
    $error_message = "ログインしていません";
}

?>

<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>Login</title>
  <link rel="stylesheet" href="css/reset.css" />
  <link rel="stylesheet" href="css/styleLogin.css" />
</head>
<body>
<div class="box">
  <form method="POST" action="./top.php">
    <div class="errorBox">  
      <?= $error_message ?>
    </div>
    <div class="inputBox">
      <input type="text" name="userName" required onkeyup="this.setAttribute('value', this.value);"  value="">
      <label>ユーザー名</label>
    </div>
    <div class="inputBox">
      <input type="password" name="password" required onkeyup="this.setAttribute('value', this.value);" value="">
      <label>パスワード</label>
    </div>
    <input type="submit" name="login" value="ログイン">
  </form>
</div>
  
</body>
</html>