import { app } from './app';
import { initializeCronJobs } from './jobs/cronJobs';

const PORT = process.env.PORT || 5000;

initializeCronJobs();

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 GovBuild360 Backend Server running on port ${PORT}`);
  console.log(`🏛️ Gujarat Roads & Buildings Infrastructure System`);
  console.log(`=======================================================`);
});
