const express = require("express");
const {
  registerUser,
  currentUser,
  loginUser,
  updateUser,
  deleteUser,
  deposit,
  withdraw,
transfer} = require("../controllers/userController");
const validateToken = require("../middleware/validateTokenHandler");

const router = express.Router();

router.post("/register", registerUser);

router.post("/login", loginUser);

router.post("/deposit", deposit);

router.post("/withdraw", withdraw);

router.post("/transfer", transfer);

router.put("/update/:id", updateUser );

router.get("/update/:id", validateToken, currentUser);

router.delete("/delete/:id", deleteUser);



module.exports = router;
