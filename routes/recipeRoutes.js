const express = require("express");
const router = express.Router();

const {
    addRecipe,
    getRecipes,
    getRecipeList,
    modifyRecipe,
    deleteRecipe,
    getRecipeById
  } = require("../controllers/recipeController");
const { protect } = require("../middelware/authMiddelware");
const upload = require("../utils/multerConfig");
  
router.post('/addRecipe', protect, upload.single('image'), addRecipe);
router.get('/getRecipes', getRecipes);
router.get('/getRecipeList', protect, getRecipeList);
router.put('/modifyRecipe/:id', protect, upload.single('image'), modifyRecipe);
router.delete('/deleteRecipe/:id', protect, deleteRecipe);
router.get('/getRecipe/:id', getRecipeById);



;



module.exports = router;