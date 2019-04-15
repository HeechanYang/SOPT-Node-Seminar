const http = require('http');
const url = require('url');
const querystring = require('querystring');
const request = require('request');
const json2csv = require('json2csv');
const fs = require('fs');

// 3000번 포트 사용
const port = 3001;
const HASHING_CNT = 10;
const HASHING_LENGTH = 32;
const HASHING_ALGORITHM = "SHA512";
const ENCODING = "base64";

const HEADER_CONTENT_TYPE = "Content-Type";

const CONTENT_TYPE_JSON = "application/json; charset=utf-8";
const CONTENT_TYPE_TEXT = "text/plain; charset=utf-8";

const server = http.createServer((req, res) => {
    let urlParsed = url.parse(req.url);
    console.log(`[${urlParsed.path}]`);
    // TODO : 정상 요청 이후 한 번 더 요청이 들어옴.
    // '/favicon.ico'
    // 따라서 `if(urlParsed.pathname=="/"){`을 해줌으로써 나머지 요청은 무시
    if (urlParsed.pathname == "/") {
        const options = {
            uri: 'http://15.164.75.18:3000/homework/2nd',
            method: 'GET',
        }

        request(options, (err, response, body) => {
            let data = {
                "msg": "",
                "resData": null,
                "resultCsv": null
            };

            //console.log(response);

            if (err) {
                doResponse(res, 500, data);
            } else {
                const resData = JSON.parse(body).data;
                data.resData = resData;
    
                const resultCsv = json2csv.parse({
                    data: resData,
                    fields: ["time"]
                });
                data.resultCsv = resultCsv;
    
                fs.writeFile('getData.csv', resultCsv, (err) => {
                    if (err) {
                        data.msg = "파일 저장 에러";
                        doResponse(res, 500, data);
                    } else {
                        console.log()
                        data.msg = "모두 다 성공!";
                        doResponse(res, 200, data);
                    }
                });
            }
        });
    };
}).listen(port, () => {
    console.log("Server was created on port number " + port);
});

function doResponse(res, statusCode, json) {
    res.writeHead(statusCode, {
        HEADER_CONTENT_TYPE: CONTENT_TYPE_JSON
    })
    res.write(JSON.stringify(json));
    res.end();
}