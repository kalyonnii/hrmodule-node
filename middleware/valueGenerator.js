const generateRandomNumber = (value) => {
    let randomNumber = "";
    const digits = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
    const usedDigits = new Set();
    randomNumber += digits[Math.floor(Math.random() * 9) + 1];
    usedDigits.add(randomNumber[0]);
    for (let i = 0; i < value; i++) {
        let digit;
        do {
            digit = digits[Math.floor(Math.random() * 10)];
        } while (usedDigits.has(digit));
        randomNumber += digit;
        usedDigits.add(digit);
    }
    return randomNumber;
};
module.exports = { generateRandomNumber };
