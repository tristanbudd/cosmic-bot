const questions_file = require("../assets/questions.json");

function get_questions(number_of_questions, difficulty) {
    let questions = [];

    if (difficulty === "random") {
        for (let key in questions_file) {
            questions = questions.concat(questions_file[key]);
        }
    } else {
        questions = questions_file[difficulty] || [];
    }

    questions = questions.sort(() => Math.random() - 0.5);

    return questions.slice(0, Math.min(number_of_questions, questions.length));
}

module.exports = {
    get_questions
};