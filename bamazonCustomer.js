var mysql = require("mysql");
var inquirer = require("inquirer");


var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "XXX",
  database: "bamazon_db"
});

connection.connect(function(err) {
  if (err) throw err;
  runSearch();
});

var runSearch = function() {
	connection.query("SELECT * FROM products", function(err, res) {
  if (err) throw err;
  inquirer.prompt([{
    name: "choice",
    type: "list",
    choices: function() {
    	var arr = [];
    	for (var i = 0; i < res.length; i++) {
        arr.push("ID:" + res[i].item_id + " | " + res[i].product_name + " | Price: $" + res[i].price);      
      }
      return arr;
    },
    message: "What would you like to buy?"
  },{
  	name: "quantity",
  	type: "input",
  	message: "How many?"
  }
  ]).then(function(answer) {
  	var chosenId;
  	for (var i = 0; i < res.length; i++) {
      if (("ID:" + res[i].item_id + " | " + res[i].product_name + " | Price: $" + res[i].price) == answer.choice) {
      	chosenId = res[i].item_id;
      	chosenQuant = res[i].stock_quantity;
      	chosenName = res[i].product_name;
      }      
    }
    console.log(chosenQuant);
    console.log(answer.quantity);

    if (chosenQuant > parseInt(answer.quantity)) {
    	var newQuant;
    	newQuant = (chosenQuant) - (answer.quantity);
    	connection.query("UPDATE products SET ? WHERE ?", [{stock_quantity: newQuant},
    		{item_id: chosenId}], function(err) {
    			if (err) throw err;
    			console.log("Order placed!\n" + answer.quantity + " of " + chosenName)
    			runSearch();
    		});
    } else {
    	console.log("Not enough inventory.");
    	runSearch();
    }
  });
});
}

