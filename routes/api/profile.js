const express = require("express");
const router = express.Router();
const auth = require('../../middleware/auth')
const { body, validationResult } = require("express-validator");
const axios = require('axios');
const config = require('config');

const Profile = require('../../models/Profile')
const User = require('../../models/User');
const { route } = require("./users");
const { response } = require("express");

// @route GET api/profile/me
// @des   get current users profile
// @acess Private
router.get("/me", auth, async (req, res) => {
  try {
		const profile = await Profile.findOne({ user: req.user.id}).populate('user', ['name', 'avatar']);

		if(!profile) {
			return res.status(400).json({msg: 'There is no profile for the user'})
		}
		res.json(profile);

	} catch(err) {
		console.error(err.message);
		res.status(500).send('Server Error')
	}
});

// @route POST api/profile
// @des   create or update user profile
// @acess Private
router.post('/', 
[ auth,
	 	[
			body('status', 'Status is required').not().isEmpty(),
			body('skills', 'Skills is required').not().isEmpty(),
		]
], async (req,res) => {
		const errors = validationResult(req);

		if(!errors.isEmpty()) {
			return res.status(400).json({errors: errors.array() });
		}

		const { company, website, location, bio,status, githubusername, skills, youtube, facebook, twitter, instagram, linkedin } = req.body;

		const profileFields = {};
		profileFields.user = req.user.id;
		if (company) profileFields.company = company;
		if (website) profileFields.website = website;
		if (location) profileFields.location = location;
		if (bio) profileFields.bio = bio;
		if (status) profileFields.status = status;
		if (githubusername) profileFields.githubusername = githubusername;
		
		if(skills) {
			profileFields.skills = skills.split(',').map(skill => skill.trim());
		}
		
		profileFields.social = {};
		if (youtube) profileFields.social.youtube = youtube;
		if (twitter) profileFields.social.twitter = twitter;
		if (facebook) profileFields.social.facebook = facebook;
		if (linkedin) profileFields.social.linkedin = linkedin;
		if (instagram) profileFields.social.instagram = instagram;
		
		// update an existing profile
		try {
			let profile = await Profile.findOne({ user: req.user.id})

			if(profile) {
				profile = await Profile.findOneAndUpdate(
          //findByIdAndUpdate
          { user: req.body.id },
          { $set: profileFields },
          { new: true, upsert: true }
        );
				return res.json(profile);
			}
			//create
			profile = new Profile(profileFields);
			await profile.save();
			res.json(profile);

		} catch(err) {
			console.error(err.message)
			res.status(500).send('Server Error')
		}
})

// @route GET api/profile
// @des   get all profiles
// @acess Public
router.get('/', async (req,res) => {
	try {
		const profiles = await Profile.find().populate('user', ['name','avatar']);
		res.json(profiles)  
		
	} catch (err) {
		console.error(err.message)
		res.status(500).send('Server Error')
	}
});

// @route GET api/profile/user/:user_id
// @des   get profile by user ID
// @acess Public
router.get('/user/:user_id', async (req,res) => {
	try {
		const profile = await Profile.findOne({user: req.params.user_id}).populate('user', ['name','avatar']);

		if(!profile) {
			return res.status(400).json({msg: 'Profile not found'})
		}
		res.json(profile)  
	} catch (err) {
		console.error(err.message)
		if(err.kind=='ObjectId') {
			return res.status(400).json({ msg: "Profile not found" });
		}
		res.status(500).send('Server Error')
	}
});


// @route DELETE api/profile
// @des   delete profile, user & post
// @acess Private
router.delete('/', auth, async (req,res) => {
	try {
		// remove profile
		await Profile.findOneAndRemove({ user: req.user.id })
		// remove user
		await User.findOneAndRemove({ _id: req.user.id });
		res.json({msg: 'User Deleted'})  
		
	} catch (err) {
		console.error(err.message)
		res.status(500).send('Server Error')
	}
});

// @route PUT api/profile/experience
// @des   add profile exp
// @acess Private
router.put(
  "/experience",
  [
    auth,
    [
      body("title", "Title is required").not().isEmpty(),
      body("company", "Company is required").not().isEmpty(),
      body("from", "From date is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
		const errors = validationResult(req);
		if(!errors.isEmpty()) {
			return res.status(400).json({errors: errors.array() })
		}

		const { title, company, location, from, to, current, description } = req.body

		const newExp = { title, company, location, from, to, current, description }

		try {
			const profile = await Profile.findOne({ user: req.user.id });

			profile.experience.unshift(newExp);
			await profile.save()
			res.json(profile)

		} catch (err) {
			console.error(err.message)
			res.status(500).send('Server Error')
		}
	}
);

// @route DELETE api/profile/experience/:exp_id
// @des   delete profile exp
// @acess Private

router.delete('/experience/:exp_id', auth, async (req,res) => {
	try {
		const profile = await Profile.findOne({ user: req.user.id });

		// get remove index
		const removeIndex = profile.experience.map( item => item.id).indexOf(req.params.exp_id);

		profile.experience.splice(removeIndex, 1)
		await profile.save()
		res.json(profile)

	} catch (err) {
		console.error(err.message);
    res.status(500).send("Server Error");		
	}
})

// @route PUT api/profile/education
// @des   add profile edu
// @acess Private
router.put(
  "/education",
  [
    auth,
    [
      body("school", "School is required").not().isEmpty(),
      body("degree", "Degree is required").not().isEmpty(),
      body("fieldofstudy", "Field of study is required").not().isEmpty(),
      body("from", "From date is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { school, degree, fieldofstudy, from, to, current, description } =
      req.body;

    const newEdu = {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description,
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });

      profile.education.unshift(newEdu);
      await profile.save();
      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route DELETE api/profile/education/:edu_id
// @des   delete profile edu
// @acess Private

router.delete('/education/:edu_id', auth, async (req,res) => {
	try {
		const profile = await Profile.findOne({ user: req.user.id });

		// get remove index
		const removeIndex = profile.education.map( item => item.id).indexOf(req.params.edu_id);

		profile.education.splice(removeIndex, 1)
		await profile.save()
		res.json(profile)
		
	} catch (err) {
		console.error(err.message);
    res.status(500).send("Server Error");		
	}
})

// @route GET api/profile/github/:username
// @des   get user repos from github
// @acess Public
router.get('/github/:username',  async (req,res) => {
	try {
    const uri = encodeURI(
      `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc`
    );
		
    const headers = {
      "user-agent": "node.js",
      Authorization: `token ${config.get("githubToken")}`,
    };

    const gitHubResponse = await axios.get(uri, { headers });
    return res.json(gitHubResponse.data);

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
})

module.exports = router;
