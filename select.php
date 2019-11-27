<?php
include("funcs.php");

//tokenによるバリデーション
if (!isset($_POST['token']) || $_POST['token'] !== $_SESSION['token']) {
    redirect("login.php", "?param=invalidToken");
}


//POSTデータ取得
$userName = $_POST['userName'];
$password = $_POST['password'];

//DB接続
$pdo = db_conn();

//id取得
$sqlSelect = "SELECT id from futsal_movies_users WHERE lname = :lname AND lpw = :lpw";
$stmt = $pdo->prepare($sqlSelect);
$stmt->bindValue(':lname', $userName, PDO::PARAM_STR);
$stmt->bindValue(':lpw', $password, PDO::PARAM_STR);
$status = $stmt->execute();

if ($status == false) {
    redirect("login.php", "?param=unmatch");
} else {
    //idからテーブル名を指定しデータ取得
    $result = $stmt->fetch();
    $tableId = $result['id'];

    $tableName = "futsal_movies_table_" . $tableId;
    $sqlSelect = "SELECT * from " . $tableName;
    $stmt = $pdo->prepare($sqlSelect);
    $status = $stmt->execute();
    while ($data[] = $stmt->fetch(PDO::FETCH_ASSOC));
    $json = json_encode($data);

    //sessionに保存
    $_SESSION['userName'] = $userName;
    $_SESSION['password'] = $password;
    $_SESSION['tableId'] = $tableId;
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
<table class="row-head header-check">
  <thead>
    <tr>
      <th width="40"></th>
      <th width="40">id</th>
      <th width="80">URL</th>
      <th width="150">タグ</th>
      <th width="80">登録日</th>
      <th width="80">操作</th>
    </tr>
  </thead>
  <tbody></tbody>
</table>

<script>
const data = JSON.parse('<?= $json ?>');
$.each(data, function(index, value) {
  let row;
  if(index != (data.length - 1)) {
    row += '<tr>';
    row += '<td align="center"><input type="checkbox" id="' + value.id + '"></td>';
    row += '<td aria-label="id">' + value.id + '</td>';
    row += '<td aria-label="URL">' + value.url + '</td>';
    row += '<td aria-label="タグ">' + value.tag + '</td>';
    row += '<td aria-label="登録日">' + value.indate + '</td>';
    row += '<td align="center" class="bt-area">';
    row += '  <a href="edit.php?id=' + value.id + '" class="icon-button mt-icon edit-icon" aria-label="編集">編集</a>';
    row += '  <a href="delete.php?id=' + value.id + '" class="icon-button mt-icon delete-icon" aria-label="削除">削除</a>';
    row += '</td>';
    row += '</tr>';
    $("tbody").append(row);
  }

})

</script>

</body>
</html>