<?php
require './vendor/autoload.php';

// ----------------------------------------------------------------------
// Firebase認証
// ----------------------------------------------------------------------
use Kreait\Firebase;
use Kreait\Firebase\Factory;
use Kreait\Firebase\ServiceAccount;

$serviceAccount = ServiceAccount::fromJsonFile(__DIR__.'/firebase_credentials.json');
$factory = (new Factory)->withServiceAccount($serviceAccount);
$database = $factory->createDatabase();


// ----------------------------------------------------------------------
// ファンクション
// ----------------------------------------------------------------------
//メッセージの送信
function sending_messages($accessToken, $replyToken, $return_message_array)
{
    for ($i = 0; $i < count($return_message_array); $i++) {
        //typeがtextの場合
        if ($return_message_array[$i]['type'] == 'text') {
            //レスポンスフォーマット
            $response_format_array[] = [
                'type' => $return_message_array[$i]['type'],
                'text' => $return_message_array[$i]['text'],
            ];
        //typeがtemplateの場合
        } elseif ($return_message_array[$i]['type'] == 'template') {
            //レスポンスフォーマット
            $response_format_array[] = [
                "type" => $return_message_array[$i]['type'],
                "altText" => $return_message_array[$i]['title'],
                "template" => [
                    "type" => "buttons",
                    "thumbnailImageUrl" => "https://kendai912.sakura.ne.jp/Linebot/img/futsalMoviesLogo.jpg",
                    "imageAspectRatio" => "rectangle",
                    "imageSize" => "cover",
                    "imageBackgroundColor" => "#FFFFFF",
                    "title" => $return_message_array[$i]['title'],
                    "text" => "サイトを表示しますか？",
                    "actions" => [
                        [
                            "type" => "uri",
                            "label" => "はい",
                            "uri" => $return_message_array[$i]['uri'],
                            "altUri" => [
                                "desktop" => $return_message_array[$i]['uri']
                            ]
                        ]
                    ]
                ]
            ];
        }
    }

    //ポストデータ
    $post_data = [
        'replyToken' => $replyToken,
        'messages' => $response_format_array,
    ];

    //curl実行
    $ch = curl_init('https://api.line.me/v2/bot/message/reply');
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'POST');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($post_data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, array(
        'Content-Type: application/json; charser=UTF-8',
        'Authorization: Bearer '.$accessToken,
    ));
    $result = curl_exec($ch);
    curl_close($ch);
}


// ----------------------------------------------------------------------
// LINEメッセージ取得
// ----------------------------------------------------------------------
$accessToken = '6x454YGuUbGxvMzITsWVGYh4HEbx5igsSUh6sfAo7QbdsRJ/AhjQEG7m4ME7yP8MSnlnqkswe/Sb8FCEwmVSMpND12+UG6Q33Tmp3r91DiXFKUpKIngdHRh1YmhpfQPkDeRD4vcBZG/ErxvjhLe0pQdB04t89/1O/w1cDnyilFU=';

//ユーザーからのメッセージ取得
$json_string = file_get_contents('php://input');
$json_object = json_decode($json_string);

//取得データ
$replyToken = $json_object->{'events'}[0]->{'replyToken'};        //返信用トークン
$message_type = $json_object->{'events'}[0]->{'message'}->{'type'};    //メッセージタイプ
$message_text = $json_object->{'events'}[0]->{'message'}->{'text'};    //メッセージ内容
if ($json_object->{'events'}[0]->{'source'}->{'groupId'}) {
    $id = $json_object->{'events'}[0]->{'source'}->{'groupId'};    //グループ名
} elseif ($json_object->{'events'}[0]->{'source'}->{'roomId'}) {
    $id = $json_object->{'events'}[0]->{'source'}->{'roomId'};     //ルーム名
} else {
    $id = $json_object->{'events'}[0]->{'source'}->{'userId'};    //ユーザー名
}

//メッセージタイプが「text」以外のときは何も返さず終了
if ($message_type != 'text') {
    exit;
}


// ----------------------------------------------------------------------
// Error logファイル準備
// ----------------------------------------------------------------------
$filename = './log/errorlog.txt';
$dirname = dirname($filename);
if (!is_dir($dirname)) {
    mkdir($dirname, 0755, true);
}

// ----------------------------------------------------------------------
// DB登録データ抽出
// ----------------------------------------------------------------------
//URLの抽出
$resultGetURL = preg_match('/(?<url>http.*)/', $message_text, $matches);
if (!$resultGetURL) {
    // $return_message_array[] = ['type' => 'text', 'text' => '登録したい動画URLを入力して下さい'];
    // sending_messages($accessToken, $replyToken, $return_message_array);
    // exit();
} else {
    $url = $matches['url'];
}

