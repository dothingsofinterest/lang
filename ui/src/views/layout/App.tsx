import Guard from "./Guard";
import Nav from "./Nav";
import Menu from "./Menu";
import Main from "./Main";

const App = () => {
    return (
        <Guard>
            <Nav />
            <Menu />
            <Main />
        </Guard>
    );
};

export default App;
