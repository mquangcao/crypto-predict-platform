"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

type PriceUpdate = {
  symbol: string;
  price: number;
  ts: number;
};

let socket: Socket | null = null;

/** singleton socket, tránh mỗi component 1 connection */
function getSocket(): Socket {
  if (!socket) {
    socket = io("http://localhost:4002/price", {
      transports: ["websocket"],
    });
  }
  return socket;
}

/**
 * Hook:
 * - Kết nối tới WS namespace /price
 * - Nghe event 'price'
 * - Nếu symbol trùng với symbol đang chọn => cập nhật realtimePrice
 */
export function usePriceStream(symbol: string) {
  const [price, setPrice] = useState<number | null>(null);

  useEffect(() => {
    const s = getSocket();

    const handler = (update: PriceUpdate) => {
      if (update.symbol === symbol) {
        setPrice(update.price);
      }
    };

    s.on("price", handler);

    return () => {
      s.off("price", handler);
    };
  }, [symbol]);

  return price;
}
