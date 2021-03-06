var express = require('express');
var router = express.Router();

const defaultRes = require('../../../module/utils/utils');
const statusCode = require('../../../module/utils/statusCode');
const resMessage = require('../../../module/utils/responseMessage')
const encrypt = require('../../../module/utils/encrypt');
const db = require('../../../module/pool'); //createPool을 해서 여러 개의 connection을 가져온 상태 

router.get('/', async (req, res) => {
  const getAllBoardQuery = 'SELECT b.boardIdx, b.writer, b.title, b.content, b.writetime, m.id AS writerId, m.name AS writerName' +
    ' FROM board b INNER JOIN membership m ON b.writer = m.userIdx';
  //쿼리문에 ? 값이 아무것도 없을 때 queryParam_None 사용
  const getAllBoardResult = await db.queryParam_None(getAllBoardQuery);

  //쿼리문의 결과가 실패이면 null을 반환한다
  if (!getAllBoardResult) { //쿼리문이 실패했을 때
    res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.BOARD_SELECT_FAIL));
  } else { //쿼리문이 성공했을 때
    res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.BOARD_SELECT_SUCCESS, getAllBoardResult));
  }
});

router.get('/:idx', async (req, res) => {
  const targetIdx = Number(req.params.idx);
  
  if(!targetIdx){
    res.status(200).send(defaultRes.successFalse(statusCode.BAD_REQUEST, resMessage.OUT_OF_VALUE));
  }

  const getTargetBoardQuery = 'SELECT b.boardIdx, b.writer, b.title, b.content, b.writetime, m.id AS writerId, m.name AS writerName' +
  ' FROM board b INNER JOIN membership m ON b.writer = m.userIdx WHERE b.boardIdx = ?';
  const getTargetBoardResult = await db.queryParam_Parse(getTargetBoardQuery, targetIdx);

  //쿼리문의 결과가 실패이면 null을 반환한다
  if (!getTargetBoardResult) { //쿼리문이 실패했을 때
    res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.BOARD_SELECT_FAIL));
  } else { //쿼리문이 성공했을 때
    res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.BOARD_SELECT_SUCCESS, getTargetBoardResult));
  }
});

router.post('/', async (req, res) => {
  const writer = Number(req.body.writer);
  const title = req.body.title;
  const content = req.body.content;
  let password = req.body.boardPw;
  const params = [writer, title, content];

  if(!writer || !title || !content || !password){
    res.status(200).send(defaultRes.successFalse(statusCode.BAD_REQUEST, resMessage.OUT_OF_VALUE));
  }

  encrypt.getSalt(res, async (salt) => {
    encrypt.getHashedPassword(password, salt, res, async (hashedPassword) => {
      params.push(hashedPassword);
      params.push(salt);

      const insertBoardQuery = "INSERT INTO board (writer, title, content, writetime, boardPw, salt) VALUES (?, ?, ?, now(), ?, ?)";
      const insertBoardResult = await db.queryParam_Parse(insertBoardQuery, params);

      if (!insertBoardResult) {
        res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.BOARD_INSERT_FAIL));
      } else { //쿼리문이 성공했을 때
        res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.BOARD_INSERT_SUCCESS));
      }
    });
  });

});

router.delete('/', async (req, res) => {
  const targetBoardIdx = req.body.boardIdx;
  let password = req.body.boardPw;

  if(!targetBoardIdx || !password){
    res.status(200).send(defaultRes.successFalse(statusCode.BAD_REQUEST, resMessage.OUT_OF_VALUE));
  }

  const getBoardByIdQuery = 'SELECT * FROM board WHERE boardIdx = ?';
  const getBoardByIdResult = await db.queryParam_Parse(getBoardByIdQuery, [targetBoardIdx]);
  const firstBoardByIdResult = getBoardByIdResult[0];
  
  if (!getBoardByIdResult) {
      res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.BOARD_SELECT_FAIL));
  } else if(!firstBoardByIdResult){
    res.status(200).send(defaultRes.successFalse(statusCode.NO_CONTENT, resMessage.BOARD_NOT_EXIST + ' : ' + targetBoardIdx));
  }else { //쿼리문이 성공했을 때
    encrypt.getHashedPassword(password, firstBoardByIdResult.salt, res, async(hashedPassword)=> {
      if (firstBoardByIdResult.boardPw !== hashedPassword) {
        res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.BOARD_PASSWORD_INVALID));
      } else { // 로그인 정보가 일치할 때
        // password, salt 제거
        delete firstBoardByIdResult.boardPw;
        delete firstBoardByIdResult.salt;

        const deleteBoardQuery = "DELETE FROM board WHERE boardIdx = ?";
        const deleteBoardResult = await db.queryParam_Parse(deleteBoardQuery, [targetBoardIdx]);

        if (!deleteBoardResult) {
          res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.BOARD_DELETE_FAIL));
        } else { //쿼리문이 성공했을 때
          res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.BOARD_DELETE_SUCCESS));
        }
      }
    });
  }
});

module.exports = router;
