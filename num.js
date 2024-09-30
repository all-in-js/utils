function circlePrint(arr, n) {
    const res = [];
    const rows = arr.length;
    const cols = arr[0].length;
    const topArr = arr[n];
    const botArr = arr[rows - n - 1];

    const arr1 = [];
    for (let i = n; i <= cols - n - 1; i++) {
        arr1.push(topArr[i]);
    }
    console.log(arr1);

    const arr2 = [];
    for (let i = n + 1; i <= rows - n - 1 -1; i++) {
        arr2.push(arr[i][cols - n - 1]);
    }
    console.log(arr2);

    const arr3 = [];
    for (let i = n; i <= cols - n - 1; i++) {
        arr3.push(botArr[i]);
    }
    console.log(arr3.reverse());

    const leftArr = [];
    for (let i = n + 1; i <= rows - n - 1 - 1; i++) {
        leftArr.push(arr[i][n]);
    }
    console.log(leftArr.reverse());

    // return res.concat(leftArr.reverse());
}

const arr = [
    [1, 34, 23, 2, 11],
    [2, 41, 213, 21, 111],
    [11, 134, 123, 12, 121],
    [1111, 12234, 1223, 122, 1212],
    [151, 534, 253, 25, 115],
]

circlePrint(arr, 1)
