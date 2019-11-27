<?php
// エラーを出力する
// ini_set('display_errors', "On");
// すべてのエラーレベルをレポート
// error_reporting(E_ALL);

session_start();

$dbname = 'kendai912_futsal_movies_db';
function db_conn()
{
    global $dbname;
    try {
        // return new PDO("mysql:dbname=$dbname; charset=utf8; host=mysql743.db.sakura.ne.jp", 'kendai912', 'take3912');
        return new PDO("mysql:dbname=$dbname; charset=utf8; host=localhost", 'root', 'root');
    } catch (PDOException $e) {
        exit('DB Connection Error:'.$e->getMessage());
    }
}

//XSS対応（ echoする場所で使用！それ以外はNG ）
function h($str)
{
    return htmlspecialchars($str, ENT_QUOTES);
}

function sql_error($stmt)
{
    $error = $stmt->errorInfo();
    exit("SQLError:".$error[2]);
}

function redirect($file_name, $param)
{
    header("Location: ".$file_name.$param);
    exit();
}

function chk_ssid()
{
    if (!isset($_SESSION['chk_ssid']) || $_SESSION['chk_ssid'] != session_id()) {
        redirect("login.php", "?param=invalidToken");
    } else {
        session_regenerate_id(true);
        $_SESSION['chk_ssid'] = session_id();
    }
}

function chk_login()
{
    if (!isset($_SESSION['userName']) || !isset($_SESSION['password'])) {
        redirect("login.php", "?param=invalidToken");
    }
}
