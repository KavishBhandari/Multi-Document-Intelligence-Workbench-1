import { Provider } from "react-redux";
import { RouterProvider } from "react-router";
import { store } from "./app.store";
import { routes } from "./App.routes";

const App = () => {
  return (
    <Provider store={store}>
      <RouterProvider router={routes} />
    </Provider>
  );
};

export default App;