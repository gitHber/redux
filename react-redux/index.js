import ReduxContext from './ReduxContext'
import React, { useContext, useEffect, useReducer, useMemo } from 'react'

export function Provider({ store, children }) {
    return <ReduxContext.Provider value={store}>{children}</ReduxContext.Provider>
}
export function useDispatch() {
    const store = useContext(ReduxContext)
    return store.dispatch;
}
export function useSelector(selector) {
    const [, forceRender] = useReducer(s => s + 1, 0)
    const store = useContext(ReduxContext)
    useEffect(() => {
        // store订阅forceRender，每次store改变强制渲染
        return store.subscribe(() => {
            forceRender()
        })
    }, [])
    return selector(store.getState());
}
export function useStore() {
    return useContext(ReduxContext)
}