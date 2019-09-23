var mongoose = require("mongoose");
var bcrypt = require("bcrypt-nodejs");

var userSchema = mongoose.Schema({
  fullname: { type: String },
  gender: { type: String, default: "" },
  email: { type: String },
  password: { type: String },
  google: { type: String, default: "" },
  image: { type: String, default: "" }
});

userSchema.methods.encryptPassword = password => {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
};

userSchema.methods.validPassword = function(password) {
  return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model("User", userSchema);
