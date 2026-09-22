export function generateId(prefix = "id") {
    return `${prefix}-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 8)}`;
}