import React, { useState } from "react";
import PropTypes from "prop-types";
import { Button, Modal, Form, FloatingLabel } from "react-bootstrap";
import { uploadToIpfs } from "../../../utils/minter";

// basic attributes that can be added to NFT

const AFRICAPRINTSTYPE = ["Kente", "Ankara", "Shweshwe", "Kongo", "Aso Oke", "Kitenge", "Ukara", "Others"] ;

const AddNfts = ({ save, address }) => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState(0);
  const [ipfsImage, setIpfsImage] = useState("");
  const [description, setDescription] = useState("");

  //store attributes of an NFT
  const [attributes, setAttributes] = useState([]);
  const [show, setShow] = useState(false);

  // check if all form data has been filled
  const isFormFilled = () =>
    name && ipfsImage && description && attributes.length === 1;

  // close the popup modal
  const handleClose = () => {
    setShow(false);
    setAttributes([]);
  };

  // display the popup modal
  const handleShow = () => setShow(true);

  // add an attribute to an NFT
  const setAttributesFunc = (e, trait_type) => {
    const { value } = e.target;
    const attributeObject = {
      trait_type,
      value,
    };
    const arr = attributes;

    // check if attribute already exists
    const index = arr.findIndex((el) => el.trait_type === trait_type);

    if (index >= 0) {
      // update the existing attribute
      arr[index] = {
        trait_type,
        value,
      };
      setAttributes(arr);
      return;
    }

    // add a new attribute
    setAttributes((oldArray) => [...oldArray, attributeObject]);
  };

  return (
    <>
      <Button
        onClick={handleShow}
        variant="dark"
        className="rounded-pill px-2"
      >
        Create Collection
      </Button>

      {/* Modal */}
      <Modal show={show} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Create NFT</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form>
            <FloatingLabel
              controlId="inputLocation"
              label="Name"
              className="mb-3"
            >
              <Form.Control
                type="text"
                placeholder="Name of NFT"
                onChange={(e) => {
                  setName(e.target.value);
                }}
              />
            </FloatingLabel>

            <FloatingLabel
              controlId="inputDescription"
              label="Description"
              className="mb-3"
            >
              <Form.Control
                as="textarea"
                placeholder="description"
                style={{ height: "80px" }}
                onChange={(e) => {
                  setDescription(e.target.value);
                }}
              />
            </FloatingLabel>

            <FloatingLabel
              controlId="inputPrice"
              label="Price"
              className="mb-3"
            >
              <Form.Control
                as="textarea"
                placeholder="Price"
                style={{ height: "80px" }}
                onChange={(e) => {
                  setPrice(e.target.value);
                }}
              />
            </FloatingLabel>

            <Form.Control
              type="file"
              className={"mb-3"}
              onChange={async (e) => {
                const imageUrl = await uploadToIpfs(e);
                if (!imageUrl) {
                  alert("failed to upload image");
                  return;
                }
                setIpfsImage(imageUrl);
              }}
              placeholder="Product name"
            ></Form.Control>
            <Form.Label>
              <h5>Properties</h5>
            </Form.Label>

            

            <Form.Control
              as="select"
              className={"mb-3"}
              onChange={async (e) => {
                setAttributesFunc(e, "africaPrints Type");
              }}
              placeholder="africaPrints Type"
            >
              <option hidden>africaPrints Type</option>
              {AFRICAPRINTSTYPE.map((africaPrintsType) => (
                <option
                  key={`africaPrintType-${africaPrintsType.toLowerCase()}`}
                  value={africaPrintsType.toLowerCase()}
                >
                  {africaPrintsType}
                </option>
              ))}
            </Form.Control>
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="outline-secondary" onClick={handleClose}>
            Close
          </Button>

          <Button
            variant="dark"
            disabled={!isFormFilled()}
            onClick={() => {
              save({
                name,
                price,
                ipfsImage,
                description,
                ownerAddress: address,
                attributes,
              });
              handleClose();
            }}
          >
            Create NFT
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

AddNfts.propTypes = {
  // props passed into this component
  save: PropTypes.func.isRequired,
  address: PropTypes.string.isRequired,
};

export default AddNfts;
