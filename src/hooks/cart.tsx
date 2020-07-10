import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // '@GoMarketplace:products',
      const cartProducts = await AsyncStorage.getItem(
        '@FundamentosRN:cartProducts',
      );

      if (cartProducts) {
        setProducts([...JSON.parse(cartProducts)]);
      }
    }

    loadProducts();
  }, []);

  const increment = useCallback(
    async id => {
      const updatedProducts = products.map(product => {
        if (product.id === id)
          return { ...product, quantity: product.quantity + 1 };
        return product;
      });

      setProducts(updatedProducts);

      await AsyncStorage.setItem(
        '@FundamentosRN:cartProducts',
        JSON.stringify(updatedProducts),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const updatedProducts = products.map(product =>
        product.id === id
          ? { ...product, quantity: product.quantity - 1 }
          : product,
      );

      console.log('updatedProducts', updatedProducts);

      const filtereddProducts = updatedProducts.filter(
        prod => prod.quantity > 0,
      );

      console.log('filtereddProducts', filtereddProducts);

      setProducts(filtereddProducts);

      await AsyncStorage.setItem(
        '@FundamentosRN:cartProducts',
        JSON.stringify(filtereddProducts),
      );
    },
    [products],
  );

  const addToCart = useCallback(
    async (product: Product) => {
      const hasProduct =
        products.findIndex((prod: Product) => prod.id === product.id) !== -1;

      if (hasProduct) {
        increment(product.id);
        return;
      }

      const updatedProducts = [...products, { ...product, quantity: 1 }];

      setProducts(updatedProducts);

      await AsyncStorage.setItem(
        '@FundamentosRN:cartProducts',
        JSON.stringify(updatedProducts),
      );
    },
    [products, increment],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
