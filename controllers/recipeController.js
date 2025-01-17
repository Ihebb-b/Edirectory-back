const Recipe = require("../models/recipeModel");

// Route to Add a Recipe
const addRecipe = async (req, res) => {
    try {

        if (!req.user) {
            return res.status(401).send("User not authenticated");
          }

      const { name, ingredients, instructions } = req.body;
      if (!req.file) return res.status(400).send('Image is required');
  
      const userId = req.user._id;
      
      const recipe = new Recipe({
        name,
        image: `/uploads/${req.file.filename}`,
        ingredients: JSON.parse(ingredients), // Convert from JSON string
        instructions: JSON.parse(instructions),
        user: userId,
      });
  
      await recipe.save();
      res.status(201).json(recipe);
    } catch (error) {
        console.error("Error in addRecipe:", error.message);
        res.status(500).send({ error: error.message });    }
  };

  // Route to Get All Recipes
  const getRecipes = async (req, res) => {
    try {
      const recipes = await Recipe.find();
      res.send(recipes);
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  };

  const getRecipeList = async (req, res) => {
    try {
        const recipe = await Recipe.find({ user: req.user._id }); 
        res.status(200).json(recipe);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while fetching the menu list.', error: error.message });
    }
};

  

module.exports = 
{   addRecipe,
    getRecipes,
    getRecipeList,
  };
