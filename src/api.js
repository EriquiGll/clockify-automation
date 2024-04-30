const axios = require('axios');
const { AZURE_DEVOPS_SECRET, AZURE_DEVOPS_URL } = process.env;
const base64 = Buffer.from(AZURE_DEVOPS_SECRET).toString('base64')

const api = axios.create({
  baseURL: AZURE_DEVOPS_URL,
  headers: {
    'Authorization': `Basic ${base64}`
  }
})

module.exports = api;