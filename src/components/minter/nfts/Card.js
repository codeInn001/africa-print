import React from "react";
import PropTypes from "prop-types";
import { Card, Col, Badge, Stack, Row } from "react-bootstrap";
import { truncateAddress } from "../../../utils";
import Identicon from "../../ui/Identicon";
import { useEffect, useState, useCallback } from "react";
import { Button, Modal, Form, FloatingLabel } from "react-bootstrap";


  const NftCard = ({ nft, purchaseItem, isSold, isOwner, isForsale, toggleForsale, modPrice, contractOwner }) => {
  const { owner, price, image, description, name, index, attributes } = nft;
  const [newPrice, setnewPrice] = useState(0);
  const [editPrice, setEditprice] = useState(false)
  const [showEditButton, setShowEditButton] = useState(true)
  



  const handleChangePrice = (newPrice)=>{
      modPrice(newPrice, index);
      setEditprice(prevState => !prevState)
      setShowEditButton(prevState => !prevState)
  }

  const handleEditPrice = () => {
    setEditprice(prevState => !prevState)
    setShowEditButton(prevState => !prevState)
  }

  return (
    <Col key={index}>
      <Card className=" h-100">
        <Card.Header>
          <Stack direction="horizontal" gap={2}>
            <Identicon address={owner} size={28} />
            <span className="font-monospace text-secondary">
              {truncateAddress(owner)}
            </span>
            <Badge bg="secondary" className="ms-auto">
              {index} ID
            </Badge>
            <Badge bg="secondary" className="ms-auto">
              {price / 10 ** 18} CELO
            </Badge>
          </Stack>
        </Card.Header>

        <div className=" ratio ratio-4x3">
          <img className="nft-image" src={image} alt={description} style={{ objectFit: "cover" }} />
        </div>

        <Card.Body className="d-flex  flex-column text-center">
          <Card.Title>{name}</Card.Title>
          <Card.Text className="flex-grow-1">{description}</Card.Text>
          <div>
            <Row className="mt-2">
              {attributes.map((attribute, key) => (
                <Col key={key}>
                  <div className="border rounded bg-dark">
                    <div className="text-secondary fw-lighter small text-capitalize">
                      {attribute.trait_type}
                    </div>
                    <div className="text-secondary text-capitalize font-monospace">
                      {attribute.value}
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          </div>

          {isSold ? (
            <div className="d-flex m-2 justify-content-center">
              <button
                className={`btn ${isOwner ? "btn-danger" : "btn-secondary"}`}
              >
                {isOwner ? "You bought this item" : "This item has been sold"}
              </button>

            </div>
          ) : (
            
            <div className="d-flex m-2 justify-content-center">
               
              <button  onClick={purchaseItem} className="btn btn-primary btn-lg w-100" style={{backgroundImage:"linear-gradient(315deg, #000428 0%, #004e92 74%)"}} >
                Buy
              </button>
            </div>
            
          )}

{isOwner ? (
            <div className="d-flex m-2 justify-content-center">
              <Button onClick={toggleForsale} className= "btn btn-primary w-50"
              style={{backgroundColor:"#005"}}
            >
               {isForsale ? "toggle not for sale" : "toggle for sale"} 
              </Button>
              <div className="d-flex ms-1  justify-content-center ">
              <p  className="align-self-end">{isForsale ? "collection for sale": "collection not for sale"}</p>
              </div>
            </div>
          ) : (
            <div className="d-flex m-2 justify-content-center">
              <p>{isForsale ? "this item is for sale" : "this item is not for sale"}</p>
            </div>
          )}

              {showEditButton &&<Button
                type="buton"
                style={{backgroundColor:"grey"}} 
                classNmae="btn btn-secondary"
                onClick={handleEditPrice} 
              >
                Change Item Price
              </Button>}

      {editPrice && contractOwner === owner && (
            <>
               <Form.Control
                className={"pt-2 mb-1"}
                type="text"
                placeholder="Enter new price"
                onChange={(e) => {
                  setnewPrice(e.target.value);
                }}
              />
              <Button
                variant="primary"
                onClick={() => handleChangePrice(newPrice)}
              >
                Change Item price
              </Button>
            </>
          )}

  

        </Card.Body>
      </Card>
    </Col>

  );
};

NftCard.propTypes = {
  // props passed into this component
  nft: PropTypes.instanceOf(Object).isRequired,
  modPrice: PropTypes.func.isRequired,

};

export default NftCard;
