// import shallowEqual from "./shallowEqual.js";
// import warning from "./warning.js";
// import wrapActionCreators from "./wrapActionCreators.js";
// import { assign } from "./utils/Object.js";
import { isFn, noop, deepEqual, clone, callInContext } from './utils/util.js'

const defaultMapStateToProps = state => ({}); // eslint-disable-line no-unused-vars
const defaultMapDispatchToProps = dispatch => ({ dispatch });

const listeners = []
let subscription = null

const createListener = (context, store, mapState, initOptions = {}) => {
    let prevState, tmp
    const listener = function (state, ...args) {
        const nextState = mapState(state, initOptions, ...args)
        if (!prevState || !deepEqual(nextState, prevState)) {
            tmp = clone(nextState)
            context.onStateChange.call(context, clone(prevState) || {}, nextState)
            prevState = tmp
        }
    }

    listener(store.getState()) // to sync init state
    listener.isActive = true
    return listener
}

const defaultMergeConfig = (config, overrides) => ({ ...config, ...overrides })

const setupSubscription = (store) => {
    if (isFn(subscription)) {
        return subscription
    }
    const callback = () => {
        listeners.filter(fn => fn.isActive).forEach(fn => fn(store.getState()))
    }
    return (subscription = store.subscribe(callback))
}

const injectChangeListenerStatus = (store, handler, listener, isActive) => {
    return function () {
        if (listener) {
            const prev = listener.isActive
            listener.isActive = isActive
            if (!prev && isActive) {
                listener(store.getState(), ...arguments)
            }
        }
        return callInContext(handler, this, arguments)
    }
}

const injectOnStateChange = (handler) => {
    return function () {
        return callInContext(handler, this, arguments)
    }
}

const connect = (store, mapState, mapDispatch) => {
    const resolveMapDispatch = () => {
        return isFn(mapDispatch) ? mapDispatch(store.dispatch) : {}
    }

    return (injectLifeCycle, config) => {
        const mergedConfig = defaultMergeConfig(config, resolveMapDispatch())
        if (!isFn(mapState)) {
            return mergedConfig
        }

        setupSubscription(store)
        return { ...mergedConfig, ...injectLifeCycle(mergedConfig, mapState) }
    }
}

const connectApp = (store, mapState, mapDispatch) => {
    const factory = connect(store, mapState, mapDispatch)

    const injectAppLifeCycle = (config) => {
        const { onLaunch, onShow, onHide, onStateChange } = config

        return {
            onLaunch: function (options) {
                const listener = createListener(this, store, mapState, options)
                listener.index = listeners.push(listener) - 1

                this.onShow = injectChangeListenerStatus(store, onShow, listener, true)
                this.onHide = injectChangeListenerStatus(store, onHide, listener, false)
                return callInContext(onLaunch, this, arguments)
            },
            onShow: isFn(onShow) ? onShow : noop,
            onHide: isFn(onHide) ? onHide : noop,
            onStateChange: injectOnStateChange(onStateChange)
        }
    }

    return (config) => {
        return factory(injectAppLifeCycle, config)
    }
}

const connectPage = (mapState, mapDispatch) => {
    const app = getApp();
    const store = app.store;
    const factory = connect(store, mapState, mapDispatch)

    const injectPageLifeCycle = (config) => {
        const { onLoad, onUnload, onShow, onHide, onStateChange } = config

        return {
            onLoad: function (options) {
                const listener = createListener(this, store, mapState, options)
                listener.index = listeners.push(listener) - 1

                this.onUnload = function () {
                    listeners.splice(listener.index, 1)
                    return callInContext(onUnload, this, arguments)
                }

                this.onShow = injectChangeListenerStatus(store, onShow, listener, true)
                this.onHide = injectChangeListenerStatus(store, onHide, listener, false)
                return callInContext(onLoad, this, arguments)
            },

            onUnload: isFn(onUnload) ? onUnload : noop,
            onShow: isFn(onShow) ? onShow : noop,
            onHide: isFn(onHide) ? onHide : noop,
            onStateChange: injectOnStateChange(onStateChange)
        }
    }

    return (config) => {
        return factory(injectPageLifeCycle, config)
    }
}


// function connect(mapStateToProps, mapDispatchToProps) {
//     const shouldSubscribe = Boolean(mapStateToProps);
//     const mapState = mapStateToProps || defaultMapStateToProps;
//     const app = getApp();
//     let prevMappedState = {};//we chat will inject some prop in page.data, so we store the prev mapped state since we only focus on the mapped state
//     let mapDispatch;
//     if (typeof mapDispatchToProps === "function") {
//         mapDispatch = mapDispatchToProps;
//     } else if (!mapDispatchToProps) {
//         mapDispatch = defaultMapDispatchToProps;
//     } else {
//         mapDispatch = wrapActionCreators(mapDispatchToProps);
//     }
//
//     return function wrapWithConnect(pageConfig) {
//         const { onLoad: _onLoad, onUnload: _onUnload, onStateChange: _onStateChange } = pageConfig;
//
//         function handleChange(options) {
//             if (!this.unsubscribe) {
//                 return;
//             }
//
//             const state = this.store.getState();
//             const mappedState = mapState(state, options);
//             if (shallowEqual(prevMappedState, mappedState)) {
//                 return;
//             }
//             let callback = null;
//             if (typeof _onStateChange === "function") {
//                 callback = () => _onStateChange.call(this,prevMappedState, mappedState);
//             }
//             this.setData(mappedState, callback);
//             prevMappedState = mappedState;// save mapped state
//         }
//
//         function onLoad(options) {
//             this.store = app.store;
//             if (!this.store) {
//                 warning("Store对象不存在!");
//             }
//             if (shouldSubscribe) {
//                 this.unsubscribe = this.store.subscribe(handleChange.bind(this, options));
//                 handleChange.call(this, options);
//             }
//             if (typeof _onLoad === "function") {
//                 _onLoad.call(this, options);
//             }
//         }
//
//         function onUnload() {
//             if (typeof _onUnload === "function") {
//                 _onUnload.call(this);
//             }
//             typeof this.unsubscribe === "function" && this.unsubscribe();
//         }
//
//         return assign({}, pageConfig, mapDispatch(app.store.dispatch), { onLoad, onUnload });
//     };
// }

module.exports = connectPage;
