import React from "react";
import TextEditor from "./components/text-editor/text-editor.component";
import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
function App() {
  return (
    <BrowserRouter>
      <Switch>
        <Route exact path="/">
          <Redirect to={`/documents/${uuidv4()}`} />
        </Route>
        <Route exact path="/documents/:id">
          <TextEditor />
        </Route>
      </Switch>
    </BrowserRouter>
  );
}

export default App;
