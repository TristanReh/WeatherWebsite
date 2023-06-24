function getCurrentTimeIndex(data) {
    let date = new Date()
    date.setMinutes(0, 0, 0);
    date.setHours(date.getHours() + 2); // adjust timezone +2

    let timeString = date.toISOString().slice(0, 16);

    let timeArray = data.hourly.time;
    for (let i = 0; i < timeArray.length; i++) {
        const element = timeArray[i];
        if (element === timeString) {
            return i;
        }
    }
}
