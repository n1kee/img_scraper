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

  const toggleDimmer = () => {
      const dimmer = document.querySelector(".dimmer");
      dimmer.classList.toggle("disabled");
      dimmer.classList.toggle("active");
  };

  const onChange = (evt, { name, value }) => {
    setState({ ...state, [name]: value });
  };

  const onInputChange = evt => {
    onChange(evt, { name: evt.target.name, value: evt.target.value });
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    toggleDimmer();
 
    const images = await API.getImages(
      state.url,
      state.minWidth,
      state.minHeight
    );
    onChange(event, { name: "images", value: images });
    toggleDimmer();
  };

  const formStyle = {
    padding: "20px",
  };

  const containerStyle = {
    float: "left",
    height: "200px",
  };

  const imgStyle = {
    maxHeight: "200px",
    width: "100%",
    height: "100%",
  };
  return (
    <div>
      <div className="ui segment">
      <Form style={formStyle} onSubmit={onSubmit}>
          <Form.Field>
            <label>
              Minimum image width:
              <input
                onChange={onInputChange}
                value={state.minWidth}
                name="minWidth"
                type="number"
                pattern="\d+"
                required
              />
            </label>
          </Form.Field>
          <Form.Field>
            <label>
              Minimum image height:
              <input
                onChange={onInputChange}
                value={state.minHeight}
                name="minHeight"
                mask="9999"
                type="number"
                pattern="\d+"
                required
              />
            </label>
          </Form.Field>
          <Form.Field>
            <label>
              URL:
              <input
                onChange={onInputChange}
                value={state.url}
                name="url"
                type="url"
                pattern="https?://.+"
                placeholder="http://example.com"
                required
              />
            </label>
          </Form.Field>
          <Button type="submit" name="url">Fetch</Button>
        </Form>
        <div className="ui disabled dimmer">
          <div className="ui text loader">Loading, please wait ...</div>
        </div>
      </div>
      <div className="grid">
        {
          state.images.map(function(imageUrl, i){
            return <div key={i} style={containerStyle} className={imgContainerClass}>
                    <img onLoad={onImgLoad} style={imgStyle} src={imageUrl} />
                  </div>;
          })
        }
        <div style={{clear: "both"}}></div>
      </div>
    </div>
  );
}
