import React from "react";
import { Row, Col, Button } from "react-bootstrap";

export default function SelectSize({ sizes, selectedSize, onSizeSelect }) {
    const handleSizeClick = (size) => {
        if (size.available) {
            onSizeSelect(size);
        }
    };

    return (
        <div className="mb-4">
            <div className="d-flex align-items-center mb-3">
                <h5 className="mb-0 me-auto">Select Size</h5>
                {/* <Button variant="link" className="p-0 text-decoration-none">
                    <i className="bi bi-rulers me-1"></i> Size Guide
                </Button> */}
            </div>

            <Row className="g-2">
                {sizes.map((size, index) => (
                    <Col xs={3} sm={3} md={3} key={index}>
                        <div
                            className={`border rounded text-center py-2 ${
                                selectedSize === size.value
                                    ? "border-dark border-2 fw-bold"
                                    : "border-dark"
                            } ${
                                size.available
                                    ? "bg-white"
                                    : "bg-light text-muted"
                            }`}
                            style={{
                                cursor: size.available
                                    ? "pointer"
                                    : "not-allowed",
                                userSelect: "none",
                                opacity: size.available ? 1 : 0.6 // Improves visibility for disabled sizes
                            }}
                            onClick={() => handleSizeClick(size)}
                        >
                            {size.value}
                        </div>
                    </Col>
                ))}
            </Row>
        </div>
    );
}
