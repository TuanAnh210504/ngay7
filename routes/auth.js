var express = require("express");
var router = express.Router();
let userController = require('../controllers/users')
let bcrypt = require('bcrypt')
let jwt = require('jsonwebtoken')
let fs = require('fs')
let { ChangePasswordValidator, validatedResult } = require('../utils/validateHandler');
let { CheckLogin } = require('../utils/authHandler');

router.post('/register', async function (req, res, next) {
    try {
        let { username, password, email } = req.body;
        // Schema đã tự động mã hóa password trong hàm pre('save')
        let newUser = await userController.CreateAnUser(
            username, password, email, "69b0ddec842e41e8160132b8"
        )
        res.send(newUser)
    } catch (error) {
        res.status(404).send(error.message)
    }

})
router.post('/login', async function (req, res, next) {
    try {
        let { username, password } = req.body;
        let user = await userController.GetAnUserByUsername(username);
        if (!user) {
            res.status(404).send({
                message: "thong tin dang nhap sai"
            })
            return;
        }
        if (user.lockTime > Date.now()) {
            res.status(404).send({
                message: "ban dang bi ban"
            })
            return
        }
        if (bcrypt.compareSync(password, user.password)) {
            loginCount = 0;
            await user.save()
            let privateKey = fs.readFileSync('private.pem', 'utf8');
            let token = jwt.sign({
                id: user._id
            }, privateKey, {
                algorithm: 'RS256',
                expiresIn: '1h'
            })
            res.send(token)
        } else {
            user.loginCount++;
            if (user.loginCount == 3) {
                user.loginCount = 0;
                user.lockTime = Date.now() + 3600 * 1000
            }
            await user.save()
            res.status(404).send({
                message: "thong tin dang nhap sai"
            })
        }
    } catch (error) {
        res.status(404).send({
            message: error.message
        })
    }

})

router.post('/changepassword', CheckLogin, ChangePasswordValidator, validatedResult, async function (req, res, next) {
    try {
        let { oldpassword, newpassword } = req.body;
        let user = req.user;
        if (!bcrypt.compareSync(oldpassword, user.password)) {
            return res.status(400).send({
                message: "oldpassword khong dung"
            });
        }
        // Schema đã tự hash password trong hàm pre('save')
        user.password = newpassword;
        await user.save();
        res.send({ message: "Doi mat khau thanh cong" });
    } catch (error) {
        res.status(400).send({
            message: error.message
        });
    }
});

router.get('/me', CheckLogin, async function (req, res, next) {
    try {
        // req.user has been populated by CheckLogin middleware
        res.send(req.user);
    } catch (error) {
        res.status(400).send({
            message: error.message
        });
    }
});

module.exports = router;