const express = require("express");
const router = express.Router();

const {
    addRecipe,
    getRecipes,
    getRecipeList,
  } = require("../controllers/recipeController");
const { protect } = require("../middelware/authMiddelware");
const upload = require("../utils/multerConfig");
  
router.post('/addRecipe', protect, upload.single('image'), addRecipe);
router.get('/getRecipes', getRecipes);
router.get('/getRecipeList', protect, getRecipeList);


;



module.exports = router;