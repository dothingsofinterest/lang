import Guard from "./Guard";
import Menu from "./Menu";
import Main from "./Main";

const App = () => {
    return (
        <Guard>
            <Menu />
            <Main />
        </Guard>
    );
};

export default App;
