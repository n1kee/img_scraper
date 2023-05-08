import type { V2_MetaFunction } from "@remix-run/node";
import { Form, Button } from 'semantic-ui-react';
import { useState } from "react";
import { useSubmit } from "@remix-run/react";
import {API} from '../api.tsx'

export const meta: V2_MetaFunction = () => {
  return [{ title: "New Remix App" }];
}; 

//API.test();

class FetchFormClass {
    maxWidth: string = "";
    maxHeight: string = "";
    url: string = "";
    images: Array<String>[] = [];
}

export default function Index() {

  const [state, setState] = useState(new FetchFormClass);
  const submitForm = useSubmit();

  const onChange = (evt, { name, value }) => {
    //Form submission happens here
    console.log("onChange", evt, name, value);
    setState({ ...state, [name]: value });
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
 
    const images = await API.getImages(
      state.url,
      state.maxWidth,
      state.maxHeight
    );
    console.log("IMAGES", images);
    onChange(event, { name: "images", value: images });
    console.log("NEW STATE", state);
    //Form submission happens here
  };
  return (
    <div>
      <Form onSubmit={onSubmit}>
        <Form.Input
          onChange={onChange}
          value={state.maxWidth}
          type="text"
          name="maxWidth"
        />
        <Form.Input
          onChange={onChange}
          value={state.maxHeight}
          type="text"
          name="maxHeight"
        />
        <Form.Input
          onChange={onChange}
          value={state.url}
          type="text"
          name="url"
        />
        <Button type="submit" name="url">Fetch</Button>
      </Form>
      {
        state.images.map(function(imageUrl, i){
          return <img src={imageUrl} />;
        })
      }
    </div>
  );
}
