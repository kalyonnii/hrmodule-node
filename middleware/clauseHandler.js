
const createClauseHandler = (body) => {
    const columns = Object.keys(body).join(", ");
    const values = Object.keys(body)
        .map((key) => {
            if (Array.isArray(body[key])) {
                const arrayValues = JSON.stringify(
                    body[key].map((value) => {
                        if (typeof value === 'string') {
                            return value.replace(/\\/g, "/");
                        } else {
                            return value;
                        }
                    })
                );
                return `'${arrayValues}'`;
            } else {
                return `"${body[key]}"`;
            }
        })
        .join(", ");
    return [columns, values];
};

const updateClauseHandler = (body) => {
    return Object.keys(body)
        .map((key) => {
            if (Array.isArray(body[key])) {
                const arrayValues = JSON.stringify(
                    body[key].map((value) => {
                        if (typeof value == "object") {
                            for (let keyElement in value) {
                                if (Array.isArray(value[keyElement])) {
                                    value[keyElement] = value[keyElement].map((valueElement) =>
                                        valueElement.replace(/\\/g, "/")
                                    );
                                    console.log("value[key]", value[keyElement]);
                                } else {
                                    value[keyElement] = value[keyElement].replace(/\\/g, "/");
                                }
                            }
                        } else {
                            value = value.replace(/\\/g, "/");
                        }
                        return value;
                    })
                );
                return `${key} = '${arrayValues}'`;
            } else {
                return `${key} = "${body[key]}"`;
            }
        })
        .join(", ");
};

module.exports = { createClauseHandler, updateClauseHandler };