// ハッシュタグの抽出
$resultGetTag = preg_match_all('/(?<tags>[＃|#|♯][ｦ-ﾟー゛゜々ヾヽぁ-ヶ一-龠ａ-ｚＡ-Ｚ０-９a-zA-Z0-9_]*[ｦ-ﾟー゛゜々ヾヽぁ-ヶ一-龠ａ-ｚＡ-Ｚ０-９a-zA-Z]+[ｦ-ﾟー゛゜々ヾヽぁ-ヶ一-龠ａ-ｚＡ-Ｚ０-９a-zA-Z0-9_]*)/u', $message_text, $matches);
if (!$resultGetTag) {
    // $return_message_array[] = ['type' => 'text', 'text' => 'ハッシュタグを入力して下さい(#タグ)'];
    // sending_messages($accessToken, $replyToken, $return_message_array);
    // exit();
} else {
    foreach ($matches['tags'] as $tag) {
        $tagLine .= $tag." ";
    }
}

// DB接続
$dbname = 'kendai912_futsal_movies_db';
$tableName = "futsal_movies_table_" . $id;
try {
    $pdo = new PDO("mysql:dbname=$dbname; charset=utf8; host=mysql743.db.sakura.ne.jp", 'kendai912', 'take3912');
} catch (PDOException $e) {
    $return_message_array[] = ['type' => 'text', 'text' => $e->getMessage()];
    sending_messages($accessToken, $replyToken, $return_message_array);
    exit();
}


