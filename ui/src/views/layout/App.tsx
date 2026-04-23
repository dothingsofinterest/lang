import Guard from "./Guard";
import List from "./List";
import Nav from "./Nav";
import Main from "./Main";

const App = () => {
    return (
        <Guard>
            <Nav />
            <List />
            <Main />
        </Guard>
    );
};

export default App;
