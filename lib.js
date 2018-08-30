var STATES = {
    PENDING: 1,
    RESOLVED: 2,
    REJECTED: 3
};

function nextTick(callback){
    setTimeout(callback, 0);
}

function b(data){return data};

function Promise(fn){
    this.state = STATES.PENDING;
    this._ = [];
    this._finally = b; //待添加
    fn(this.emitResolve.bind(this), this.emitReject.bind(this));
}

Promise.prototype = {
    then: function(resolve, reject){
        var promise = new Promise(function(){});

        this._.push({
            resolve: resolve,
            reject: reject,
            promise: promise
        });

        return promise;
    },

    emitResolve: function(data){
        var self = this;

        nextTick(function(){
            self.state = STATES.RESOLVED;
            self.emitFinally(data);
        });
    },  

    emitReject: function(data){
        var self = this;

        nextTick(function(){
            self.state = STATES.REJECTED;
            self.emitFinally(data);
        });
    },

    emitFinally(data){
        var isResolved = this.state == STATES.RESOLVED;

        this._.map(function(info){
            if(isResolved){
                res = info.resolve(data);
            }else{
                if(info.reject){
                    res = info.reject(data);
                }else{
                    info.promise.emitReject();
                    return;
                }
            } 

            if(!(res instanceof Promise)){
                info.promise.emitResolve(res);
            }else{
                res.then(function(data){
                    info.promise.emitResolve(data);
                }, function(data){
                    info.promise.emitReject(data);
                });
            }
        });

        this._.length = 0;
    }
};

Promise.all = function(promises){
    var allPromise = new Promise(function(resolve, reject){
        var datas = [], l = promises.length;

        promises.map(function(promise){
            promise.then(function(data){
                if(allPromise.state != STATES.PENDING){
                    return false;
                }

                datas.push(data);
                datas.length == l && resolve(datas);
            }, function(data){
                reject(data);
            });
        });
    });

    return allPromise;
};

Promise.resolve = function(data){
    return new Promise(function(resolve){
        resolve(data);
    });
};

Promise.reject = function(data){
    return new Promise(function(resolve, reject){
        reject(data);
    });
}

module.exports = Promise;