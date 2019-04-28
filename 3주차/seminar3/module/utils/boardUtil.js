const statusCode = require('../../module/utils/statusCode');
const utils = require('../../module/utils/utils');
const fileUtil = require('../../module/utils/fileUtil');
const responseMessage = require('../../module/utils/responseMessage');
const crypto = require('crypto');
const moment = require('moment');

const HASHING_CNT = 10;
const HASHING_LENGTH = 32;
const HASHING_ALGORITHM = "SHA512";
const ENCODING = "base64";

const SIMPLE_DATE_FORMAT = 'YYYY-MM-DD hh:mm:ss'

const boardUtil = {
    getBoardAt: (data, idx) => {
        return {
            id: data.id[idx],
            title: data.title[idx],
            contents: data.contents[idx],
            createdTime: data.createdTime[idx],
            password: data.password[idx],
            salt: data.salt[idx]
        }
    },
    addBoard: (res, data, newData) => {
        crypto.randomBytes(HASHING_LENGTH, (err, buf) => {
            if (err) {
                res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(statusCode.INTERNAL_SERVER_ERROR, err));
            } else {
                const salt = buf.toString(ENCODING);
                const pw = newData.password;

                crypto.pbkdf2(pw, salt, HASHING_CNT, HASHING_LENGTH, HASHING_ALGORITHM, (err, result) => {
                    if (err) {
                        res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(statusCode.INTERNAL_SERVER_ERROR, err));
                    } else {
                        const hashedPw = result.toString(ENCODING);

                        data.id.push(newData.id);
                        data.title.push(newData.title);
                        data.contents.push(newData.contents);
                        data.createdTime.push(moment().format(SIMPLE_DATE_FORMAT));
                        data.password.push(hashedPw);
                        data.salt.push(salt);

                        const resultCsv = fileUtil.jsonToCsv(data);

                        fileUtil.writeFile(res, resultCsv, responseMessage.CREATE_BOARD_SUCCESS)
                    }
                });
            }
        });
    },
    modifyBoard: (res, data, newData) => {
        const targetIdx = data.id.indexOf(newData.id);
        crypto.randomBytes(HASHING_LENGTH, (err, buf) => {
            if (err) {
                res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(statusCode.INTERNAL_SERVER_ERROR, err));
            } else {
                const salt = buf.toString(ENCODING);
                const pw = newData.password;

                crypto.pbkdf2(pw, salt, HASHING_CNT, HASHING_LENGTH, HASHING_ALGORITHM, (err, result) => {
                    if (err) {
                        res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(statusCode.INTERNAL_SERVER_ERROR, err));
                    } else {
                        const hashedPw = result.toString(ENCODING);

                        data.title[targetIdx] = newData.title;
                        data.contents[targetIdx] = newData.contents;
                        data.createdTime[targetIdx] = moment().format(SIMPLE_DATE_FORMAT);
                        data.password[targetIdx] = hashedPw;
                        data.salt[targetIdx] = salt;

                        const resultCsv = fileUtil.jsonToCsv(data);

                        fileUtil.writeFile(res, resultCsv, responseMessage.MODIFY_BOARD_SUCCESS)
                    }
                });
            }
        });
    },
    deleteBoardAt: (res, data, idx) => {
        data.id.splice(idx, 1);
        data.title.splice(idx, 1);
        data.contents.splice(idx, 1);
        data.createdTime.splice(idx, 1);
        data.password.splice(idx, 1);
        data.salt.splice(idx, 1);

        const resultCsv = fileUtil.jsonToCsv(data);

        fileUtil.writeFile(res, resultCsv, responseMessage.DELETE_BOARD_SUCCESS)
    },
    indexOf: (res, data, id, funcSuccess) => {
        const targetIdx = data.id.indexOf(Number(id));

        if (targetIdx === -1) {
            res.status(statusCode.BAD_REQUEST).send(utils.successFalse(statusCode.BAD_REQUEST, responseMessage.NOT_EXIST_BOARD));
        } else {
            funcSuccess(targetIdx);
        }
    }
};

module.exports = boardUtil;