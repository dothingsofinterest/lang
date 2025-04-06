import React, { useState, useRef, useEffect } from "react";
const Index = () => {
    console.log("子组件刷新了");
    return <div>这是子组件</div>;
};
//这里我们用react.memo对组件进行包裹，包裹一次之后react在render的过程中不会给该fiber打上更新的tag
//从而跳过更新，这个原理其实就是react.memo的第二个参数上，如果react.memo第二个参数不传递，react回默
//认给我们补充上第二个参数的逻辑，其中逻辑就是浅比较Index组件的props参数，如果相等的话默认第二个参数返
//回true，组件就会缓存了，如果不相等的话就会返回false组件就会重新打上更新的tag然后重新渲染。
const MemoIndex = React.memo(Index);

const App = () => {
    const [state, setState] = useState(0);
    return (
        <div className="App">
            <button onClick={() => setState(state + 1)}>点我看看子组件刷新了吗</button>
            <Index />
        </div>
    );
};
export default App;