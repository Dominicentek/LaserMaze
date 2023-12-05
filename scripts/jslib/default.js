function default_value(val, def) {
    if (val === undefined || val === null) return def;
    return val;
}