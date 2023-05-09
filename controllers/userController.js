const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Account = require("../models/userModel");



const registerUser = asyncHandler(async (req, res) => {
  const { fname, lname, phone, acno, password } = req.body;
  if (!fname || !lname || !phone || !acno || !password) {
    res.status(400);
    throw new Error("All fields are mandatory!");
  }
  const userAvailable = await Account.findOne({ acno });
  if (userAvailable) {
    res.status(400);
    throw new Error("User already registered!");
  }



  const hashedPassword = await bcrypt.hash(password, 10);
  console.log("Hashed Password: ", hashedPassword);
  const account = await Account.create({
    fname,
    lname,
    phone,
    acno,
    password: hashedPassword,
    balance:0,
    transaction:[]
  });

  console.log(`Account created ${account}`);
  if (account) {
    res.status(201).json({
      _id: account.id,
      acno: account.acno,
      message: "Successfully registered!!"
    });
  } else {
    res.status(400);
    throw new Error("User data is not valid");
  }
  res.json({ message: "Register the user" });
});



const loginUser = asyncHandler(async (req, res) => {
  const { acno, password } = req.body;
  if (!acno || !password) {
    res.status(400);
    throw new Error("All fields are mandatory!");
  }
  const account = await Account.findOne({ acno });
  if (!account) {
    res.status(401).json({
      message:"User not found!!"
    });
  }
  console.log(account);
  console.log(account._id);


  if (account && (await bcrypt.compare(password, account.password))) {
    const accessToken = jwt.sign(
      {

        "fname": account.fname,
        "lname": account.lname,
        "id": account._id

      },
      process.env.ACCESS_TOKEN_SECERT,
      { expiresIn: "10m" }
    );
    res.status(200).json({
      accessToken,
      account,
      //"fname": account.fname,"lname": account.lname,phone:account.phone,acno:account.acno,balance:account.balance,balance:account.balance
      message: "Login successfull"
    });
  } else {
    res.status(401).json({
      message:"Account number or password is not valid"
    });
    //throw new Error("Account number or password is not valid");
  }
});



const currentUser = asyncHandler(async (req, res) => {
  const account = await Account.findById(req.params.id)
  res.status(200).json(account);
});



const updateUser = asyncHandler(async (req, res) => {
  const updatedUser = await Account.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  res.status(200).json({
    updatedUser,
    message: "Successfully updated",
  });
});




const deleteUser = asyncHandler(async (req, res) => {
  const deletedUser = await Account.findById(req.params.id);
  if (!deletedUser) {
    res.status(404);
    throw new Error("User not found!");
  }
  await Account.deleteOne(deletedUser);

  res.status(200).json({
    message: " Account deleted successfully!!"
  });
});

const deposit = asyncHandler(async (req, res) => {
  const { acno, password, amount } = req.body;
  const account = await Account.findOne({ acno });

  if (account && (await bcrypt.compare(password, account.password))) {
    const amt = Number(amount);
    console.log(account.balance);
    console.log( account.transaction);
    account.balance += amt;
    account.transaction.push({
      type: "CREDIT",
      amount: amt,
      date: new Date()
    })
    await account.save();
    res.status(200).json({
      account,
      message: `Rs. ${amt} deposited successfully`
    });
  } else {
    res.status(401);
    throw new Error("Account number or password is not valid");
  }
});



const withdraw = asyncHandler(async (req, res) => {
  const { acno, password, amount } = req.body;
  const account = await Account.findOne({ acno });

  if (account && (await bcrypt.compare(password, account.password))) {
    const amt = Number(amount);
    console.log(account.balance);
    console.log( account.transaction);
    if (amt<=account.balance) {
      account.balance -= amt;
    account.transaction.push({
      type: "DEBIT",
      amount: amt,
      date: new Date()
    })
    await account.save();
    res.status(200).json({
      account,
      message: `Rs. ${amt} debited successfully`
    });
    }else{
      res.status(401).json({
        message: "Insufficient balance"
      });
    }
    
  } else {
    res.status(401);
    throw new Error("Account number / password is not valid");
  }
});




const transfer = asyncHandler(async (req, res) => {
  const { acno, password, amount, acno1 } = req.body;
  const account = await Account.findOne({ acno });
  const account1 = await Account.findOne({ acno: acno1 });

  if (account && (await bcrypt.compare(password, account.password))) {
    const amt = Number(amount);
    console.log(account.balance);
    console.log(account.transaction);
    if (amt <= account.balance) {
      if (account1) {
        account.balance -= amt;
        account1.balance += amt;

        account.transaction.push({
          type: "DEBIT",
          amount: amt,
          date: new Date()
        });
        await account.save();

        account1.transaction.push({
          type: "CREDIT",
          amount: amt,
          date: new Date()
        });
        await account1.save();

        res.status(200).json({
          account,
          account1,
          message: `Rs. ${amt} debited successfully`
        });
      } else {
        res.status(401).json({
          message: "Beneficiary account not found"
        });
      }
    } else {
      res.status(401).json({
        message: "Insufficient balance"
      });
    }
  } else {
    res.status(401);
    throw new Error("Account number / password is not valid");
  }
});


  





module.exports = { registerUser, loginUser, currentUser, updateUser, deleteUser, deposit, withdraw, transfer };
