/**
 * Format the current date and time as "YYYY-MM-DD HH:MM:SS"
 * @returns {string} Formatted date and time string
 */
export const getCurrentFormattedDateTime = () => {
    const now = new Date();

    // Format date components with leading zeros where needed
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
    const day = String(now.getDate()).padStart(2, "0");

    // Format time components with leading zeros
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");

    // Build the formatted string
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};
