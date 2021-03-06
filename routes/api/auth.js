const express = require("express");
const router = express.Router();
const config = require("config");
const auth = require('../../middleware/auth');
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../../models/User");

// @route GET api/auth
// @des   Test route
// @acess Public
router.get("/", auth, async (req, res) => {
  try {
		const user = await User.findById(req.user.id).select('-password');
		
		res.json(user);

	} catch(err) {
			console.error(err.message)
			res.status(500).send('Server Error');
	}
});

// @route POST api/auth
// @des   Authenticate user & get token
// @acess Public
router.post(
  "/",
  [
    body("email", "Please enter a valid email").isEmail(),
    body("password", "Password is required").exists()
  ],
  async (req, res) => {
    const errors = validationResult(req);                              // validating inputs
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
 
		const { email, password } = req.body;

		try {
			let user = await User.findOne({email})                        

			if(!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Invalid Credentials" }] });       // if user doesn't exists
      }
			// to compare password 
			const isMatch = await bcrypt.compare(password, user.password);

			if(!isMatch) {
				return res
          .status(400)
          .json({ errors: [{ msg: "Invalid Credentials" }] });
			}

			const payload = {                                            // payload for jwt
				user: {
					id: user.id
				}
			}

			jwt.sign(                                                    // sending jwt token 
				payload,
				config.get('jwtSecret'),
				{ expiresIn: 360000 },
				(err,token) => {
					if(err) throw err;
					res.json({ token });
				}
			);

    } catch (err) {
				console.error(err.message)
				res.status(500).send('Server error')
		}

  }
);


module.exports = router;
