var STATES = {
    PENDING: 1,
    RESOLVED: 2,
    REJECTED: 3
};

function nextTick(callback){
    setTimeout(callback, 0);
}

function _try(fn){
    var res, args = [].slice.call(arguments, 1);

    try{
        res = fn.apply(null, args);
    }catch(e){
        return e;
    }

    return res;
}

function b(data){return data};

function isE(e){
    return e instanceof Error;
}

function Promise(fn){
    this.state = STATES.PENDING;
    this._ = [];
    
    var res = _try(fn, this.emitResolve.bind(this), this.emitReject.bind(this));
    isE(res) && this.emitReject(res);
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
            self.next(data);
        });
    },  

    emitReject: function(data){
        var self = this;

        nextTick(function(){
            self.state = STATES.REJECTED;
            self.next(data);
        });
    },

    next: function(data){
        var isResolved = this.state == STATES.RESOLVED;

        this._.map(function(info){
            if(isResolved){
                res = _try(info.resolve, data);
            }else{
                if(info.reject){
                    res = _try(info.reject, data);
                }else{
                    info.promise.emitReject(data);
                    return;
                }
            } 

            if(res instanceof Error){
                info.promise.emitReject(res);
            }else if(res instanceof Promise){
                res.then(function(data){
                    info.promise.emitResolve(data);
                }, function(data){
                    info.promise.emitReject(data);
                });
            }else{
                info.promise.emitResolve(res);
            }
        });

        this._.length = 0;
    }
};

Promise.prototype['catch'] = function(fn){
    return this.then(b, fn);
};

Promise.prototype['finally'] = function(fn){
    this.then(fn, fn);
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

Promise.race = function(promises){
    return new Promise(function(resolve, reject){
        var confirm = false;

        promises.map(function(promise){
            promise['finally'](function(data){
                if(confirm) return;
                confirm = true;
                promise.state == STATES.RESOLVED ? resolve(data) : reject(data);
            });
        });
    });
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
};

module.exports = Promise;