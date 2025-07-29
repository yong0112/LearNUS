const cron = require("node-cron");
const { fetchAndCacheModules } = require("../utils/fetchModules");

class FetchModulesJob {
  constructor() {
    this.isRunning = false;
  }

  start() {
    // Run every 5 minutes: '*/5 * * * *'
    // Run every minute: '* * * * *'
    // Run every hour: '0 * * * *'

    cron.schedule("0 0 * * *", async () => {
      if (this.isRunning) {
        console.log("Module fetching job already running, skipping...");
        return;
      }

      this.isRunning = true;

      try {
        console.log("Starting fetch module job...");
        const result = await fetchAndCacheModules();
        console.log("Module fetching job completed:", result);
      } catch (error) {
        console.error("Module fetching job failed:", error);
      } finally {
        this.isRunning = false;
      }
    });

    console.log("Module fetching job scheduled successfully");
  }

  // Method to run cleanup manually
  async runNow() {
    try {
      console.log("Running module fetching manually...");
      const result = await fetchAndCacheModules();
      console.log("Manual module fetching completed:", result);
      return result;
    } catch (error) {
      console.error("Manual module fetching failed:", error);
      throw error;
    }
  }
}

module.exports = FetchModulesJob;
