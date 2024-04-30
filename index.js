const { getTasks, getHolidays } = require('./src/services');
const robot = require('./src/robot');
const cron = require('node-cron');

const { CRON } = process.env;

async function run() {
  const tasks = await getTasks();
  if (!tasks.length) return new Error('No tasks found');
  const random = Math.floor(Math.random() * tasks.length);
  const task = tasks[random];
  const description = task.fields['System.Title'];
  const id = task.id;
  await robot(description, id);
}

const ruuning = cron.schedule(CRON, async () => {
  try {
    console.log('Running cron job');
  const holidays = await getHolidays(new Date().getFullYear());
  const today = new Date();
  const date = today.toISOString().split('T')[0];
  console.log("Date: ",date);
  if (holidays.includes(date)) return console.log('Today is a holiday');
  await run();
  console.log('Cron job finished successfully');
  } catch (error) {
    console.error("error in cron job: ",error);
  }
}, {
  scheduled: true,
  timezone: 'America/Sao_Paulo' 
});

ruuning.start();