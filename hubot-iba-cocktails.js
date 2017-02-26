// Description:
//   Provides IBA cocktail instructions
//
// Dependencies:
//   leven
//
// Commands:
//   hubot mix me a <drink>
//   hubot what cocktails can you make?
//   hubot what can i make with <ingredient>?
//   hubot what should i drink?

var ingredients = require('./lib/iba-cocktails/ingredients.json');
var recipes = require('./lib/iba-cocktails/recipes.json');
var leven = require('leven');

var recipeToText = function (recipe) {
  var message = [];

  message.push(recipe.name);

  message.push('Ingredients:');
  recipe.ingredients.forEach(function (ingredient) {
    if (ingredient.special) {
      message.push(ingredient.special);
    } else {
      var ingredientName = ingredient.label ? ingredient.label : ingredient.ingredient;
      message.push(ingredient.amount + ingredient.unit + ' ' + ingredientName);
    }
  });

  if (recipe.preparation) {
    message.push(recipe.preparation);
  }

  if (recipe.garnish) {
    message.push('Garnish(es): ' + recipe.garnish);
  }

  return message.join('\n');
};

module.exports = function (robot) {
  robot.respond(/(mix|make) me an? ([a-z0-9\s'-]+)/i, function (msg) {
    var drinkName = msg.match[2].toLowerCase();

    var best = Number.MAX_VALUE;
    var drink;

    recipes.forEach(function (recipe) {
      var levenDistance = leven(drinkName, recipe.name.toLowerCase());
      if (levenDistance < best) {
        best = levenDistance;
        drink = recipe;
      }
    });

    if (!drink || best > 2) {
      msg.send('Sorry - doesn\'t sound like a drink I know ¯\\_(ツ)_/¯');
    } else if (best > 0) {
      msg.send('Do you mean: \n' + recipeToText((drink)));
    } else {
      msg.send(recipeToText(drink));
    }
  });

  robot.respond(/(what|which) (cocktails|drinks|recipes) (do|can) you (know|make|mix)\??/i, function (msg) {
    var recipeNames = recipes.map(function (recipe) {
      return recipe.name;
    });
    msg.send('I know the following recpies:\n' + recipeNames.join(', '));
  });

  robot.respond(/what can i (make|mix) with ([a-z\s]+)\??/i, function (msg) {
    var ingredientName = msg.match[2].toLowerCase();

    var best = Number.MAX_VALUE;
    var ingredient;

    Object.keys(ingredients).forEach(function (ingName) {
      var levenDistance = leven(ingredientName, ingName.toLowerCase());
      if (levenDistance < best) {
        best = levenDistance;
        ingredient = ingName;
      }
    });

    if (!ingredient || best > 2) {
      msg.send('Sorry - doesn\'t sound like an ingredient I know ¯\\_(ツ)_/¯');
    } else {
      var drinkNames = [];
      var drinks = recipes.forEach(function (recipe) {
        if (recipe.ingredients.some(function (ing) {
          return ingredient === ing.ingredient;
        })) {
          drinkNames.push(recipe.name);
        }
      });
      if (best > 0) {
        msg.send('Do you mean ' + ingredient + '?\nI know how to mix these drinks: ' + drinkNames.join(', '));
      } else {
        msg.send('I know how to mix these drinks: ' + drinkNames.join(', '));
      }
    }
  });

  robot.respond(/what should i drink\??/i, function (msg) {
    msg.send(recipeToText(msg.random(recipes)));
  });
};
