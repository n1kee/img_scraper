import type { V2_MetaFunction } from "@remix-run/node";
import { Form, Button } from 'semantic-ui-react';
import { useState } from "react";
import { useSubmit } from "@remix-run/react";
import { API } from '../api.tsx';
import { useEffect } from 'react';

export const meta: V2_MetaFunction = () => {
  return [{ title: "New Remix App" }];
}; 

class FetchFormClass {
    minWidth: string = "200";
    minHeight: string = "200";
    url: string = "https://symfony.com/blog/new-in-symfony-3-3-optional-class-for-named-services";
    images: Array<String>[] = [];
}

export default function Index() {

  const [state, setState] = useState(new FetchFormClass);
  const submitForm = useSubmit();

  useEffect(() => {
    API.getImages(
      "http://localhost:3000/",
      state.minWidth,
      state.minHeight
    ).then(images => { 
      onChange(event, { name: "images", value: images });
    });
  }, []);

  const onChange = (evt, { name, value }) => {
    //Form submission happens here
    console.log("onChange", evt, name, value);
    setState({ ...state, [name]: value });
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
 
    const images = await API.getImages(
      state.url,
      state.minWidth,
      state.minHeight
    );
    console.log("IMAGES", images);
    onChange(event, { name: "images", value: images });
    console.log("NEW STATE", state);
    //Form submission happens here


  };
  const gridStyle = {
    display: "flex",
    flexFlow: "row wrap",
  };

  const containerStyle = {
    display: "inline-block",
    height: "200px",
    minWidth: "190px",
    flex: "1",
  };

  const imgStyle = {
    objectFit: "cover",
    maxHeight: "200px",
    width: "100%",
    height: "100%",
  };
  return (
    <div>
      <div>
      <img src="http://localhost:8000/colors-gallery-storage/06094133e100e74b421c3da6e35be07b696c838d3c3bb10a34e1634f33723d87" />
      </div>
      <Form onSubmit={onSubmit}>
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
          value={state.url}
          type="text"
          name="url"
        />
        <Button type="submit" name="url">Fetch</Button>
      </Form>
      <div style={gridStyle}>
        {
          state.images.map(function(imageUrl, i){
            return <div style={containerStyle} class="image-container">
                    <img key="i" style={imgStyle} src={imageUrl} />
                  </div>;
          })
        }
        <div style={{flex: 2}}></div>
      </div>
    </div>
  );
}
