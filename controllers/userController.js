const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const generateToken = require("../utils/generateToken");
const router = require("../routes/userRoutes");
const bcrypt = require("bcryptjs");
const Menu = require("../models/menuModel");



const restaurantSignup = async (req, role, res) => {
  try {
    //Get restaurant from database with same name if any
    const validateRestaurantname = async (name) => {
      let restaurant = await User.findOne({ name });
      return restaurant ? false : true;
    };
    //Get employee from database with same email if any
    const validateEmail = async (email) => {
      let restaurant = await User.findOne({ email });
      return restaurant ? false : true;
    };
    // Validate the name
    let nameNotTaken = await validateRestaurantname(req.name);
    if (!nameNotTaken) {
      return res.status(400).json({
        message: `Restaurant name is already taken.`,
      });
    }
    // validate the email
    let emailNotRegistered = await validateEmail(req.email);
    if (!emailNotRegistered) {
      return res.status(400).json({
        message: `Email is already registered.`,
      });
    }
// Hash password using bcrypt
    const password = await bcrypt.hash(req.password, 12);
    // create a new user
    const newRestaurant = new User ({
      ...req,
      password,
      role
    });
    await newRestaurant .save();
    return res.status(201).json({
      message: "Hurry! now you are successfully registred. Please nor login."
    });
  } catch (err) {
    // Implement logger function if any
    return res.status(500).json({
      message: `${err.message}`
    });
  }
};


const restaurantLogin = async (req, role, res) => {
  let { name, password } = req;
  // First Check if the user exist in the database
  const restaurant = await User.findOne({ name });
  if (!restaurant) {
    return res.status(404).json({
      message: "Restaurant name is not found. Invalid login credentials.",
      success: false,
    });
  }
  // We will check the if the employee is logging in via the route for his departemnt
  if (restaurant.role !== role) {
    return res.status(403).json({
      message: "Please make sure you are logging in from the right portal.",
      success: false,
    });
  }
  // That means the employee is existing and trying to signin fro the right portal
  // Now check if the password match
  let isMatch = await bcrypt.compare(password, restaurant.password);
  if (isMatch) {
    // if the password match Sign a the token and issue it to the employee
    let token = jwt.sign(
      {
        role: restaurant.role,
        name: restaurant.name,
        email: restaurant.email,
      },
      process.env.APP_SECRET,
      { expiresIn: "3 days" }
    );
    let result = {
      name: employee.name,
      role: employee.role,
      email: employee.email,
      token: `Bearer ${token}`,
      expiresIn: 168,
    };
    return res.status(200).json({
      ...result,
      message: "You are now logged in.",
    });
  } else {
    return res.status(403).json({
      message: "Incorrect password.",
    });
  }
};




// @desc  Auth user/set token
// route POST /api/users/auth
// @access Public
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  

  if (user && (await user.matchPassword(password))) {
    console.log('Correct response object:', res.cookie);
    generateToken(res, user._id);
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      description: user.description,
      localisation: user.localisation,
     // token: generateToken(user._id),
    });
    
  } else {
    res.status(401);
    throw new Error("Invalid email or password");
  }
});


// @desc  Auth user/set token
// route POST /api/users/register
// @access Public
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    //res.status(400);
    throw new Error("User already exists");
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  if (user) {
    generateToken(res, user._id);
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      //token: generateToken(user._id),
    });
  } else {
    // res.status(400);
    throw new Error("Invalid user data");
  }
});

