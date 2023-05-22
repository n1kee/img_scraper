import type { V2_MetaFunction } from "@remix-run/node";
import { Form, Button } from 'semantic-ui-react';
import { useState } from "react";
import { useSubmit } from "@remix-run/react";
import { API } from '../api.tsx';
import { useEffect, useRef } from 'react';

/**
 * Meta data of the web page.
 */
export const meta: V2_MetaFunction = () => {
  return [{ title: "Image Scraper" }];
}; 

/**
 * Represents a Fetch form.
 * @typedef FetchFormClass
 * @constructor
 * @property {string} minWidth - Minimum width of images to be loaded.
 * @property {string} minHeight - Minimum height of images to be loaded.
 * @property {string} url - URL of the webpage where to get images from.
 * @property {String[]} images - List of downloaded image URL's.
 */
class FetchFormClass {
    isLoading: bool = true;
    minWidth: string = "200";
    minHeight: string = "200";
    url: string = "https://symfony.com/blog/new-in-symfony-3-3-optional-class-for-named-services";
    images: Array<String>[] = [];
    imagesInfo: Array<String>[] = [];
}

/**
 * Represents an Index page component.
 * @typedef FetchFormClass
 * @constructor
 */
export default function Index() {

  const imgContainerClass = "img-container";
  const imgLoadedClass = "img--loaded";
  const [state, setState] = useState(new FetchFormClass);
  const submitForm = useSubmit();
  const imgWidthRef = useRef(new Map);
  const imagesInfo = useRef({});

  /**
   * Returns loader's status.
   * @returns {string} - Loader status class string.
   */
  const getLoaderStatus = () => {
    return state.isLoading ? 'active' : 'disabled';
  };

  /**
   * Checks if all images has been loaded.
   * @returns {bool} - Indicates if all images has been loaded.
   */
  const allImagesLoaded = () => {
    const grid = document.querySelector(".grid");
    const loadedImgsNum = Object.keys(imagesInfo.current).length;
    return state.images.length === loadedImgsNum;
  };

  /**
   * Handles positioning and sizing of images.
   */
  const onImgResize = () => {
    console.log("onImgResize");
    const bodyElem = document.querySelector("body");
    const pageWidth = bodyElem.clientWidth - 5;
    let imgLine = [];
    let imgLineWidth = 0;

    let totalImgWidth = imgWidthRef.current.get("total");
    let rowsNum = Math.floor(imgWidthRef.current.get("total") / pageWidth);
    let freeWidth = rowsNum * pageWidth;
    let originalImgLineWidth = 0;

    Object.values(imagesInfo.current).forEach((imageInfo, idx) => {
      // const img = container.querySelector("img");

      const widthDiff = totalImgWidth - freeWidth;

      const imgWidth = imageInfo.width;
      originalImgLineWidth += imgWidth;
      // Collect images line by line and resize them on line overflow.
      const imgWidthCoeff = imgWidth / totalImgWidth;
      const newImgWidth = imgWidth - imgWidthCoeff * widthDiff;
      const newImgLineWidth = imgLineWidth + newImgWidth;
      imageInfo.calculatedWidth = newImgWidth;
      imgLine.push(imageInfo);
      const pageOverflow = newImgLineWidth >= pageWidth;
      const theLastElement = idx === (state.images.length - 1);

      if (pageOverflow || theLastElement) {

        const rowDiff = pageWidth - newImgLineWidth;

        imgLine.forEach((lineImgInfo, lineIdx) => {
          const lineImgWidth = lineImgInfo.calculatedWidth;
          const imgWidthCoeff = lineImgWidth / newImgLineWidth;
          const newWidth = lineImgWidth + imgWidthCoeff * rowDiff;
          lineImgInfo.calculatedWidth = newWidth;
        });
        imgLine = [];
        totalImgWidth -= originalImgLineWidth;
        freeWidth -= pageWidth;
        imgLineWidth = 0;
        originalImgLineWidth = 0;
      } else {
        imgLineWidth = newImgLineWidth;
      }
    });
    updateState({ imagesInfo: Object.values(imagesInfo.current) });
  };

  /**
   * Callback for the image load event
   * @param {Event} - Onload event. 
   */
  const onImgLoad = ({target: img}) => {
    const clientWidth = img.clientWidth;
    if (!imagesInfo.current[ img.src ]) {
      const totalImgWidth = imgWidthRef.current.get("total") || 0;
      imgWidthRef.current.set("total", totalImgWidth + clientWidth);
      imagesInfo.current[ img.src ] = {
        src: img.src,
        width: img.clientWidth,
        height: img.clientHeight,
      };
    }
    if (allImagesLoaded()) {
      const bodyElem = document.querySelector("body");
      bodyElem.onresize = onImgResize;
      updateState({ imagesInfo: Object.values(imagesInfo.current) });
      onImgResize();
    }
  };

  useEffect(() => {
    // Get all stored images on a page load.
    API.getAllImages()
      .then(images => { 
        updateState({ images, isLoading: false });
      });
  }, []); 

  /**
   * Updates the state
   * @param {object} stateUpdate - State property updates. 
   */
  const updateState = stateUpdate => {
    setState({ ...state, ...stateUpdate });
  };

  /**
   * Handles an input change.
   * @param {Event} evt - Input change event. 
   */
  const onInputChange = evt => {
    updateState({ [evt.target.name]: evt.target.value });
  };

  /**
   * Handles a form submit.
   * @param {React.FormEvent} event - Form submit event. 
   */
  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    updateState({
      isLoading: true
    });

    const images = await API.getImages(
      state.url,
      state.minWidth,
      state.minHeight
    );
    updateState({
      images,
      isLoading: false
    });
  };

  const formStyle = {
    padding: "20px",
  };

  const containerStyle = {
    float: "left",
    height: "200px",
  };

  const imgStyle = {
    objectFit: "cover",
    maxHeight: "200px",
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
        <div className={`ui ${getLoaderStatus()} dimmer`}>
          <div className="ui text loader">Loading, please wait ...</div>
        </div>
      </div>
      <div className="grid">
        {
          state.imagesInfo.map(function(imageInfo, i){
            return <div
                      key={i}
                      style={containerStyle}
                      className={imgContainerClass}
                    >
                    <img
                      width={imageInfo.calculatedWidth}
                      style={imgStyle}
                      src={imageInfo.src}
                    />
                  </div>;
          })
        }
        <div style={{clear: "both"}}></div>
      </div>
      <div style={{position: "absolute", bottom: "110%"}}>
        {
          state.images.map(function(imageUrl, i){
            return <img
                      key={i}
                      onLoad={onImgLoad}
                      src={imageUrl}
                  />;
          })
        }
      </div>
    </div>
  );
}
