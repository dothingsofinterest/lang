import Guard from "./Guard";
import Catalog from "./Catalog";
import Nav from "./Nav";
import Main from "./Main";

const App = () => {
    return (
        <Guard>
            <Nav />
            <Catalog />
            <Main />
        </Guard>
    );
};

export default App;