if ($resultGetURL && $resultGetTag) {
    // ----------------------------------------------------------------------
    // DB登録処理
    // ----------------------------------------------------------------------
    // //テーブル作成
    // try {
    //     $sql = "CREATE TABLE IF NOT EXISTS " . $tableName . "(id INT(5) AUTO_INCREMENT PRIMARY KEY, url VARCHAR(255) NOT NULL UNIQUE KEY, tag TEXT NOT NULL, indate DATETIME NOT NULL)";
    //     $stmt = $pdo->query($sql);
    // } catch (PDOException $e) {
    //     $return_message_array[] = ['type' => 'text', 'text' => $e->getMessage()];
    //     sending_messages($accessToken, $replyToken, $return_message_array);
    //     exit();
    // }

    // //データ登録
    // $sqlInsert = "INSERT INTO " . $tableName . "(url, tag, indate) VALUES(:url, :tag, sysdate()) ON DUPLICATE KEY UPDATE tag = VALUES (tag)";
    // $stmt = $pdo->prepare($sqlInsert);
    // $stmt->bindValue(':url', $url, PDO::PARAM_STR);  //Integer（数値の場合 PDO::PARAM_INT)
    // $stmt->bindValue(':tag', $tagLine, PDO::PARAM_STR);  //Integer（数値の場合 PDO::PARAM_INT)
    // $status = $stmt->execute();

    // //データ登録処理後
    // if ($status==false) {
    //     //SQL実行時にエラーがある場合（エラーオブジェクト取得して表示）
    //     $error = $stmt->errorInfo();
    //     $return_message_array[] = ['type' => 'text', 'text' => $error[2]];
    //     sending_messages($accessToken, $replyToken, $return_message_array);
    //     exit();
    // } else {
    //     //返信メッセージ
    //     $return_message_array[] = ['type' => 'text', 'text' => '動画を登録しました'];
    //     sending_messages($accessToken, $replyToken, $return_message_array);
    //     exit();
    // }

    // ----------------------------------------------------------------------
    // Firebaseデータ登録処理
    // ----------------------------------------------------------------------
    $duplicateFlg = false;
    $reference = $database->getReference($id);
    $data = $reference->getValue();
    foreach ($data as $key => $value) {
        if ($url == $value['url']) {
            //重複URLがある場合は更新処理
            $duplicateFlg = true;
            $database->getReference($id."/".$key)->update([
                'titleTag' => $tagLine
            ]);

            //返信メッセージ
            $return_message_array[] = ['type' => 'text', 'text' => '動画を更新しました'];
            sending_messages($accessToken, $replyToken, $return_message_array);
            exit();
        }
    }

    // 重複URLがなければ場合は新規追加
    if (!$duplicateFlg) {
        $newPost = $database->getReference($id)->push([
            'url' => $url,
            'indate' => date('Y/m/d'),
            'titleTag' => $tagLine,
            'duration' => 0,
            'title' => 'hoge',
            'sceneTag' => [
                '00:00~01:00' => '#hoge',
                '01:00~02:00' => '#foo'
            ]
         ]);
        //返信メッセージ
        $return_message_array[] = ['type' => 'text', 'text' => '動画を登録しました'];
        sending_messages($accessToken, $replyToken, $return_message_array);
        exit();
    }
} elseif (!$resultGetURL && $resultGetTag) {
    //テスト用
    // ob_start();
    // var_dump($matches);
    // $result = ob_get_contents();
    // ob_end_clean();
    // $file = fopen("./log/errorlog.txt", "a");
    // fputs($file, $result);
    // fclose($file);
    // exit();

    // ----------------------------------------------------------------------
    // データ取得処理
    // ----------------------------------------------------------------------
    $keyword = mb_substr($matches['tags'][0], 1);

    // 予約名「#タグ一覧」の場合は登録されているタグ名を一覧表示
    if ($keyword == "タグ一覧") {
        // $sqlSelect = "SELECT tag FROM " . $tableName;
        // $stmt = $pdo->query($sqlSelect);
        // $status = $stmt->execute();

        // if ($status == false) {
        //     $error = $stmt->errorInfor();
        //     $return_message_array[] = ['type' => 'text', 'text' => $error[2]];
        // } else {
        //     while ($result[] = $stmt->fetch(PDO::FETCH_ASSOC));
        //     foreach ($result as $value) {
        //         if ($value["tag"] !== null) {
        //             if (mb_substr_count($value["tag"], "＃", "UTF-8") > 1 || mb_substr_count($value["tag"], "#", "UTF-8") > 1) {
        //                 $value["tag"] = str_replace("　", "", $value["tag"]);
        //                 $tagListTmp = explode(" ", $value["tag"]);
        //                 foreach ($tagListTmp as $value) {
        //                     if ($value !== "") {
        //                         $tagList[] = $value;
        //                     }
        //                 }
        //             } else {
        //                 $tagListTmp = explode(" ", $value["tag"]);
        //                 foreach ($tagListTmp as $value) {
        //                     if ($value !== "") {
        //                         $tagList[] = $value;
        //                     }
        //                 }
        //             }
        //         }
        //     }
        //     $val = array_unique($tagList);
        //     $tagListOrdered = array_values($val);
        //     $return_message_array[0]['type'] = 'text';

        //     foreach ($tagListOrdered as $key => $value) {
        //         if ($key == (count($tagListOrdered) - 1)) {
        //             $return_message_array[0]['text'] .= $value;
        //         } else {
        //             $return_message_array[0]['text'] .= $value."\n";
        //         }
        //     }
        // }

        // ----------------------------------------------------------------------
        // Firebaseデータ取得処理(タグ一覧)
        // ----------------------------------------------------------------------
        $reference = $database->getReference($id);
        $data = $reference->getValue();

        foreach ($data as $key => $value) {
            if ($value["titleTag"] !== null) {
                if (mb_substr_count($value["titleTag"], "＃", "UTF-8") > 1 || mb_substr_count($value["titleTag"], "#", "UTF-8") > 1) {
                    $value["titleTag"] = str_replace("　", "", $value["titleTag"]);
                    $tagListTmp = explode(" ", $value["titleTag"]);
                    foreach ($tagListTmp as $value) {
                        if ($value !== "") {
                            $tagList[] = $value;
                        }
                    }
                } else {
                    $tagListTmp = explode(" ", $value["titleTag"]);
                    foreach ($tagListTmp as $value) {
                        if ($value !== "") {
                            $tagList[] = $value;
                        }
                    }
                }
            }
        }

        $val = array_unique($tagList);
        $tagListOrdered = array_values($val);
        $return_message_array[0]['type'] = 'text';

        foreach ($tagListOrdered as $key => $value) {
            if ($key == (count($tagListOrdered) - 1)) {
                $return_message_array[0]['text'] .= $value;
            } else {
                $return_message_array[0]['text'] .= $value."\n";
            }
        }

        //返信実行
        sending_messages($accessToken, $replyToken, $return_message_array);
        exit();
    }

    // 予約名「#サインイン」の場合はfutsal_movies_usersテーブルにidのみのレコードを作成
    if ($keyword == "サインイン") {
        $sqlInsert = "INSERT INTO futsal_movies_users(id) VALUES(:id)";
        $stmt = $pdo->prepare($sqlInsert);
        $stmt->bindValue(':id', $id, PDO::PARAM_STR);  //Integer（数値の場合 PDO::PARAM_INT)
        $status = $stmt->execute();
        
        //データ登録処理後
        if ($status==false) {
            //SQL実行時にエラーがある場合
            $return_message_array[] = ['type' => 'text', 'text' => '既にユーザーが登録されています'];
            sending_messages($accessToken, $replyToken, $return_message_array);
            exit();
        } else {
            //返信メッセージ
            $return_message_array[] = ['type' => 'text', 'text' => '登録するユーザー名を入力下さい'];
            sending_messages($accessToken, $replyToken, $return_message_array);
            exit();
        }
    }
    
    //タグ名でデータ取得
    // $sqlSelect = "SELECT tag, url FROM " . $tableName . " WHERE tag LIKE :keyword";
    // $stmt = $pdo->prepare($sqlSelect);
    // $stmt->bindValue(':keyword', '%'.$keyword.'%', PDO::PARAM_STR);
    // $status = $stmt->execute();
    
    // if ($status == false) {
    //     $error = $stmt->errorInfor();
    //     $return_message_array[] = ['type' => 'text', 'text' => $error[2]];
    // } else {
    //     while ($result[] = $stmt->fetch(PDO::FETCH_ASSOC));
    //     foreach ($result as $value) {
    //         if ($value["tag"] !== null) {
    //             $return_message_array[] = ['type' => 'text', 'text' => $value["tag"]."\n".$value["url"]];
    //         }
    //     }
    // }

    // ----------------------------------------------------------------------
    // Firebaseデータ取得処理(タグ検索)
    // ----------------------------------------------------------------------
    $reference = $database->getReference($id);
    $data = $reference->getValue();

    foreach ($data as $key => $value) {
        if (strpos($value['titleTag'], $keyword)) {
            $return_message_array[] = ['type' => 'text', 'text' => $value["titleTag"]."\n".$value["url"]];
        }
    }

    //返信実行
    sending_messages($accessToken, $replyToken, $return_message_array);
    exit();
}

