import { LoggerSystem } from "../lib/Log";
import schedule from "node-schedule";
import { run } from "./Database";

export const initSchedule = () => {
    try {
        const reportRule = new schedule.RecurrenceRule();
        reportRule.hour = [23];
        reportRule.minute = 30;
        reportRule.second = 0;
        reportRule.tz = "Asia/Shanghai";
        schedule.scheduleJob(reportRule, () => {
            run();
        });
        console.log(`✅ Scheduler starts`);
    } catch (error: any) {
        LoggerSystem.error(error.message);
    }
};
