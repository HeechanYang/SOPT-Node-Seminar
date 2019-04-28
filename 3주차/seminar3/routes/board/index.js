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
router.get('/board/:id', async (req, res) => {
    fileUtil.checkFileExist(res, (data) => {
        boardUtil.indexOf(res, data, req.params.id, (targetIdx) => {
            let resData = boardUtil.getBoardAt(data, targetIdx);

            res.status(statusCode.OK).send(utils.successTrue(statusCode.OK, responseMessage.SEARCH_BOARD_SUCCESS, resData));
        });
    })
});

// 모든 게시글 조회
router.get('/board', async (req, res) => {
    fileUtil.checkFileExist(res, (data) => {
        res.status(statusCode.OK).send(utils.successTrue(statusCode.OK, responseMessage.SEARCH_BOARD_SUCCESS, data));
    });
});

// 게시글 생성
router.post('/board', async (req, res) => {
    const body = req.body;

    const newData = {
        id: body.id,
        title: body.title,
        contents: body.contents,
        createdTime: moment().format(SIMPLE_DATE_FORMAT),
        password: body.password,
        salt: body.salt
    };

    fileUtil.checkFileExist(res, (data) => {
        if (data.id.indexOf(newData.id) !== -1) {
            res.status(statusCode.BAD_REQUEST).send(utils.successFalse(statusCode.BAD_REQUEST, "게시글 추가 실패\n해당 id의 게시글이 이미 존재합니다 : " + newData.id));
        } else {
            boardUtil.addBoard(res, data, newData)
        }
    });
});

// 게시글 수정
router.put('/board', async (req, res) => {
    const body = req.body;

    fileUtil.checkFileExist(res, (data) => {
        boardUtil.modifyBoard(res, data, body);
    });
});

// 해당 게시글 삭제
router.delete('/board', async (req, res) => {
    const body = req.body;

    fileUtil.checkFileExist(res, (data) => {
        boardUtil.deleteBoardAt(res, data, targetIdx, body);
    });
});

module.exports = router;
