import type { V2_MetaFunction } from "@remix-run/node";
import { Form, Button } from 'semantic-ui-react'
import { useState } from "react"

export const meta: V2_MetaFunction = () => {
  return [{ title: "New Remix App" }];
}; 

class FetchFormClass {
    minWidth: string = "";
    minHeight: string = "";
    fetchUrl: string = "";
}

export default function Index() {

  const [state, setState] = useState(new FetchFormClass);

  const onChange = (evt, { name, value }) => {
    //Form submission happens here
    setState({ ...state, [name]: value });
    console.log("onChange", state);
  };

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log(event);
    //Form submission happens here
  };

  return (
    <Form onSubmit={onSubmit}>
       123123
      <Form.Input
        onChange={onChange}
        value={state.minWidth}
        type="text"
        name="minWidth"
      />
      <Form.Input
        onChange={onChange}
        value={state.minHeight}
        type="text"
        name="minHeight"
      />
      <Form.Input
        onChange={onChange}
        value={state.fetchUrl}
        type="text"
        name="fetchUrl"
      />
      <Button type="submit" name="url">Fetch</Button>
    </Form>
  );
}