// ----------------------------------------------------------------------
// ユーザー名＆PW登録処理
// ----------------------------------------------------------------------
$sqlSelect = "SELECT count(*) as CNT, lname, lpw FROM futsal_movies_users WHERE id = :id";
$stmt = $pdo->prepare($sqlSelect);
$stmt->bindValue(':id', $id, PDO::PARAM_STR);
$status = $stmt->execute();

if ($status == false) {
    $error = $stmt->errorInfo();
    $file = fopen("./log/errorlog.txt", "a");
    fwrite($file, $error[2]."\n");
    fclose($file);
} else {
    $result = $stmt->fetch();
    if ($result['CNT'] == 0) {
        // $return_message_array[] = ['type' => 'text', 'text' => 'count == 0: (何もしない)'];
        // sending_messages($accessToken, $replyToken, $return_message_array);
        // exit();
    } elseif ($result['lname'] == null) {
        //データ更新(lname登録)
        $sqlUpdate = "UPDATE futsal_movies_users SET lname = :lname WHERE id = :id";
        $stmt = $pdo->prepare($sqlUpdate);
        $stmt->bindValue(':lname', $message_text, PDO::PARAM_STR);  //Integer（数値の場合 PDO::PARAM_INT)
        $stmt->bindValue(':id', $id, PDO::PARAM_STR);  //Integer（数値の場合 PDO::PARAM_INT)
        $status = $stmt->execute();

        //データ更新処理後
        if ($status==false) {
            //SQL実行時にエラーがある場合（エラーオブジェクト取得して表示）
            $error = $stmt->errorInfo();
            $return_message_array[] = ['type' => 'text', 'text' => $error[2]];
            sending_messages($accessToken, $replyToken, $return_message_array);
            
            exit();
        } else {
            //返信メッセージ
            $return_message_array[] = ['type' => 'text', 'text' => "ユーザー名「".$message_text."」を登録しました"];
            $return_message_array[] = ['type' => 'text', 'text' => "続いて登録するパスワードを入力下さい"];
            
            //返信実行
            sending_messages($accessToken, $replyToken, $return_message_array);
            exit();
        }
    } elseif ($result['lpw'] == null) {
        //データ更新(lpw登録)
        $lpw = password_hash($message_text, PASSWORD_DEFAULT);
        $sqlUpdate = "UPDATE futsal_movies_users SET lpw = :lpw WHERE id = :id";
        $stmt = $pdo->prepare($sqlUpdate);
        // $stmt->bindValue(':lpw', $message_text, PDO::PARAM_STR);  //Integer（数値の場合 PDO::PARAM_INT)
        $stmt->bindValue(':lpw', $lpw, PDO::PARAM_STR);  //Integer（数値の場合 PDO::PARAM_INT)
        $stmt->bindValue(':id', $id, PDO::PARAM_STR);  //Integer（数値の場合 PDO::PARAM_INT)
        $status = $stmt->execute();

        //データ更新処理後
        if ($status==false) {
            //SQL実行時にエラーがある場合（エラーオブジェクト取得して表示）
            $error = $stmt->errorInfo();
            $return_message_array[] = ['type' => 'text', 'text' => $error[2]];
            sending_messages($accessToken, $replyToken, $return_message_array);
            exit();
        } else {
            //返信メッセージ
            $return_message_array[] = ['type' => 'text', 'text' => "パスワード「".$message_text."」を登録しました"];
            
            $uri = "https://kendai912.sakura.ne.jp/Linebot/login.php";
            $title = "登録したFutsal動画の編集";
            $return_message_array[] = ['type' => 'template', 'title' => $title, 'uri' => $uri];

            sending_messages($accessToken, $replyToken, $return_message_array);
            exit();
        }
    }
}
