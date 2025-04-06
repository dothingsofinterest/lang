import Guard from "./Guard";
import Menu from "./Menu";
import Main from "./Main";
import { Outlet } from "react-router-dom";
const App = () => {
    return (
        <Guard>
            <Menu />
            <Main />
        </Guard>
    );
};

export default App;
