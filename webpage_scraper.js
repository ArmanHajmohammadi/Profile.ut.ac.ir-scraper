const axios = require("axios");
const sqlite3 = require("sqlite3").verbose();

function createDatabase() {
  const db = new sqlite3.Database("professors.db");

  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS professors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      firstName TEXT,
      lastName TEXT,
      firstName_en_US TEXT,
      lastName_en_US TEXT,
      image TEXT,
      url TEXT,
      degree TEXT,
      email TEXT,
      organizations TEXT
    )`);
  });

  return db;
}

function insertTeacherData(db, teacherData) {
  const stmt = db.prepare(`INSERT INTO professors (
    firstName, lastName, firstName_en_US, lastName_en_US, image, url, degree, email, organizations
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);

  teacherData.forEach((teacher) => {
    stmt.run(
      teacher.firstName,
      teacher.lastName,
      teacher.firstName_en_US,
      teacher.lastName_en_US,
      teacher.image,
      teacher.url,
      teacher.degree,
      teacher.email,
      JSON.stringify(teacher.organistaions)
    );
  });

  stmt.finalize();
}

async function fetchDataFromURL(url) {
  try {
    const response = await axios.get(url);
    const teacherData = response.data.results;

    const db = createDatabase();
    insertTeacherData(db, teacherData);

    console.log(`Data from ${url} saved successfully!`);
    db.close();
  } catch (error) {
    console.error(`Error fetching data from ${url}:`, error);
  }
}

const urls = [];

for (let i = 1; i < 70; i++) {
  urls.push(
    `https://profile.ut.ac.ir/profiles?p_p_id=edusearch_WAR_edumanagerportlet_INSTANCE_PM4wXjldOANK&p_p_lifecycle=2&p_p_state=normal&p_p_mode=view&p_p_cacheability=cacheLevelPage&p_p_col_id=column-1&p_p_col_count=1&currentFacet=&preFilter=false&teacherTagIds=&thesisTagIds=&thesisDegree=&teacherId=&groupId=&thesisShamsiDefYears=&thesisDefYears=&type=&lang=&publishYear=&shmasiPublishYear=&startYear=&shamsiStartYear=&status=&enteranceYear=&areaOfStudyId=&page=${i}&index=&sortType=last-name&userSortType=&tabSearchType=&currentSearchType=profile&searchType=profile&_edusearch_WAR_edumanagerportlet_INSTANCE_PM4wXjldOANK_keywords=`
  );
}

async function fetchDataFromMultipleURLs() {
  for (const url of urls) {
    await fetchDataFromURL(url);
  }
}

fetchDataFromMultipleURLs();
