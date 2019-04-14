const http = require('http');
const url = require('url');
const querystring = require('querystring');
const crypto = require('crypto');

// 3000번 포트 사용
const port = 3001;
const HASHING_CNT = 10;
const HASHING_LENGTH = 32;
const HASHING_ALGORITHM = "SHA512";
const ENCODING = "base64";

const HEADER_CONTENT_TYPE = "Content-Type";

const CONTENT_TYPE_JSON = "application/json";
const CONTENT_TYPE_TEXT = "text/plain";

const server = http.createServer((req, res) => {
    let urlParsed = url.parse(req.url);
    console.log(`[${urlParsed.path}]`);
    // TODO : 정상 요청 이후 한 번 더 요청이 들어옴.
    // '/favicon.ico'
    // 따라서 `if(urlParsed.pathname=="/"){`을 해줌으로써 나머지 요청은 무시
    if(urlParsed.pathname=="/"){
        const parsedQuerystring = querystring.parse(urlParsed.query);
        let str = parsedQuerystring.str;
    
        crypto.randomBytes(HASHING_LENGTH, (err, buf) => {
            if(err){
                let resMsg = {
                    msg: err
                };

                doResponse(res, 500, resMsg);
            }else{
                const salt = buf.toString(ENCODING);
                crypto.pbkdf2(str, salt, HASHING_CNT, HASHING_LENGTH, HASHING_ALGORITHM, (err, result)=>{
                    if(err){
                        console.log(err);

                        let resMsg = {
                            msg: "FAIL"
                        };

                        doResponse(res, 500, resMsg);
                    }else{
                        const hashedStr = result.toString(ENCODING);
                        
                        let resMsg = {
                            msg: "SUCCESS",
                            hashed: hashedStr
                        };
                        doResponse(res, 200, resMsg);
                    }
                })
            }
        });
    }
}).listen(port, () => {
    console.log("Server was created on port number " + port);
});

function doResponse(res, statusCode, json){
    res.writeHead(statusCode, {HEADER_CONTENT_TYPE : CONTENT_TYPE_JSON})
    res.write(JSON.stringify(json));
    res.end();
}