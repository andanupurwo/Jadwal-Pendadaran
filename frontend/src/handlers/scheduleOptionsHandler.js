import { generateSchedule } from '../logic/schedulingEngine.js';
import { showConfirm } from '../ui/components/ConfirmationModal.js';

export function generateScheduleWithOptions() {
    const forceResetCheckbox = document.getElementById('forceResetSchedule');
    const forceReset = forceResetCheckbox ? forceResetCheckbox.checked : false;

    // Logic:
    // If Checked (Force Reset) -> isIncremental = false (Reset Full)
    // If Unchecked (Default) -> isIncremental = true (Only schedule unscheduled)

    // Pass this intent to the engine
    // We repurpose the 'incrementalMode' logic in the engine
    // But since engine reads from DOM elements that might not exist here,
    // we should modify the engine to accept arguments.
    // However, for now, we can inject a temporary state or modifications.

    // Better approach: modifying generateSchedule signature is hard?
    // Let's modify generateSchedule to accept override options.

    generateSchedule({
        forceValidation: false,
        overrideIncremental: !forceReset // If reset is checked, incremental is False.
    });
}
