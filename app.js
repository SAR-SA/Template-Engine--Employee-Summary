const Manager = require("./lib/Manager");
const Engineer = require("./lib/Engineer");
const Intern = require("./lib/Intern");
const inquirer = require("inquirer");
const path = require("path");
const fs = require("fs");

const OUTPUT_DIR = path.resolve(__dirname, "output");



// Write code to use inquirer to gather information about the development team members,
// and to create objects for each team member (using the correct classes as blueprints!)

const managerQuestions = [
    {
        type: "input",
        name: "name",
        message: "Enter Manager Name:",
    },
    {
        type: "input",
        name: "email",
        message: "Enter manager's email:",
    },
    {
        type: "input",
        name: "officeNum",
        message: "Enter office number:",
    },
    {
        type: "list",
        name: "hasTeam",
        message: "Does this manager have team members",
        choices: ["Yes", "No"]
    },
]

const employeeQuestions = [
    {
        type: "input",
        name: "name",
        message: "Enter employee's name:",
    },
    {
        type: "input",
        name: "email",
        message: "Enter employee's email:",
    },
    {
        type: "list",
        name: "role",
        message: "Employee's role?",
        choices: ["engineer", "intern"]
    },
    {
        when: input => {
            return input.role == "engineer"
        },
        type: "input",
        name: "github",
        message: "Enter Engineer's github username:",
        validate: async (input) => {
            if (input == "" || /\s/.test(input)) {
                return "Please enter a valid GitHub username";
            }
            return true;
        }
    },
    {
        when: input => {
            return input.role == "intern"
        },
        type: "input",
        name: "school",
        message: "Enter intern's school name:",
        validate: async (input) => {
            if (input == "") {
                return "Please enter a name.";
            }
            return true;
        }
    },
    {
        type: "list",
        name: "addAnother",
        message: "Add another team member?",
        choices: ["Yes", "No"]
    }
]


var teamRoster = [];


function buildRoster() {
    inquirer.prompt(employeeQuestions).then(employeeInfo => {
        if (employeeQuestions.role == "engineer") {
            var addMember = new Engineer(employeeInfo.name, teamRoster.length + 1, employeeInfo.email, employeeInfo.github);
        } else {
            var addMember = new Intern(employeeInfo.name, teamRoster.length + 1, employeeInfo.email, employeeInfo.school);
        }
        teamRoster.push(addMember);
        if (employeeInfo.addAnother === "Yes") {
            buildRoster();
        } else {
            renderHtml();
        };
    });
};


function renderHtml() {
    let newPage = fs.readFileSync("./templates/main.html")
    fs.writeFileSync("./output/teamPage.html", newPage, function (err) {
        if (err) throw err;
    })
    console.log("HTML generated successfully");

    for (member of teamRoster) {
        if (member.getRole() == "Manager") {
            memberCard("manager", member.getName(), member.getId(), member.getEmail(), "Office: " + member.getOfficeNumber());
        } else if (member.getRole() == "Engineer") {
            memberCard("manager", member.getName(), member.getId(), member.getEmail(), "Github: " + member.getGithub());
        } else if (member.getRole() === "Intern") {
            memberCard("manager", member.getName(), member.getId(), member.getEmail(), "School: " + member.getSchool());
        }
    }
}

function memberCard(memberType, name, id, email, propertyValue) {
    let data = fs.readFileSync(`./templates/${memberType}.html`, 'utf8')
    data = data.replace("name", name);
    data = data.replace("id", `ID: ${id}`);
    data = data.replace("role", memberType);
    data = data.replace("email", `Email: <ahref="mailto:${email}">${email}</a>`);
    data = data.replace("propertyHere", propertyValue);
    fs.appendFileSync("./output/teamPage.html", data, err => { if (err) throw err; })
    console.log("Card appended");
}

function init() {
    inquirer.prompt(managerQuestions).then(managerInfo => {
        let teamManager = new Manager(managerInfo.name, 1, managerInfo.email, managerInfo.officeNum);
        teamRoster.push(teamManager);
        console.log(" ");
        if (managerInfo.hasTeam === "Yes") {
            buildRoster();
        } else {
            renderHtml();
        }
    })
}

init();




