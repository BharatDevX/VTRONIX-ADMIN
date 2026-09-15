import { useEffect, useState } from "react";

import {
  getDealers,
  getDoctors,
  getProducts,
  getRetailers,
} from "../services/master.service";

export function useMasters() {
  const [doctors, setDoctors] = useState([]);
  const [dealers, setDealers] = useState([]);
  const [retailers, setRetailers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadMasters() {
    try {
      const [doctorData, dealerData, retailerData, productData] =
        await Promise.all([
          getDoctors(),
          getDealers(),
          getRetailers(),
          getProducts(),
        ]);

      setDoctors(doctorData as any);
      setDealers(dealerData as any);
      setRetailers(retailerData as any);
      setProducts(productData as any);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMasters();
  }, []);

  return {
    loading,
    doctors,
    dealers,
    retailers,
    products,
    reload: loadMasters,
  };
}
