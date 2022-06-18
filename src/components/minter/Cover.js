import React from "react";
import { Button } from "react-bootstrap";
import PropTypes from "prop-types";

const Cover = ({ name, coverImg, connect }) => {
  if (name) {
    return (
      <div
        className="d-flex justify-content-center flex-column text-center "
        style={{ backgroundImage: "linear-gradient(to bottom, rgba(0, 0, 0, 0.97), rgba(0, 0, 0, 0.97)), url('https://drive.google.com/uc?export=view&id=1KitFsBbAxmk9-PfO2SGLaA5SCaWCMr8s')", minHeight: "100vh" }}
      >
        <div className="mt-auto text-light mb-5">
          <div
            className=" ratio ratio-1x1 mx-auto mb-2"
            style={{ maxWidth: "320px" }}
          >
            <img src={coverImg} alt="" />
          </div>
          <h1>{name}</h1>
          <p>Please connect your wallet to continue.</p>
          <Button
            onClick={() => connect().catch((e) => console.log(e))}
            variant="outline-light"
            className="rounded-pill px-3 mt-3"
            style={{backgroundColor: "#55efc4", backgroundImage:"linear-gradient(315deg, #000428 0%, #004e92 74%)", cursor: "pointer"}}
          >
            Connect Wallet
          </Button>
        </div>

        <p className="mt-auto text-secondary">Powered by Celo</p>
      </div>
    );
  }

  return null;
};

Cover.propTypes = {
  name: PropTypes.string,
};

Cover.defaultProps = {
  name: "",
};

export default Cover;