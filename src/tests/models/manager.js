'use strict';
const testGenerator = require('./testGenerator'),
    database = require('./database'),
    uuid = require('uuid'),
    request = require('request-promise'),
    { ERROR_MESSAGES } = require('../../common/consts');

module.exports = {
    upsertTest,
    getTest,
    getAllTestRevisions,
    getTests,
    getFile,
    deleteTest
};

async function upsertTest(testRawData, existingTestId) {
    const testArtilleryJson = await testGenerator.createTest(testRawData);
    let id = existingTestId || uuid();
    const fileId = await createFileFromUrl(testRawData);
    if (fileId) {
        testRawData.fileId = fileId;
    }
    let revisionId = uuid.v4();
    await database.insertTest(testRawData, testArtilleryJson, id, revisionId);
    return { id: id, revision_id: revisionId };
}

async function createFileFromUrl(testRawData) {
    if (testRawData['file_url']) {
        const fileId = await saveFileToDbUsingUrl(testRawData['file_url']);
        return fileId;
    }
    return undefined;
}

async function getTest(testId) {
    const result = await database.getTest(testId);
    if (result) {
        result.artillery_test = result.artillery_json;
        delete result.artillery_json;
        return result;
    } else {
        const error = new Error(ERROR_MESSAGES.NOT_FOUND);
        error.statusCode = 404;
        throw error;
    }
}

async function downloadFile(fileUrl) {
    const options = {
        url: fileUrl,
        encoding: null
    };
    try {
        const response = await request.get(options);
        const base64Value = Buffer.from(response).toString('base64');
        return base64Value;
    } catch (err) {
        console.log('Error to read file, throw exception: ' + err);
        throw new Error();
    }
}

async function getFile(fileId) {
    const file = await database.getFile(fileId);
    if (file) {
        return file;
    } else {
        const error = new Error(ERROR_MESSAGES.NOT_FOUND);
        error.statusCode = 404;
        throw error;
    }
}

async function saveFileToDbUsingUrl(fileUrl) {
    const id = uuid();
    const fileToSave = await downloadFile(fileUrl);
    await database.saveFile(id, fileToSave);
    return id;
}

async function getAllTestRevisions(testId) {
    const rows = await database.getAllTestRevisions(testId);
    const testRevisions = [];
    rows.forEach(function(row) {
        row.artillery_test = row.artillery_json;
        delete row.artillery_json;
        testRevisions.push(row);
    });
    if (testRevisions.length !== 0){
        return testRevisions;
    } else {
        const error = new Error(ERROR_MESSAGES.NOT_FOUND);
        error.statusCode = 404;
        throw error;
    }
}

async function getTests() {
    const rows = await database.getTests();
    const tests = [];
    // returns newest version of each test by id
    rows.forEach(function(row) {
        if (tests.filter(test => test.id.toString() === row.id.toString()).length === 0) {
            row.artillery_test = row.artillery_json;
            delete row.artillery_json;
            tests.push(row);
        }
    });

    return tests;
}

function deleteTest(testId) {
    return database.deleteTest(testId);
}