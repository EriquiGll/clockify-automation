const api = require('./api');
const axios = require('axios');

const { AZURE_DEVOPS_TEAM, API_BRASILAPI } = process.env;

async function getTaskById() {
  try {
    const data = await api.get("/_apis/work/accountmyworkrecentactivity?api-version=7.2-preview.2");
    const result = data.data.value;
    const myTaskIds = result.filter(item => item.assignedTo?.id === 'dfca49b3-ed29-66f7-987a-8ad57f002b6c' && item.state === "02. Fazendo").map(item => item.id);
    return myTaskIds;
  } catch (error) {
    console.error(error);
  }
}

async function getRelations() {
  const expanded = 'relations';
  try {
    const tasksIds = await getTaskById();
    const data = await api.get(`/${AZURE_DEVOPS_TEAM}/_apis/wit/workitems/?ids=${tasksIds.toString()}&$expand=${expanded}&api-version=7.2-preview.3`);
    const result = data.data.value;
    const urls = [];
    result.forEach(item => {
      if (!item.relations.length) return new Error('No relations found');
      item.relations.forEach(relation => {
        if (relation.attributes.name === 'Parent') {
          urls.push(relation.url);
        }
      });
    });
    return urls;
  } catch (error) {
    console.error(error);
  }
}

async function getTasks() {
  try {
    const urls = await getRelations();
    const data = await Promise.all(urls.map(url => api.get(`${url}?fields=System.Title&api-version=7.2-preview.3`)));
    return data.map(item => item.data);
  } catch (error) {
    console.error(error);
  }
}

async function getHolidays (year) {
  try {
    const data = await axios.get(`${API_BRASILAPI}/${year}`);
    return data.data.map(item => item.date);
  } catch (error) {
    console.error(error);
  }
}

module.exports = {
  getTasks,
  getHolidays
};