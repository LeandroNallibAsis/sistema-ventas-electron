import React from 'react';

const StockBadge = ({ stock }) => {
    if (stock > 10) {
        return (
            <span className="badge badge-success">
                🟢 Disponible
            </span>
        );
    } else if (stock > 0) {
        return (
            <span className="badge badge-warning">
                🟡 Poco Stock
            </span>
        );
    } else {
        return (
            <span className="badge badge-danger">
                🔴 Sin Stock
            </span>
        );
    }
};

export default StockBadge;
