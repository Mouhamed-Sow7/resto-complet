const bcrypt = require("bcrypt");

const password = "membre123";
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) {
    console.error("Erreur lors du hachage:", err);
    return;
  }
  console.log("Hachage généré:", hash);
});
