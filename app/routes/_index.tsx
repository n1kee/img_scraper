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

  const imgContainerClass = "img-container";
  const imgLoadedClass = "img--loaded";
  const [state, setState] = useState(new FetchFormClass);
  const submitForm = useSubmit();

  const allImagesLoaded = () => {
    const grid = document.querySelector(".grid");
    const imgsNum = grid
      .querySelectorAll(`.${imgContainerClass}`)
      .length;
    const loadedImgsNum = grid
      .querySelectorAll(`.${imgLoadedClass}`)
      .length;
    return imgsNum === loadedImgsNum;
  };

  const onImgResize = () => {
    const bodyElem = document.querySelector("body");
    const imgContainers = document
      .querySelectorAll(`.${imgContainerClass}`);
    const pageWidth = bodyElem.clientWidth - 5;
    let imgLine = [];
    let imgLineWidth = 0;

    imgContainers.forEach((container, idx) => {

      const img = container.querySelector("img");

      const imgWidth = +img.dataset.originalWidth;
      const newImgLineWidth = imgLineWidth + imgWidth;

      if (newImgLineWidth > pageWidth) {

        const widthDiff = pageWidth - imgLineWidth;

        imgLine.forEach((lineContainer, lineIdx) => {
          const lineImg = lineContainer.querySelector("img");
          const lineImgWidth = +lineImg.dataset.originalWidth;
          const imgWidthCoeff = lineImgWidth / imgLineWidth;
          const newWidth = lineImgWidth + imgWidthCoeff * widthDiff;
          lineContainer.style.width = `${newWidth}px`;
        });
        imgLine = [];
        imgLineWidth = imgWidth;
      } else {
        imgLineWidth = newImgLineWidth;
      }
      imgLine.push(container);
    });
  };

  const onImgLoad = ({target: img}) => {
    const clientWidth = img.clientWidth;
    if (!img.classList.contains(imgLoadedClass)) {
      img.dataset.originalWidth = clientWidth;
      img.style.objectFit = "cover";
      img.classList.add(imgLoadedClass);
    }
    if (allImagesLoaded()) {
      const bodyElem = document.querySelector("body");
      bodyElem.onresize = onImgResize;
      onImgResize();
    }
  };

  useEffect(() => {
    API.getAllImages()
      .then(images => { 
        onChange(event, { name: "images", value: images });
      });
  }, []);

  const onChange = (evt, { name, value }) => {
    //Form submission happens here
    setState({ ...state, [name]: value });
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
 
    const images = await API.getImages(
      state.url,
      state.minWidth,
      state.minHeight
    );
    onChange(event, { name: "images", value: images });
    //Form submission happens here
  };

  const gridStyle = {
  };

  const containerStyle = {
    float: "left",
    height: "200px",
  };

  const imgStyle = {
    // objectFit: "cover",
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
      <div className="grid" style={gridStyle}>
        {
          state.images.map(function(imageUrl, i){
            return <div key={i} style={containerStyle} className={imgContainerClass}>
                    <img onLoad={onImgLoad} style={imgStyle} src={imageUrl} />
                  </div>;
          })
        }
      </div>
    </div>
  );
}
