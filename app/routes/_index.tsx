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
  width: float | string = "auto";
  height: float | string = "auto";
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
    loadedImagesCount: int = 0;
}

/**
 * Represents an Index page component.
 * 
 * @class
 * @consructor
 */
export default function Index() {

  const gridClassName = "grid";
  const imgContainerClass = "img-container";
  const imgLoadedClass = "img--loaded";
  const [state, setState] = useState(new FetchFormClass);
  const submitForm = useSubmit();

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
    const loadedImgs = document.querySelectorAll(`.${imgLoadedClass}`);
    return state.images.length === loadedImgs.length;
  };

  /**
   * Handles positioning and sizing of imagesUrls.
   */
  const resizeGrid = () => {
    const bodyElem = document.querySelector("body");
    const pageWidth = bodyElem.clientWidth - 5;
    let imgLine = [];
    let imgLineWidth = 0;

    let totalImgWidth = state.images
      .reduce((result, img) => {
        return result + img.width;
      }, 0);
    let rowsNum = Math.floor(totalImgWidth / pageWidth);
    let freeWidth = rowsNum * pageWidth;
    let originalImgLineWidth = 0;

    state.images.forEach((image, idx) => {

      const widthDiff = totalImgWidth - freeWidth;

      const imgWidth = image.width;
      originalImgLineWidth += imgWidth;
      // Collect imagesUrls line by line and resize them on line overflow.
      const imgWidthCoeff = imgWidth / totalImgWidth;
      const newImgWidth = imgWidth - imgWidthCoeff * widthDiff;
      const newImgLineWidth = imgLineWidth + newImgWidth;
      image.calculatedWidth = newImgWidth;
      imgLine.push(image);
      const pageOverflow = newImgLineWidth >= pageWidth;
      const theLastElement = idx === (state.images.length - 1);

      if (pageOverflow || theLastElement) {

        const rowDiff = pageWidth - newImgLineWidth;

        imgLine.forEach((lineImg, lineIdx) => {
          const lineImgWidth = lineImg.calculatedWidth;
          const imgWidthCoeff = lineImgWidth / newImgLineWidth;
          const newWidth = lineImgWidth + imgWidthCoeff * rowDiff;
          lineImg.calculatedWidth = newWidth;
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
    setTimeout(() => updateState({ }), 0);
  };

  /**
   * Callback for the image load event
   * @param {Event} - Onload event. 
   */
  const onImgLoad = ({target: img}) => {
    const image = state.images[ img.src ];
    img.classList.add(imgLoadedClass);
    if (!image.isLoaded) {
      image.src = img.src;
      image.width = img.clientWidth;
      image.height = img.clientHeight;
      image.isLoaded = true;
      state.loadedImagesCount++;
    }
    if (allImagesLoaded()) {
      const bodyElem = document.querySelector("body");
      bodyElem.onresize = resizeGrid;
      resizeGrid();
    }
  };

  const initImages = imagesUrls => {
    const images = imagesUrls.reduce((result, url) => {
      const image = state.images[url] || new Image(url);
      result.push(image);
      result[url] = image;
      return result;
    }, []);
    return images;
  };

  useEffect(() => {
    // Get all stored images on a page load.
    API.getAllImages()
      .then(imagesUrls => {
        updateState({ imagesUrls, isLoading: false });
      });
  }, []); 

  /**
   * Updates the state
   * @param {object} stateUpdate - State property updates. 
   */
  const updateState = stateUpdate => {
    if (stateUpdate.imagesUrls) {
      stateUpdate.images = initImages(stateUpdate.imagesUrls);
    }
    stateUpdate.loadedCount = (stateUpdate.imagesUrls || [])
      .reduce((count, img) => {
        return count + img.isLoaded;
      }, 0);
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
      <div className={gridClassName}>
        {
          state.images.map(function(image, i){
            return <div
                      key={i}
                      style={containerStyle}
                      className={imgContainerClass}
                    >
                    <img
                      style={imgStyle}
                      src={image.src}
                      onLoad={onImgLoad}
                      width={image.calculatedWidth}
                      data-width={image.width}
                      data-height={image.height}
                    />
                  </div>;
          })
        }
        <div style={{clear: "both"}}></div>
      </div>
    </div>
  );
}
