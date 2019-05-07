var express = require('express');
var router = express.Router();
const moment = require('moment');

const utils = require('../../module/utils/utils');
const boardUtil = require('../../module/utils/boardUtil');
const fileUtil = require('../../module/utils/fileUtil');
const responseMessage = require('../../module/utils/responseMessage');
const statusCode = require('../../module/utils/statusCode');

const SIMPLE_DATE_FORMAT = 'YYYY-MM-DD hh:mm:ss'

// 해당 ID의 게시글 조회
router.get('/:id', async (req, res) => {
    const id = Number(req.params.id)
    fileUtil.checkFileExist(res, (data) => {
        boardUtil.indexOf(res, data, id, (targetIdx) => {
            let resData = boardUtil.getBoardAt(data, targetIdx);

            delete resData.password;
            delete resData.salt;

            res.status(statusCode.OK).send(utils.successTrue(statusCode.OK, responseMessage.SEARCH_BOARD_SUCCESS, resData));
        });
    })
});

// 모든 게시글 조회
router.get('/', async (req, res) => {
    fileUtil.checkFileExist(res, (data) => {

        console.log(data);

        delete data.password;
        delete data.salt;
        for(eachData in data){
            delete eachData.password;
            delete eachData.salt;
        }

        res.status(statusCode.OK).send(utils.successTrue(statusCode.OK, responseMessage.SEARCH_BOARD_SUCCESS, data));
    });
});

// 게시글 생성
router.post('/', async (req, res) => {
    const body = req.body;

    fileUtil.checkFileExist(res, (data) => {
        if (data.id.indexOf(newData.id) !== -1) {
            res.status(statusCode.BAD_REQUEST).send(utils.successFalse(statusCode.BAD_REQUEST, "게시글 추가 실패\n해당 id의 게시글이 이미 존재합니다 : " + newData.id));
        } else {
            boardUtil.addBoard(res, data, body)
        }
    });
});

// 게시글 수정
router.put('/', async (req, res) => {
    const body = req.body;

    fileUtil.checkFileExist(res, (data) => {
        boardUtil.modifyBoard(res, data, body);
    });
});

// 해당 게시글 삭제
router.delete('/', async (req, res) => {
    const body = req.body;

    fileUtil.checkFileExist(res, (data) => {
        boardUtil.deleteBoardAt(res, data, body);
    });
});

module.exports = router;
