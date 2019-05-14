const mysql = require('mysql');
const config = require('../../config/db_config');

const connection = mysql.createConnection(config);

const insertUserQuery = 'INSERT INTO user (id, name, password, salt) VALUES (?, ?, ?, ?)';

//트렌젝션 처리 시작
connection.beginTransaction((err) => {
    if (err) {
        throw err;
    }
    //첫번째 쿼리
    connection.query(insertUserQuery, ['idididid', 'namenamename', 'hashedPassword', 'saltsaltsaltsalt'], (err, result1) => {
        if (err) {
            console.log('Insert 1 fail');
            //console.log(err);
            //실패하였으면 결과 되돌리기
            connection.rollback(function() {
                console.error('rollback error');
                throw err;
            });
        } else {
            console.log(result1);
            //affectedRows: 처리된 레코드 수
            //insertId: AI로 자동 증가 처리한 userIdx의 값
            console.log('Insert 1 success');

            //두번째 쿼리:일부러 에러나게 만듬
            connection.query(insertUserQuery, ['아무개2', 0, null], (err, result2) => {
                if (err) {
                    console.log('Insert 2 fail');
                    //console.log(err);
                    connection.rollback(function() {
                        console.error('1. error');
                        throw err;
                    });
                } else {
                    console.log(result2);
                    console.log('Insert 2 success');
                    //두개의 쿼리가 모두 잘 작동하였으면 결과 반영
                    connection.commit(function(err) {
                        if (err) {
                            //console.error(err);
                            //만약 commit이 에러가 나면
                            connection.rollback(function() {
                                console.error('2.error');
                                throw err;
                            });
                        }
                    });
                }
            })
        }
    });
});