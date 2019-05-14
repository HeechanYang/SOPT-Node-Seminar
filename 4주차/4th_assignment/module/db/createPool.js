const createPool = {
    runQuery: function(query, params, callback){
        pool.getConnection((err, connection) => {
            connection.query(query, params, (err, result) => {
                if (err) {
                    console.log(err);
                } else {
                    console.log(result);
                }
                connection.release();
            });
            //connection.release(); 잘못된 위치!!!
            //release와 query 둘 다 비동기적으로 처리되기 때문에 query 날리기 전에 connection 반납될 수 있음
        });
    }
}

module.exports = createPool;