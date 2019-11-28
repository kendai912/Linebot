<?php
include("funcs.php");

//sessionによるバリデーション
chk_ssid();

//ログインチェック
chk_login();

//URL, タグの入力バリデーション
if (!preg_match('/(?<url>^((http[s]?|ftp):\/)?\/?([^:\/\s]+)((\/\w+)*\/)([\w\-\.]+[^#?\s]+)?(#[\w\-]+)?$)/', $_POST['url']) || !preg_match_all('/(?<tags>^[＃|#|♯][ｦ-ﾟー゛゜々ヾヽぁ-ヶ一-龠ａ-ｚＡ-Ｚ０-９a-zA-Z0-9_]*[ｦ-ﾟー゛゜々ヾヽぁ-ヶ一-龠ａ-ｚＡ-Ｚ０-９a-zA-Z]+[ｦ-ﾟー゛゜々ヾヽぁ-ヶ一-龠ａ-ｚＡ-Ｚ０-９a-zA-Z0-9_]*)(?:[\s| |　]+[＃|#|♯][ｦ-ﾟー゛゜々ヾヽぁ-ヶ一-龠ａ-ｚＡ-Ｚ０-９a-zA-Z0-9_]+)*[\s| |　]*$/u', $_POST['tag'])) {
    redirect("edit.php", "?param=invalidForm");
}

//DB接続
$pdo = db_conn();

//id取得
$tableName = "futsal_movies_table_" . $_SESSION['tableId'];
$sqlUpdate = "UPDATE " . $tableName . " SET url = :url, tag = :tag WHERE id = :id";
$stmt = $pdo->prepare($sqlUpdate);
$stmt->bindValue(':url', $_POST['url'], PDO::PARAM_STR);
$stmt->bindValue(':tag', $_POST['tag'], PDO::PARAM_STR);
$stmt->bindValue(':id', $_POST['id'], PDO::PARAM_INT);
$status = $stmt->execute();

if ($status == false) {
    sql_error($stmt);
} else {
    ?>
    <!DOCTYPE html>
    <html lang="ja">
      <head>
        <meta charset="UTF-8">
        <title>UPDATE</title>
        <script src="https://code.jquery.com/jquery-3.2.1.min.js"></script>
      </head>
      <body>
        <form method="POST" action="./select.php">
          <input type="hidden" name="userName" value="<?= h($_SESSION['userName']) ?>">
          <input type="hidden" name="password" value="<?= h($_SESSION['password']) ?>">
          <input type="hidden" name="token" value="<?= h($_SESSION['token']) ?>">
        </form>
      <script>
        $(function() {
          $("form").submit();
        })
        </script>
</body>
</html>
<?php
}
?>