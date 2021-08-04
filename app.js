const express = require("express");
const bodyparser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();



app.set('view engine', 'ejs');

app.use(bodyparser.urlencoded({
  extended: true
}));

app.use(express.static("public"));

mongoose.connect("mongodb+srv://ytaayush:aayushas@cluster0.wxjur.mongodb.net/todolistDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your todolist"
});

const item2 = new Item({
  name: "Hit the + button to add a new line"
});

const item3 = new Item({
  name: "<--Hit this to delete an item"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List",listSchema);




app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems) {

    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function(err) {
        if (err) {
          console.log("err");
        } else {
          console.log("Success");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {
        kindofday: day,
        newitems: foundItems
      });
    }
  });

});

app.get("/:customListName",function(req,res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, function(err, foundList){
    if(!err){
      if(!foundList){
        //create new list
        const list = new List({
          name: customListName,
          items: defaultItems
        });

        list.save();
        res.redirect("/" + customListName);
      } else {
        //exists list
        res.render("list",{kindofday: foundList.name,newitems: foundList.items})
      }
    }
  });


});

let today = new Date();
let options = {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric"
}
let day = today.toLocaleDateString("en-US", options);


app.post("/", function(req, res) {
  var itemName = req.body.newitem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName
  });

  if(listName === day){
    item.save();

    res.redirect("/");
  } else {
    List.findOne({name: listName}, function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    });
  }


});

app.post("/delete",function(req,res){
  const checkditemid = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === day){
    Item.findByIdAndRemove(checkditemid,function(err){
      if(!err){
        console.log("success deleted");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkditemid}}}, function(err,foundItems){
      if(!err){
        res.redirect("/" + listName);
      }
    });
  }


});

app.listen(3000, function() {
  console.log("working on port 3000");
});
