export const dateToCron = (date: any) => {

    const format = new Date(date);//input is UTC so convert to user's time zone

    const minutes = format.getMinutes();
    const hours = format.getHours();
    const days = format.getDate();
    const months = format.getMonth() + 1;
    const dayOfWeek = format.getDay();

    return `${minutes} ${hours} ${days} ${months} ${dayOfWeek}`;
};

export const todayToCron = (date: any) => {
    //convert date .now to user's timezone

    const minutes = date.getMinutes();
    const hours = date.getHours();
    const days = date.getDate();
    const months = date.getMonth() + 1;
    const dayOfWeek = date.getDay();

    return `${minutes} ${hours} ${days} ${months} ${dayOfWeek}`;
};

//sample
// const dateText = '2024-07-23T13:30:00.123Z';

// const cron = dateToCron(dateText);
// console.log(cron); //30 13 23 7 2

export const isToday = (date: any) => {
    let format = new Date(date)

    // console.log(format.getHours())
    // console.log(format.getDate())
    // console.log(format)

    // let local = format.toLocaleString
    if (format.getHours() != 0) {
        const now = new Date()

        return format.getDate() === now.getDate() &&
            format.getMonth() + 1 === now.getMonth() + 1 &&
            format.getFullYear() === now.getFullYear()
    } else {
        // make up for UTC timezone difference, now.getDate() + 1
        const now = new Date()

        return format.getDate() === now.getDate() + 1 &&
            format.getMonth() + 1 === now.getMonth() + 1 &&
            format.getFullYear() === now.getFullYear()
    }
}// return true or false (boolean)
