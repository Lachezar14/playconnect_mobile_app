export const dbCounter = {
    count: 0,
    reset() {
        this.count = 0;
    },
    increment() {
        this.count++;
    },
    getCount() {
        return this.count;
    }
};