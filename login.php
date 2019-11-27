<?php
include("funcs.php");

//tokenを発行
if (!isset($_SESSION['token'])) {
    $_SESSION['token'] = bin2hex(openssl_random_pseudo_bytes(16));
}

//バリデーション
if ($_GET['param'] == "unmatch") {
    $error_message = "ユーザー名・パスワードが正しくありません";
}
if ($_GET['param'] == "invalidToken") {
    $error_message = "Invalid Token!!";
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
  <form method="POST" action="./select.php">
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
    <input type="hidden" name="token" value="<?= h($_SESSION['token']) ?>">
    <input type="submit" name="login" value="ログイン">
  </form>
</div>
  
</body>
</html>