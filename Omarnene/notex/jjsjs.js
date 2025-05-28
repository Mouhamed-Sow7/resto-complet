// // affiche nombre de 1 a 5 avec boucle while
// let i = 1;
// while (i <= 20) {
//   if (i % 2 == 0) {
//     console.log(i);
//   }
//   i++;
// }
// console.log("arret de la boucle numero 1");
// // exo 2 avec do while
// let j;
// do {
//   j = parseInt(prompt("Entrez un nombre  "), 10);
//   if (isNaN(j)) {
//     console.log("Veuillez entrer un nombre valide.");
//   } else if (j == 5) {
//     console.log("Bravo Vous avez entré le nombre 5.");
//   }
// } while (j != 5);
// console.log("arret de la boucle numero 2");
// // decrementation a partir de 10 avec while
// let k = 10;
// while (k >= 0) {
//   console.log(k);
//   k--;
// }
// console.log("arret de la boucle numero 3");
// generer un nombre aleatoire entre 1 et 10
function randomNumber() {
  return Math.floor(Math.random() * 20) + 1;
}
const randomNum = randomNumber();
console.log("Nombre aléatoire généré : " + randomNum);
let guessNumber;
let nbEssai = 0;

do {
  guessNumber = parseInt(prompt("Entrez un nombre entre 1 et 20"), 10);
  nbEssai++;

  if (isNaN(guessNumber)) {
    console.log("Veuillez entrer un nombre valide.");
  } else if (guessNumber < 1 || guessNumber > 20) {
    console.log("Le nombre doit être entre 1 et 20.");
  }
  // Indiquer si le nombre est trop petit ou trop grand
  else if (guessNumber < randomNum) {
    console.log("Trop petit ! Essayez encore.");
    const difference = randomNum - guessNumber;
    console.log(
      difference +
        " est la difference entre le nombre aleatoire et votre nombre"
    );
  } else if (guessNumber > randomNum) {
    console.log("Trop grand ! Essayez encore.");
    const difference = guessNumber - randomNum;
    console.log(
      difference +
        " est la difference entre le nombre aleatoire et votre nombre"
    );
  } else {
    console.log("Bravo ! Vous avez trouvé le nombre.");
  }
  if (nbEssai <= 5) {
    console.log("Il vous reste " + (5 - nbEssai) + " essais.");
  }
} while (guessNumber !== randomNum && nbEssai < 5);
// Afficher le nombre d'essais

if (guessNumber === randomNum) {
  // Bravo + nb essais
  console.log(
    "Bravo ! Vous avez trouvé le nombre en " +
      nbEssai +
      " essais. Le nombre était " +
      randomNum +
      "."
  );
} else {
  console.log("Game Over... Le nombre était " + randomNum + ".");
}

// nombre d'essais restant

console.log("arret de la boucle numero 4");
