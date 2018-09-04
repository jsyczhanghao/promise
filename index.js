var Promise = require('./lib');

var p = new Promise((resolve, reject) => {
    throw new Error('first error');
    resolve(1);
});

var d;

var b = p.then((data) => {
    return d = new Promise((resolve, reject) => {
        console.log('2')
        resolve(2);
    }).then((data) => {
        console.log('res ', data);
        return new Promise((resolve, reject) => {
            throw new Error('error');
            reject(3);
        });
    });
});

var c = b.then((data) => {
    console.log('res ', data);
})

c.then((data) => {
    console.log('res ', data)
    return new Promise((resolve, reject) => {
        reject(5);
    });
}).catch((data) => {
    console.log('catch', data)
});

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
});

Promise.race([
    new Promise(function(resolve){
        setTimeout(function(){ resolve(1)});
    }),

    new Promise(function(resolve, reject){
        reject(2)
    })
]).then(function(data){
    console.log('resolve ', data);
}, function(data){
    console.log('reject ', data);
})