const fs = require('fs');
const utils = require('../../module/utils/utils');
const moment = require('moment');
const csvtojson = require('csvtojson');
const json2csv = require('json2csv');
const statusCode = require('../../module/utils/statusCode');

const FILE_NAME_BOARDS = "./boards.csv";
const SIMPLE_DATE_FORMAT = 'YYYY-MM-DD hh:mm:ss'

const fileUtil = {
    writeFile: (res, resultCsv, msg) => {
        fs.writeFile(FILE_NAME_BOARDS, resultCsv, (err) => {
            if (err) {
                console.log(err);
                res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(statusCode.INTERNAL_SERVER_ERROR, err));
            } else {
                res.status(statusCode.OK).send(utils.successTrue(statusCode.OK, msg, moment().format(SIMPLE_DATE_FORMAT)));
            }
        })
    },
    checkFileExist: (res, func) => {
        if (fs.existsSync(FILE_NAME_BOARDS)) {
            csvtojson()
                .fromFile(FILE_NAME_BOARDS)
                .then(function (boardJson) {
                    func(JSON.parse(boardJson[0].data));
                });
        } else {
            func({
                id: [],
                title: [],
                contents: [],
                createdTime: [],
                password: [],
                salt: []
            });
        }
    },
    jsonToCsv: (data) => {
        return json2csv.parse({
            'data': data,
            'fields': Object.keys(data)
        });
    }
};

module.exports = fileUtil;