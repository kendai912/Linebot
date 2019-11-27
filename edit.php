<?php
include("funcs.php");

//DB接続
$pdo = db_conn();

//id取得
$tableName = "futsal_movies_table_" . $_SESSION['tableId'];
$sqlSelect = "SELECT * from " . $tableName . " WHERE id = :id";
$stmt = $pdo->prepare($sqlSelect);
$stmt->bindValue(':id', (int)$_GET['id'], PDO::PARAM_INT);
$status = $stmt->execute();

if ($status == false) {
    sql_error($stmt);
} else {
    $data = $stmt->fetch();
    $json = json_encode($data);
}
?>

<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>データ編集画面</title>
  <link rel="stylesheet" href="css/reset.css" />
  <link rel="stylesheet" href="css/styleSelect.css" />
  <script src="https://code.jquery.com/jquery-3.2.1.min.js"></script>
</head>
<body>
<form method="POST" action="./update.php">
  <table class="row-head header-check">
    <thead>
      <tr>
        <th width="150">URL</th>
        <th width="80">タグ</th>
        <th width="60">登録日</th>
        <th width="40">操作</th>
      </tr>
    </thead>
    <tbody>
    </tbody>
  </table>
  <input type="hidden" name="id" value="<?= h($_GET['id']) ?>">
  <input type="hidden" name="token" value="<?= h($_SESSION['token']) ?>">
</form>

<script>
const data = JSON.parse('<?= $json ?>');
let row;
row += '  <tr>';
row += '      <td aria-label="URL"><input type="text" name="url" value="' + data.url + '"></input></td>';
row += '      <td aria-label="タグ"><input type="text" name="tag" value="' + data.tag + '"></input></td>';
row += '      <td aria-label="登録日">' + data.indate + '</td>';
row += '      <td align="center" class="bt-area">';
row += '        <button id="update">更新</button>';
row += '        <button id="cancel">キャンセル</button>';
row += '      </td>';
row += '  </tr>';
$("tbody").append(row);

$("#update").on("click", function() {
  $("form").submit();
})
</script>
</body>
</html>