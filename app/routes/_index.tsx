import type { V2_MetaFunction } from "@remix-run/node";
import { Form, Button } from 'semantic-ui-react'

export const meta: V2_MetaFunction = () => {
  return [{ title: "New Remix App" }];
};

export default function Index() {

  const state = {
    minWidth: "",
    minHeight: "",
    fetchUrl: "",
  };

  const onChange = (arg1, arg2) => {
    console.log("onChange", arg1, arg2);
    //Form submission happens here
  };

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log(event);
    //Form submission happens here
  };

  return (
    <Form onSubmit={onSubmit}>
       ######
      <Form.Input onChange={onChange} value={state.minWidth} type="text" name="min-width"/>
      <Form.Input onChange={onChange} value={state.minHeight} type="text" name="min-height"/>
      <Form.Input onChange={onChange} value={state.fetchUrl} type="text" name="url"/>
      <Form.Input type="submit" name="url" text="Fetch"/>
    </Form>
  );
}
