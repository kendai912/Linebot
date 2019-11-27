<?php
include("funcs.php");

//DB接続
$pdo = db_conn();

//id取得
$tableName = "futsal_movies_table_" . $_SESSION['tableId'];
$sqlDelete = "DELETE from " . $tableName . " WHERE id = :id";
$stmt = $pdo->prepare($sqlDelete);
$stmt->bindValue(':id', (int)$_GET['id'], PDO::PARAM_INT);
$status = $stmt->execute();

if ($status == false) {
    sql_error($stmt);
} else {
    // redirect("select.php", "");
?>
    <!DOCTYPE html>
    <html lang="ja">
      <head>
        <meta charset="UTF-8">
        <title>DELETE</title>
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
