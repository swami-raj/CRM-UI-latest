import PageRoute from "./routes/PageRoutes"
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <PageRoute />
    </>
  );
}

export default App;
