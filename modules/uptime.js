let start_time = Date.now();

function set_start_time() {
    start_time = Date.now();
}

function get_up_time() {
    let uptime = Date.now() - start_time;
    let seconds = Math.floor(uptime / 1000);
    let minutes = Math.floor(seconds / 60);
    let hours = Math.floor(minutes / 60);
    let days = Math.floor(hours / 24);

    seconds = seconds % 60;
    minutes = minutes % 60;
    hours = hours % 24;

    let uptime_string = "";
    if (days > 0) uptime_string += days + "d ";
    if (hours > 0) uptime_string += hours + "h ";
    if (minutes > 0) uptime_string += minutes + "m ";
    if (seconds > 0) uptime_string += seconds + "s";

    return uptime_string;
}

module.exports = {
    set_start_time,
    get_up_time
}