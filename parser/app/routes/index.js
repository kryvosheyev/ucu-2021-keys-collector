var express = require('express');
var router = express.Router();

router.get('/health', async (req, res, next) => {
    try {
        console.log("/health was invoked on parser.");
        return res.status(200).send({health:"OK"});
    }
    catch (err) {
        console.log("/health: Error - ", err);
        next(err);
    }
});


module.exports = router;
