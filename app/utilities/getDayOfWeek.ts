export const getDayOfWeek = (eventDate: string): string => {
    const date = new Date(eventDate);
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return daysOfWeek[date.getUTCDay()];
};
