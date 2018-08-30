var Promise = require('./lib');

var p = new Promise((resolve, reject) => {
    resolve(33);
});

var d;

var b = p.then((data) => {
    return d = new Promise((resolve, reject) => {
        console.log('3333')
        resolve(344);
    }).then((data) => {
        console.log(data);
        return new Promise((resolve, reject) => {
            reject('3333');
        }).then(() => {}, () => {
            console.log('reject');
            return 333;
        })
    });
});

var c = b.then((data) => {
    console.log(data, 333);
}, function(){
    console.log('1233reject');
    return 123;
});

c.then((data) => {
    console.log(data, 'lalal')
}).then((data) => {
    console.log('fdjkfdjsk');
})

// setTimeout(() => {
//     console.log(b, c, b === c, b === d);
// }, 100)

Promise.all([
    new Promise(function(resolve){
        console.log(1);
        resolve(1);
    }),

    (new Promise(function(resolve, reject){
        console.log(2);
        reject(2);
    })).then(() => {
        return new Promise(resolve => {
            console.log(3);
            resolve(3);
        })
    }, () => {
        return 3;
    })
]).then((args) => {
    console.log(4, args);
}, () => {
    console.log(5);
})