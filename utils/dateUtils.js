import { format } from "date-fns";

export const formatDate = (date) => {
    let validDate;

    // If the input is a string, try to convert it to a Date object
    if (typeof date === "string") {
        validDate = new Date(date);
    } else if (date instanceof Date) {
        validDate = date;
    }

    // If it's an invalid date, return "Invalid date"
    if (isNaN(validDate)) {
        return "Invalid date";
    }

    return format(validDate, "dd MMM yyyy"); // Example: 05 Feb 2025
};
