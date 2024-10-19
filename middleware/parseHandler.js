const parseNestedJSON = (result) => {
    for (let key in result) {
        if (typeof result[key] === "string") {
            try {
                result[key] = JSON.parse(result[key]);
            } catch (error) { }
        } else if (typeof result[key] === "object") {
            parseNestedJSON(result[key]);
        }
    }
    return result;
};
module.exports = parseNestedJSON;