const updateProfile= asyncHandler(async (req, res) => {
  const { role, localisation, averageBill, diet, description } = req.body;

  const user = await User.findById(req.user._id);
  if (user) {
    user.role = role || user.role;
    user.localisation = localisation || user.localisation;
    user.averageBill = averageBill || user.averageBill;
    user.diet = diet || user.diet; 
    user.description = description || user.description;

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      localisation: updatedUser.localisation,
      averageBill: updatedUser.averageBill,
      diet: updatedUser.diet,
      description: updatedUser.description,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});


const assignRole = asyncHandler(async (req, res) => {
  const { role, restaurantDetails, customerDetails } = req.body;

  if (!role || !["customer", "restaurant"].includes(role)) {
    res.status(400);
    throw new Error("Invalid role");
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  user.role = role;

  if (role === "restaurant" && restaurantDetails) {
    user.restaurantDetails = restaurantDetails;
  } else if (role === "customer" && customerDetails) {
    user.customerDetails = customerDetails;
  }

  await user.save();

  res.status(200).json({
    message: "Role and details assigned successfully",
    role: user.role,
    restaurantDetails: user.restaurantDetails,
    customerDetails: user.customerDetails,
  });
});

const getTotalUsers = asyncHandler(async (req, res) => {
  const userCount = await User.countDocuments({});
  res.status(200).json({ totalUsers: userCount });
});

// @desc  Logout user
// route POST /api/users/logout
// @access Public
const logoutUser = asyncHandler(async (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });

  res.status(200).json({ message: "User Logout Out" });
});

const getTotalRestaurants = asyncHandler(async (req, res) => {
  const restaurantCount = await User.countDocuments({ role: "restaurant" });
  res.status(200).json({ totalRestaurants: restaurantCount });
});

const getAllRestaurants = async (req, res) => {
  try {
    const restaurants = await User.find({role:"restaurant"}).select('name localisation averageBill description');
    res.status(200).json(restaurants);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



const getAllRestaurantsPagi = async (req, res) => {
  try {
    const { page = 1, limit = 5 } = req.query; // Default to page 1 and 5 items per page

    // Calculate the start index
    const startIndex = (page - 1) * limit;

    // Fetch restaurants with pagination
    const restaurants = await User.find({ role: "restaurant" })
      .select("name localisation averageBill description")
      .skip(startIndex)
      .limit(parseInt(limit));

    // Count total restaurants for pagination metadata
    const totalRestaurants = await User.countDocuments({ role: "restaurant" });

    res.status(200).json({
      restaurants,
      totalPages: Math.ceil(totalRestaurants / limit),
      currentPage: parseInt(page),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getMenuByUser = async (req, res) => {
  const userId = req.user._id; // Assuming req.user is set by your authentication middleware

  // Find menus by user ID
  const menus = await Menu.find({ user: userId });

  if (menus.length === 0) {
      return res.status(404).json({ message: 'No menus found for this user.' });
  }

  // Return the found menus
  res.status(200).json(menus);
};

const getRestaurantById = asyncHandler(async (req, res) => {
  const restaurantId = req.params.id; // Get the restaurant ID from the request parameters

  // Find the user by ID with the role of 'restaurant'
  const restaurant = await User.findOne({ _id: restaurantId, role: 'restaurant' })
  .select('name localisation averageBill description');

  if (!restaurant) {
      return res.status(404).json({ error: "Restaurant not found or not authorized" });
  }

  // Return the found restaurant
  res.status(200).json(restaurant);
});







// @desc  Get  user profile
// route  GET /api/users/profile
// @access Private
const getUserProfile = async (req, res) => {
  const user = {
   
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
    localisation: req.user.localisation,
    averageBill: req.user.averageBill,
    diet: req.user.diet,
    description: req.user.description,
  };

  res.status(200).json({ user });
};


// @desc  Update  user profile
// route  PUT /api/users/UpdateProfile
// @access Private
// const UpdateUserProfile = asyncHandler(async (req, res) => {
//   const user = await User.findById(req.user._id);

//   if (user) {
//     user.name = req.body.name || user.name;
//     user.email = req.body.email || user.email;

//     if (req.body.password) {
//       user.password = req.body.password;
//     }
//     const updatedUser = await user.save();

//     res.status(200).json({
//       _id: updatedUser._id,
//       name: updatedUser.name,
//       email: updatedUser.email,
//     });
//   } else {
//     res.status(404);
//     throw new Error("User not found");
//   }
// });

module.exports = {
  authUser,
  register,
  logoutUser,
  getUserProfile,
  //UpdateUserProfile,
  assignRole,
  getTotalUsers,
  restaurantSignup,
  updateProfile,
  getTotalRestaurants,
  getAllRestaurants, 
  getAllRestaurantsPagi,
  getMenuByUser,
  getRestaurantById,
};
