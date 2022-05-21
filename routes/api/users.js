const express = require('express');
const router = express.Router();
const { body, validationResult } = require("express-validator");
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const normalize = require('normalize-url');

const User = require('../../models/User');

// @route GET api/users
// @des   Register user
// @acess Public
router.post(
  "/",
  [
    body("name", "Name is required").not().isEmpty(),
    body("email", "Please include a valid email").isEmail(),
    body("password", "Please enter a password with 6 or more letters")
    .isLength({ min: 6 })
  ],
  async (req, res) => {
    const errors = validationResult(req);                              // validating inputs
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
 
		const {name, email, password}  = req.body;

		try {
			let user = await User.findOne({email})                        

			if(user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "User already exists" }] });       // if user already exists
      }

			const avatar = normalize(
				gravatar.url(email, {                          // obtaining gravatar of user
				s: '200',
				r: 'pg',
				d: 'mm'
			}),
			{forceHttps: true},);

			user = new User({
				name,
				email,
				avatar,
				password
			})

			const salt = await bcrypt.genSalt(10);                       // incrypting users password
			user.password = await bcrypt.hash(password, salt);

			await user.save();                                           // saving user
       
			const payload = {                                            // payload for jwt
				user: {
					id: user.id                                  // we can use .id in place of _.id
				}
			}

			jwt.sign(                                  // sending jwt token with payload and secret , automatic logout after 7 days
				payload,
				config.get('jwtSecret'),
				{ expiresIn: 360000 },
				(err,token) => {
					if(err) throw err;
					res.json({ token });
				}
			);

    } `catch` (err) {
				console.error(err.message)
				res.status(500).send('Server error')
		}

  }
);

module.exports = router;