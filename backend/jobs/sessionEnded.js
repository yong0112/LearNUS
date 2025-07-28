const cron = require("node-cron");
const { updateExpiredSessions } = require("../models/sessionModel");

class SessionCleanupJob {
  constructor() {
    this.isRunning = false;
  }

  start() {
    // Run every 5 minutes: '*/5 * * * *'
    // Run every minute: '* * * * *'
    // Run every hour: '0 * * * *'

    cron.schedule("* * * * *", async () => {
      if (this.isRunning) {
        console.log("Session cleanup job already running, skipping...");
        return;
      }

      this.isRunning = true;

      try {
        console.log("Starting session cleanup job...");
        const result = await updateExpiredSessions();
        console.log("Session cleanup job completed:", result);
      } catch (error) {
        console.error("Session cleanup job failed:", error);
      } finally {
        this.isRunning = false;
      }
    });

    console.log("Session cleanup job scheduled successfully");
  }

  // Method to run cleanup manually
  async runNow() {
    try {
      console.log("Running session cleanup manually...");
      const result = await updateExpiredSessions();
      console.log("Manual session cleanup completed:", result);
      return result;
    } catch (error) {
      console.error("Manual session cleanup failed:", error);
      throw error;
    }
  }
}

module.exports = SessionCleanupJob;
