
import  { useState } from 'react';
import { PiMinusBold, PiPlusBold } from "react-icons/pi";
const QuantityInput = () => {
  const [quantity, setQuantity] = useState(1);

  const handleIncrease = () => {
    setQuantity((prev) => prev + 1);
  };

  const handleDecrease = () => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1)); // Không cho phép số âm
  };

  return (
    <div className="product__details__quantity ">
      <div className="flex items-center border-2 border-[#00653265] bg-white w-[140px] h-[48px] rounded">
        <button
          className="ml-[18px] mr-1  text-base font-normal text-gray-600  hover:bg-gray-300 focus:outline-none"
          onClick={handleDecrease}
        >
          <PiMinusBold />
        </button>
          <input
          type="text"
          value={quantity}
          readOnly
          className="w-16 mr-1 text-base font-normal text-gray-600 text-center  border-0 focus:outline-none"
        />
        <button
          className=" text-base font-normal text-gray-600  hover:bg-gray-300 focus:outline-none"
          onClick={handleIncrease}
        >
          <PiPlusBold />
        </button>
      </div>
    </div>
  );
};

export default QuantityInput;
