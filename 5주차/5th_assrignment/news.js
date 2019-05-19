var express = require('express');
var router = express.Router();

const upload = require('../../config/multer');
const defaultRes = require('../../module/utils');
const statusCode = require('../../module/statusCode');
const resMessage = require('../../module/responseMessage');
const encrypt = require('../../module/encrypt');
const db = require('../../module/pool');

router.get('/', async(req, res) => {
  const getNewsQuery = 'SELECT news_id, title, thumbnail, writer_name, created_time ' +
    'FROM news' +
    'ORDER BY created_time DESC';
  const getNewsResult = await db.queryParam_None(getNewsQuery);

  //쿼리문의 결과가 실패이면 null을 반환한다
  if (!getNewsResult) { //쿼리문이 실패했을 때
    res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.BOARD_SELECT_FAIL));
  } else { //쿼리문이 성공했을 때
    res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.BOARD_SELECT_SUCCESS, getNewsResult));
  }
});

router.get('/:idx', async (req, res) => {
  const targetIdx = Number(req.params.idx);

  if (!targetIdx) {
    res.status(200).send(defaultRes.successFalse(statusCode.BAD_REQUEST, resMessage.OUT_OF_VALUE));
  }

  const getTargetBoardQuery = 'SELECT n.news_idx, n.title, i.content, n.created_time ' +
    'FROM news n INNER JOIN newsinfo i ON n.news_id = i.newsinfo_id ' +
    'WHERE n.news_id = ?';
  const getTargetBoardResult = await db.queryParam_Parse(getTargetBoardQuery, targetIdx);

  //쿼리문의 결과가 실패이면 null을 반환한다
  if (!getTargetBoardResult) { //쿼리문이 실패했을 때
    res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.BOARD_SELECT_FAIL));
  } else { //쿼리문이 성공했을 때
    res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.BOARD_SELECT_SUCCESS, getTargetBoardResult));
  }
});

router.post('/', (req, res) => {
  res.send('respond with a resource');
});

module.exports = router;
