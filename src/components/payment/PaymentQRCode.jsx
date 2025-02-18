import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

const PaymentQRCode = ({ codeUrl, amount }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (codeUrl && canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, codeUrl, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });
    }
  }, [codeUrl]);

  return (
    <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-sm">
      <div className="mb-4 text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">微信扫码支付</h3>
        <p className="text-sm text-gray-500">
          请使用微信扫描二维码完成支付
        </p>
        <p className="text-xl font-semibold text-purple-600 mt-2">
          ¥{amount.toFixed(2)}
        </p>
      </div>
      
      <div className="bg-white p-3 rounded-lg shadow-sm">
        <canvas ref={canvasRef} />
      </div>
      
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          二维码有效期为5分钟，请尽快完成支付
        </p>
      </div>
    </div>
  );
};

export default PaymentQRCode; 