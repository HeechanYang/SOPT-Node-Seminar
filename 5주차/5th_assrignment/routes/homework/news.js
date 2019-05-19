var express = require('express');
var router = express.Router();

const upload = require('../../config/multer');
const defaultRes = require('../../module/utils');
const statusCode = require('../../module/statusCode');
const resMessage = require('../../module/responseMessage');
const encrypt = require('../../module/encrypt');
const db = require('../../module/pool');
const moment = require('moment');

router.get('/', async(req, res) => {
  const getNewsQuery = 'SELECT news_id, title, thumbnail, writer_name, created_time ' +
    'FROM news ' +
    'ORDER BY created_time DESC';
  const getNewsResult = await db.queryParam_Parse(getNewsQuery);
  
  if (!getNewsResult) { 
    res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.BOARD_SELECT_FAIL));
  } else { 
    res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.BOARD_SELECT_SUCCESS, getNewsResult));
  }
});

router.get('/:id', async (req, res) => {
  const targetid = Number(req.params.id);

  if (!targetid) {
    res.status(200).send(defaultRes.successFalse(statusCode.BAD_REQUEST, resMessage.OUT_OF_VALUE));
  }

  const getNewsQuery = 'SELECT news_id, thumbnail, title, created_time ' +
    'FROM news ' +
    'WHERE news_id = ?';
  const getNewsResult = await db.queryParam_Parse(getNewsQuery, targetid);
  if (getNewsResult.length < 1) {
    res.status(200).send(defaultRes.successFalse(statusCode.BAD_REQUEST, resMessage. BOARD_NOT_EXIST, []));
  }
  getNewsResult[0].newsInfos = new Array();

  const getNewsInfoQuery = 'SELECT content, content_img FROM newsinfo WHERE news_id = ?';
  const getNewsInfoResult = await db.queryParam_Parse(getNewsInfoQuery, targetid);

  getNewsInfoResult.forEach((newsInfo) => {
    getNewsResult[0].newsInfos.push(newsInfo);
  });

  if (!getNewsResult) {
    res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.BOARD_SELECT_FAIL));
  } else { 
    res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.BOARD_SELECT_SUCCESS, getNewsResult));
  }
});



router.post('/', upload.fields([{ name: 'thumbnail' }, { name: 'imgs' }]), async(req, res) => {
  const {title, writer_name, contents} = req.body;
  const {thumbnail, imgs} = req.files;
  const params = [title, thumbnail[0].location, writer_name];
  const now = moment().format();

  const insertNewsQuery = `INSERT INTO news (title, thumbnail, writer_name, created_time) VALUES (?, ?, ?, '${now}')`;
  const insertNewsResult = await db.queryParam_Parse(insertNewsQuery, params);

  const news_id = insertNewsResult.insertId;
  let insertNewsinfoResult;
  for (let i = 0; i < contents.length; i++) {
    if(contents[i] && imgs[i]){
      const params = [news_id, contents[i], imgs[i].location];
      const insertNewsinfoQuery = "INSERT INTO newsinfo (news_id, content, content_img) VALUES (?, ?, ?)";
      insertNewsinfoResult = await db.queryParam_Parse(insertNewsinfoQuery, params);
    }
  }
  
  if (!insertNewsinfoResult) {
    res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.BOARD_INSERT_FAIL));
  } else { 
    res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.BOARD_INSERT_SUCCESS));
  }
});

module.exports = router;
