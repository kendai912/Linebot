<?php
include("funcs.php");

//sessionによるバリデーション
chk_ssid();

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