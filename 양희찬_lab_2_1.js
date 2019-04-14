const http = require('http');
const url = require('url');
const querystring = require('querystring');
const crypto = require('crypto');

const port = 3000;

const server = http.createServer((req, res) => {
    const urlParsed = url.parse(req.url);
    // console.log(urlParsed);
    if(urlParsed.pathname=="/"){
        const parsedQuerystring = querystring.parse(urlParsed.query);
        // console.log(parsedQuerystring);
        let str = parsedQuerystring.password;
    
        console.log('password : '+ str);
    
        crypto.randomBytes(32, (err, buf) => {
            if(err){
                console.log(err);
            }else{
                const salt = buf.toString('base64');
                console.log('salt : ' + salt);
                crypto.pbkdf2(str, salt, 10, 32, "SHA512", (err, result)=>{
                    if(err){
                        console.log(err);
                    }else{
                        console.log('pbkdf2 result : ' + result);
                        const hashedStr = result.toString('base64');
                        console.log('hashedStr : ' + hashedStr);
                        res.writeHead(200, {'Content-Type' : 'application/json'})
                        res.write(hashedStr);
                        res.end();
                    }
                })
            }
        });
    }

}).listen(port, () => {
    console.log("Server was created on port number " + port);
});