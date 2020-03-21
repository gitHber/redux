import $$observable from 'symbol-observable'
// compose 实现洋葱模型中间件
export function compose(...middlewares) {
    if (middlewares.length === 0) {
        return arg => arg
    }

    if (middlewares.length === 1) {
        return middlewares[0]
    }
    return middlewares.reduce((a, b) => (...args) => a(b(...args)))
}
// 应用中间件
export function applyMiddleware(...middlewares) {
    return createStore => (...args) => {
        const store = createStore(...args)
        // 应用中间件，传入 store
        const chain = middlewares.map(middleware => middleware({
            dispatch: store.dispatch, getState: store.getState
        }))
        // 给dispatch实现洋葱模型
        let dispatch = compose(...chain)(store.dispatch)
        return {
            ...store,
            dispatch
        }
    }
}

/**
 * 
 * @param {*} r reduce
 * @param {*} enhancer 
 */
export function createStore(r, enhancer) {
    let state; // 状态
    let reducer;
    let subscribers = [] // 订阅者

    const dispatch = (action) => {
        state = reducer(state, action)
        // 通知订阅者
        subscribers.map(subscriber => subscriber())
    }
    const subscribe = (subscriber) => {
        // 加入订阅者
        subscribers.push(subscriber)
        // 返回unsubscribe
        return () => {
            subscribers.splice(subscribers.indexOf(subscriber), 1)
        }
    }
    const getState = () => {
        return state
    }
    // 给redux插件用的
    const observable = () => {
        const outerSubscribe = subscribe
        return {
            subscribe(observer) {
                function observeState() {
                    if (observer.next) {
                        observer.next(getState())
                    }
                }

                observeState()
                const unsubscribe = outerSubscribe(observeState)
                return { unsubscribe }
            },

            [$$observable]() {
                return this
            }
        }
    }
    reducer = r;
    // 初始化
    dispatch({ type: `@@redux/INIT${Math.random()}` })
    // 使用中间件生成
    if (enhancer) {
        return enhancer(createStore)(r)
    }
    return {
        dispatch,
        getState,
        subscribe,
        subscribers,
        [$$observable]: observable
    }
}