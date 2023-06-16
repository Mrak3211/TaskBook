const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const fetchuser = require("../middleware/fetchuser");

const JWT_SECRET = "Ayush";

// Registration Route
router.post(
  "/register",
  [
    body("name", "Enter A Valid Name").isLength({ min: 5 }),
    body("email", "Enter A Valid Email").isEmail(),
    body("password", "Password Must Be Atleast 4 Characters").isLength({
      min: 4,
    }),
  ],
  async (req, res) => {
    // Send Validation Errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      // Check Email is Exist Or Not
      let user = await User.findOne({ email: req.body.email });

      if (user) {
        return res.status(400).json({
          status: "Failed",
          message: "User Already Exist With This Email",
        });
      }
      let pass = req.body.password === req.body.cpassword;
      if (!pass) {
        return res.status(400).json({
          status: "Failed",
          message: "Password and Confirm Password Are Must Be Same",
        });
      }

      // Hash Password
      const salt = await bcrypt.genSalt(10);
      const hashPassword = await bcrypt.hash(req.body.password, salt);

      let savedUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: hashPassword,
      });
      // Generate JWT TOKEN
      const data = {
        savedUser,
      };
      const authToken = jwt.sign(data, JWT_SECRET);
      // console.log("authToken============>", authToken);
      // console.log("savedUser============>", savedUser);
      res.status(200).json({
        status: "Success",
        message: "User Register Successfully",
        user: savedUser,
        authToken,
      });
    } catch (error) {
      console.log(error.message);
      res.status(500).json({
        status: "Failed",
        message: "Internal Server Error",
      });
    }
  }
);

// Login Route
router.post(
  "/login",
  [
    body("email", "Enter A Valid Email").isEmail(),
    body("password", "Password Cannot be Blank").exists(),
  ],
  async (req, res) => {
    // Send Validation Errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    try {
      let user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({
          status: "Failed",
          message:
            "Email or Password is not Correct, Please Try To Login With Correct Credentials",
        });
      }
      const checkPassword = await bcrypt.compare(password, user.password);
      if (!checkPassword) {
        return res.status(400).json({
          status: "Failed",
          message:
            "Email or Password is not Correct, Please Try To Login With Correct Credentials",
        });
      }
      // Generate JWT TOKEN
      const data = {
        user,
      };
      const authToken = jwt.sign(data, JWT_SECRET);

      res.status(200).json({
        status: "Success",
        message: "User Login Successfully",
        user: user,
        authToken,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        status: "Failed",
        message: "Internal Server Error",
      });
    }
  }
);

// getUser Route
router.post("/getuser", fetchuser, async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select("-password -Date -__v");
    return res.status(200).json({
      status: "Success",
      message: "User Get Successfully",
      userDetails: user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "Failed",
      message: "Internal Server Error",
    });
  }
});

module.exports = router;
