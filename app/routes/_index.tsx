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
 * Represents an Image.
 * @property {string} src - Source URL of an image.
 * @property {float} width - Minimum width of imagesUrls to be loaded.
 * @property {float} height - Minimum height of imagesUrls to be loaded.
 * @property {bool} isLoaded - URL of the webpage where to get imagesUrls from.
 */
class Image {
  src: string;
  width: float;
  height: float;
  isLoaded: bool = false;

  constructor(protected src) {

  }
}

/**
 * Represents a form for fetching imagesUrls.
 * @property {string} minWidth - Minimum width of imagesUrls to be loaded.
 * @property {string} minHeight - Minimum height of imagesUrls to be loaded.
 * @property {string} url - URL of the webpage where to get imagesUrls from.
 * @property {String[]} imagesUrls - List of downloaded image URL's.
 */
class FetchFormClass {
    isLoading: bool = true;
    minWidth: string = "200";
    minHeight: string = "200";
    url: string = "https://symfony.com/blog/new-in-symfony-3-3-optional-class-for-named-services";
    images: Array<Image>[] = [];
    imagesUrls: Array<String>[] = [];
}

/**
 * Represents an Index page component.
 * 
 * @class
 * @consructor
 */
export default function Index() {

  const imgContainerClass = "img-container";
  const imgLoadedClass = "img--loaded";
  const [state, setState] = useState(new FetchFormClass);
  const submitForm = useSubmit();
  const imgWidthRef = useRef(new Map);
  const images = useRef({});

  /**
   * Returns loader's status.
   * @returns {string} - Loader status class string.
   */
  const getLoaderStatus = () => {
    return state.isLoading ? 'active' : 'disabled';
  };

  /**
   * Checks if all imagesUrls has been loaded.
   * @returns {bool} - Indicates if all imagesUrls has been loaded.
   */
  const allImagesLoaded = () => {
    const grid = document.querySelector(".grid");
    const loadedImgsNum = Object.keys(images.current).length;
    return state.images.length === loadedImgsNum;
  };

  /**
   * Handles positioning and sizing of imagesUrls.
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

    Object.values(images.current).forEach((imageInfo, idx) => {
      // const img = container.querySelector("img");

      const widthDiff = totalImgWidth - freeWidth;

      const imgWidth = imageInfo.width;
      originalImgLineWidth += imgWidth;
      // Collect imagesUrls line by line and resize them on line overflow.
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
    updateState({ images: Object.values(images.current) });
  };

  /**
   * Callback for the image load event
   * @param {Event} - Onload event. 
   */
  const onImgLoad = ({target: img}) => {
    const clientWidth = img.clientWidth;
    if (!images.current[ img.src ]) {
      const totalImgWidth = imgWidthRef.current.get("total") || 0;
      imgWidthRef.current.set("total", totalImgWidth + clientWidth);
      images.current[ img.src ] = {
        src: img.src,
        width: img.clientWidth,
        height: img.clientHeight,
      };
    }
    if (allImagesLoaded()) {
      const bodyElem = document.querySelector("body");
      bodyElem.onresize = onImgResize;
      updateState({ images: Object.values(images.current) });
      onImgResize();
    }
  };

  useEffect(() => {
    // Get all stored imagesUrls on a page load.
    API.getAllImages()
      .then(imagesUrls => {
        const images = imagesUrls.map(url => new Image(url));
        updateState({ imagesUrls, isLoading: false });
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

    const imagesUrls = await API.getImages(
      state.url,
      state.minWidth,
      state.minHeight
    );
    updateState({
      imagesUrls,
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
          state.images.map(function(imageInfo, i){
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
          state.imagesUrls.map(function(imageUrl, i){
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
