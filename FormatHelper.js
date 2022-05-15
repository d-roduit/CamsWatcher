const removeCityFromTitle = webcam => {
    if (
        typeof webcam?.title === "undefined" ||
        typeof webcam?.location?.city === "undefined"
    ) {
        return null;
    }

    if (webcam.title.length > webcam.location.city.length) {
        webcam.title = webcam.title.substring(webcam.location.city.length + 2).trim();
    }
    return webcam;
}

export { removeCityFromTitle };
