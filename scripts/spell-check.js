const { readFile, writeFile } = require("fs/promises");
const { existsSync } = require("fs");
const Spellcheker = require("spellchecker");
const colors = require("colors");
const { prompt } = require("enquirer");

const checker = Spellcheker;
const db = new Map();

async function addWordsToDicionary() {
  const spellingFile = await readFile("./spelling.json", "utf-8");
  const { words } = JSON.parse(spellingFile);
  words.forEach((word) => {
    checker.add(word);
  });
}

async function addWord(value) {
  let words = db.get("words") || [];

  if (!words.includes(value)) {
    db.set("words", words.concat(value));
  }

  const json = [...db.keys()].reduce((json, key) => {
    return {
      ...json,
      [key]: db.get(key),
    };
  }, {});

  writeFile("./spelling.json", JSON.stringify(json, null, 4));
}

async function run() {
  if (existsSync("./spelling.json")) {
    await addWordsToDicionary();
  }
  const file = await readFile("./resume.json", "utf-8");

  const sections = [
    "basics",
    "education",
    "references",
    "skills",
    "work",
    "interests",
  ];

  const jsonFile = JSON.parse(file);
  const typos = [];

  await serialEach(sections, async (sectionName) => {
    const sectionContent = jsonFile[sectionName];

    const allText = getValues(sectionContent);

    await serialEach(allText, async (text) => {
      const results = checker.checkSpelling(text);

      if (results.length) {
        await serialEach(results, async (error) => {
          let word = text.slice(error.start, error.end);

          await prompt({
            type: "confirm",
            name: "question",
            message: `Do you want to add ${word} to dicionary?`,
          }).then(({ question }) => {
            if (question) {
              addWord(word);

              return;
            }
            typos.push([word, sectionName, error.start, error.end]);
          });
        });
      }
    });
  });

  if (!typos.length) {
    console.log(colors.green.bold(`No typos found in your resume`));
    return;
  }

  console.log(colors.red.bold(`Typos`));
  typos.forEach(([word, sectionName, start, end]) => {
    let suggestion = checker.getCorrectionsForMisspelling(word).join(" ");
    console.log(`${sectionName}@${start}:${end} - ${word} => ${suggestion}`);
  });
}

function getValues(obj) {
  return Object.keys(obj).reduce((values, key) => {
    if (typeof obj[key] === "object") {
      return values.concat(getValues(obj[key]));
    }

    return values.concat(obj[key]);
  }, []);
}

async function serialEach(arr, fn) {
  return arr.reduce(async (memo, i) => {
    await memo;
    return fn(i);
  }, []);
}

try {
  run();
} catch (e) {
  console.log("There was an error running spellchecker", e);
}
