var express = require('express');
var router = express.Router();

const defaultRes = require('../../module/utils/utils');
const statusCode = require('../../module/utils/statusCode');
const resMessage = require('../../module/utils/responseMessage');
const encrypt = require('../../module/utils/encrypt');
const db = require('../../module/pool'); //createPool을 해서 여러 개의 connection을 가져온 상태 

router.post('/signup', async(req, res) => {
  const id = req.body.id;
  const name = req.body.name;
  let gender = Number(req.body.gender);
  let password = req.body.password;
  const params = [id, name, gender];

  const getMembershipQuery = "SELECT * FROM membership WHERE id = ?";
  const getMembershipResult = await db.queryParam_Parse(getMembershipQuery, [id]);

  if (getMembershipResult.length > 0) {
    res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.MEMBERSHIP_INSERT_DUPLICATE));
  }else{
    encrypt.getSalt(res, async (salt) => {
      encrypt.getHashedPassword(password, salt, res, async (hashedPassword) => {
        params.push(hashedPassword);
        params.push(salt);
        const insertMembershipQuery = "INSERT INTO membership (id, name, gender, password, salt) VALUES (?, ?, ?, ?, ?)";
        const insertMembershipResult = await db.queryParam_Parse(insertMembershipQuery, params);

        if (!insertMembershipResult) {
          res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.MEMBERSHIP_INSERT_FAIL));
        } else { //쿼리문이 성공했을 때
          res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.MEMBERSHIP_INSERT_SUCCESS));
        }
      });
    });
  }
});

router.post('/signin', async(req, res) => {
  const id = req.body.id;
  let password = req.body.password;

  const getMembershipByIdQuery = 'SELECT * FROM membership WHERE id = ?';
  const getMembershipByIdResult = await db.queryParam_Parse(getMembershipByIdQuery, [id]);
  const firstMembershipByIdResult = getMembershipByIdResult[0];
  
  if (!firstMembershipByIdResult) {
      res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.MEMBERSHIP_SELECT_FAIL));
  } else { //쿼리문이 성공했을 때
    encrypt.getHashedPassword(password, firstMembershipByIdResult.salt, res, async(hashedPassword)=> {
      if (firstMembershipByIdResult.password !== hashedPassword) {
          res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.MEMBERSHIP_SELECT_FAIL));
      } else { // 로그인 정보가 일치할 때
        // password, salt 제거
        delete firstMembershipByIdResult.password;
        delete firstMembershipByIdResult.salt;

        res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.MEMBERSHIP_SELECT_SUCCESS, firstMembershipByIdResult));
      }
    });
  }
});

module.exports = router;