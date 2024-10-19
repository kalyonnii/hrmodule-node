const mysql = require("mysql");
const handleFilters = (queryParams, isCountUrl = false) => {
    let querySuffix = " ";
    if (
        queryParams &&
        Object.keys(queryParams) &&
        Object.keys(queryParams).length > 0
    ) {
        let conditionalQuery = handleConditionalFilters(queryParams);
        querySuffix += conditionalQuery;
        if (queryParams["sort"]) {
            const [column, order = "desc"] = queryParams["sort"].split(",");
            querySuffix += ` ORDER BY ${column} ${order.toUpperCase()}`;
        }
        if (queryParams["count"] && !isCountUrl) {
            querySuffix += " LIMIT " + queryParams["count"];
        }
        if (queryParams["from"] && !isCountUrl) {
            querySuffix += " OFFSET " + queryParams["from"];
        }
    }
    return querySuffix;
};

const handleConditionalFilters = (queryParams) => {
    let conditionalQuery = "";
    if (
        queryParams &&
        Object.keys(queryParams) &&
        Object.keys(queryParams).length > 0
    ) {
        conditionalQuery += " WHERE ";
        const conditions = Object.entries(queryParams).map(([key, value]) => {
            if (key.endsWith("-eq")) {
                return `${key.replace("-eq", "")} = ${mysql.escape(value)}`;
            } else if (key.endsWith("-like")) {
                return `${key.replace("-like", "")} LIKE ${mysql.escape(`%${value}%`)}`;
            } else if (key.endsWith("-gt")) {
                return `${key.replace("-gt", "")} > ${mysql.escape(value)}`;
            } else if (key.endsWith("-lt")) {
                return `${key.replace("-lt", "")} < ${mysql.escape(value)}`;
            } else if (key.endsWith("-gte")) {
                return `${key.replace("-gte", "")} >= ${mysql.escape(value)}`;
            } else if (key.endsWith("-lte")) {
                return `${key.replace("-lte", "")} <= ${mysql.escape(value)}`;
            } else if (key.endsWith("-or")) {
                const fieldName = key.replace("-or", "");
                const values = mysql
                    .escape(value.split(","))
                    .replace(/,/g, " OR " + fieldName + " = ");
                return `(${fieldName} = ${values})`;
            }
            return "";
        });
        conditionalQuery += conditions.filter(Boolean).join(" AND ");
    }
    return conditionalQuery == " WHERE " ? "" : conditionalQuery;
};
module.exports = handleFilters;
