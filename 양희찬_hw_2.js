const http = require('http');
const url = require('url');
const querystring = require('querystring');
const crypto = require('crypto');
const fs = require('fs');
const json2csv = require('json2csv');
const csvtojson = require('csvtojson');
const request = require('request');

// 3000번 포트 사용
const port = 3000;
const HASHING_CNT = 10;
const HASHING_LENGTH = 32;
const HASHING_ALGORITHM = "SHA512";
const ENCODING = "base64";

const FILE_NAME_ACCOUNT = "./account.csv";
const FILE_NAME_INFO = "./info.csv";

const HEADER_CONTENT_TYPE = "Content-Type";

const CONTENT_TYPE_JSON = "application/json; charset=utf-8";
const CONTENT_TYPE_TEXT = "text/plain; charset=utf-8";

const PATH_SIGN_IN = "/signin";
const PATH_SIGN_UP = "/signup";
const PATH_SIGN_INFO = "/info";

const server = http.createServer((req, res) => {
    let urlParsed = url.parse(req.url);
    let parsedQuerystring = querystring.parse(urlParsed.query);

    console.log(`[pathname : ${urlParsed.path}]\n`);

    let resMsg = {
        msg: ""
    };

    if (urlParsed.pathname === PATH_SIGN_UP) {
        let id = parsedQuerystring.id;
        let pw = parsedQuerystring.pw;

        crypto.randomBytes(HASHING_LENGTH, (err, buf) => {
            if (err) {
                resMsg.msg = err;

                doResponse(res, 500, resMsg);
            } else {
                const salt = buf.toString(ENCODING);
                crypto.pbkdf2(pw, salt, HASHING_CNT, HASHING_LENGTH, HASHING_ALGORITHM, (err, result) => {

                    if (err) {
                        console.log(err);
                        resMsg.msg = err;

                        doResponse(res, 500, resMsg);
                    } else {
                        const hashedPw = result.toString(ENCODING);

                        const resultCsv = json2csv.parse({
                            'id': id,
                            'pw': hashedPw,
                            'salt': salt
                        });

                        fs.writeFile(FILE_NAME_ACCOUNT, resultCsv, (err) => {
                            if (err) {
                                console.log(err);
                                resMsg.msg = "Write file FAIL";
                                doResponse(res, 500, resMsg);
                            } else {
                                resMsg.msg = "Sign-Up SUCCESS";
                                doResponse(res, 200, resMsg);
                            }
                        })
                    }
                })
            }
        });
    } else if (urlParsed.pathname === PATH_SIGN_IN) {
        let id = parsedQuerystring.id;
        let pw = parsedQuerystring.pw;

        if (fs.existsSync(FILE_NAME_ACCOUNT)) {
            csvtojson()
                .fromFile(FILE_NAME_ACCOUNT)
                .then(function (accountsJson) { 
                    let findRow;

                    accountsJson.forEach(function (row) {
                        if (id === row.id) {
                            findRow = row;
                            return false;
                        }
                    });

                    if (findRow !== undefined) {
                        let tempPw = findRow.pw;
                        let salt = findRow.salt;
                        crypto.pbkdf2(pw, salt, HASHING_CNT, HASHING_LENGTH, HASHING_ALGORITHM, (err, result) => {
                            if (err) {
                                console.log(err);

                                resMsg.msg = "Fail to encrypt using pbkdf2"

                                doResponse(res, 500, resMsg);
                            } else {
                                const hashedPw = result.toString(ENCODING);

                                if (hashedPw === tempPw) {
                                    resMsg.msg = "Sign-In SUCCESS";
                                } else {
                                    resMsg.msg = "Sign-In FAIL. Invalid PW";
                                }
                                doResponse(res, 200, resMsg);
                            }
                        })
                    } else {
                        resMsg.msg = "Fail to find id : " + id;
                        doResponse(res, 500, resMsg);
                    }
                })
        } else {
            resMsg.msg = "Account file does not exist"
            doResponse(res, 500, resMsg);
        }
    } else if (urlParsed.pathname === PATH_SIGN_INFO) {
        let reqBody = {
            name: "양희찬",
            phone: "010-9248-4270"
        };

        const options = {
            uri: 'http://15.164.75.18:3000/homework/2nd',
            method: 'POST',
            form: reqBody
        }

        request(options, (err, response, body) => {
            if (err) {
                console.log(err);
                resMsg.msg = "request error";
                doResponse(res, 500, resMsg);
            } else {
                const resData = JSON.parse(body).data;

                // console.log(resData);

                const resultCsv = json2csv.parse(resData);

                fs.writeFile(FILE_NAME_INFO, resultCsv, (err) => {
                    if (err) {
                        resMsg.msg = "Write file FAIL";
                        doResponse(res, 500, resMsg);
                    } else {
                        resMsg.msg = "Write file SUCCESS";
                        doResponse(res, 200, resMsg);
                    }
                })
            }
        });
    }
}).listen(port, () => {
    console.log("Server was created on port number " + port);
});

function doResponse(res, statusCode, json) {
    console.log(json);

    res.writeHead(statusCode, {
        HEADER_CONTENT_TYPE: CONTENT_TYPE_JSON
    })
    res.write(JSON.stringify(json));
    res.end();
}